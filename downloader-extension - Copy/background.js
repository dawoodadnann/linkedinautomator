// background.js

// Configure a fallback key here if you don't want to use stored key
const DEFAULT_DEEPSEEK_API_KEY = "sk-eee1fb6f86764537ac4098a6e5bedb42";
let engagementRun = null; // tracks current engagement session

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // --- Handle CSV Download ---
  if (message.action === "downloadCSV") {
    const rows = message.data;
    if (!rows || !rows.length) return;

    console.log(`📦 Preparing CSV with ${rows.length} rows...`);

    let csvContent = "Title,Link,Snippet\n";
    rows.forEach((r) => {
      const clean = (text) =>
        `"${(text || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
      csvContent += `${clean(r.title)},${clean(r.link)},${clean(r.snippet)}\n`;
    });

    try {
      const dataUrl =
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      chrome.downloads.download({
        url: dataUrl,
        filename: "google_results.csv",
        saveAs: false,
      });
    } catch (err) {
      console.error("❌ Error while creating CSV:", err);
    }
  }

  // --- Handle LinkedIn Post Liking ---
  if (message.action === "likePostsFromCSV") {
    const csvData = message.csvData;
    const urls = parseCSV(csvData);

    if (!urls.length) {
      console.warn("⚠️ No valid LinkedIn URLs found in CSV file.");
      return;
    }

    console.log(`✅ Found ${urls.length} LinkedIn URLs to like.`);

    // Sequentially process posts one by one
    processLinkedInPostsSequentially(urls);
  }

  // --- Generate AI Comment for Post ---
  if (message.action === "generateCommentForPost") {
    const postText = (message.postText || "").slice(0, 4000);

    generateCommentWithDeepSeek(postText)
      .then((comment) => {
        sendResponse({ ok: true, comment });
      })
      .catch((err) => {
        console.error("❌ DeepSeek generation failed:", err);
        sendResponse({ ok: false, error: String(err && err.message || err) });
      });

    // Keep the message channel open for async response
    return true;
  }

  // --- Content script signals completion for current tab ---
  if (message.action === "linkedinTaskComplete") {
    // Handled per-tab inside processLinkedInPostsSequentially via local listeners
    // Intentionally empty here so the global handler doesn't interfere
  }

  // --- Open author profile and send connect request ---
  if (message.action === "openAuthorProfile" && message.profileUrl) {
    // Handled by processLinkedInPostsSequentially listener
  }

  // --- Stop engagement run immediately ---
  if (message.action === "stopEngagement") {
    stopCurrentEngagement(true);
  }
});

// --- Helpers: CSV parsing and URL normalization ---
function parseCSV(data) {
  if (!data) return [];
  const lines = data.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const urls = [];
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header row if present
    if (i === 0 && /(^|,)\s*link\s*(,|$)/i.test(line)) continue;

    const cols = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cols.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cols.push(current);

    // Our CSV schema is Title,Link,Snippet
    let rawLink = (cols[1] || "").trim();
    if (!rawLink) continue;

    let finalUrl = rawLink;

    // Unwrap Google redirect links
    finalUrl = unwrapGoogleRedirect(finalUrl);

    // Decode percent-encoding if present
    try {
      finalUrl = decodeURIComponent(finalUrl);
    } catch (e) {}

    // Ensure it has a protocol
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    // Only keep LinkedIn URLs
    if (!/linkedin\.com/i.test(finalUrl)) continue;

    // Remove tracking params, normalize
    finalUrl = cleanLinkedInUrl(finalUrl);

    // De-duplicate (ignore trailing slash)
    const key = finalUrl.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    urls.push(finalUrl);
  }

  return urls;
}

function unwrapGoogleRedirect(url) {
  try {
    const u = new URL(url);
    const host = u.hostname || "";
    if (host.endsWith("google.com") && u.pathname === "/url") {
      const q = u.searchParams.get("q") || u.searchParams.get("url");
      if (q) return q;
    }
    if (host.endsWith("google.com") && u.pathname.startsWith("/url")) {
      const q = u.searchParams.get("q") || u.searchParams.get("url");
      if (q) return q;
    }
    return url;
  } catch (e) {
    // Fallback: try to extract q= or url=
    const m = url.match(/[?&](?:q|url)=([^&]+)/i);
    if (m) {
      try { return decodeURIComponent(m[1]); } catch (_) { return m[1]; }
    }
    return url;
  }
}

function cleanLinkedInUrl(url) {
  try {
    const u = new URL(url);
    // Keep only origin + pathname for a stable like target
    return `${u.origin}${u.pathname}`;
  } catch (e) {
    return url;
  }
}

// --- Sequential LinkedIn Liking Logic ---
function processLinkedInPostsSequentially(urls) {
  // Initialize controller
  engagementRun = {
    active: true,
    cancelled: false,
    index: 0,
    urls,
    tabId: null,
    tabUpdateListener: null,
    doneListener: null,
    timeoutHandle: null,
    profileTabId: null,
    profileUpdateListener: null,
    profileDoneListener: null,
    profileTimeoutHandle: null,
    logs: [],
  };

  const openNextPost = () => {
    if (!engagementRun || engagementRun.cancelled) return;
    if (engagementRun.index >= engagementRun.urls.length) {
      console.log("✅ Finished liking all LinkedIn posts!");
      engagementRun = null;
      return;
    }

    const url = engagementRun.urls[engagementRun.index];
    console.log(`🔗 Opening post ${engagementRun.index + 1}/${engagementRun.urls.length}: ${url}`);

    chrome.tabs.create({ url, active: true }, (tab) => {
      if (!engagementRun || engagementRun.cancelled) {
        try { chrome.tabs.remove(tab.id); } catch (_) {}
        return;
      }
      const tabId = tab.id;
      engagementRun.tabId = tabId;

      // Wait for the LinkedIn post to fully load
      const listener = (updatedTabId, info) => {
        if (updatedTabId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          if (!engagementRun || engagementRun.cancelled) {
            try { chrome.tabs.remove(tabId); } catch (_) {}
            return;
          }

          // Inject the like script after a short delay
          setTimeout(() => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                files: ["linkedinContent.js"],
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.error("❌ Script injection failed:", chrome.runtime.lastError.message);
                } else {
                  console.log(`🚀 LinkedIn content script injected for post ${engagementRun.index + 1}`);
                }

                // Wait for content script to signal completion or timeout
                const timeoutMs = 120000; // 2 minutes timeout
                let timeoutHandle = setTimeout(() => {
                  console.warn("⏱️ Timed out waiting for approval/comment. Moving on...");
                  if (engagementRun && engagementRun.tabId === tabId) {
                    chrome.tabs.remove(tabId, () => {
                      if (!engagementRun || engagementRun.cancelled) return;
                      engagementRun.index++;
                      setTimeout(openNextPost, 2000);
                    });
                  }
                }, timeoutMs);

                engagementRun.timeoutHandle = timeoutHandle;

                const doneHandler = (msg, sndr) => {
                  if (!msg || !sndr || !sndr.tab || sndr.tab.id !== tabId) return;

                  if (msg.action === "linkedinTaskComplete") {
                    chrome.runtime.onMessage.removeListener(doneHandler);
                    if (engagementRun && engagementRun.timeoutHandle) clearTimeout(engagementRun.timeoutHandle);
                    if (!engagementRun || engagementRun.cancelled) {
                      try { chrome.tabs.remove(tabId); } catch (_) {}
                      return;
                    }
                    chrome.tabs.remove(tabId, () => {
                      console.log(`✅ Completed post ${engagementRun.index + 1}`);
                      engagementRun.index++;
                      if (engagementRun.index >= engagementRun.urls.length) finalizeAndDownloadLogs();
                      setTimeout(openNextPost, 2000);
                    });
                  }

                  // Content script requests to open author profile and connect
                  if (msg.action === "openAuthorProfile" && msg.profileUrl) {
                    chrome.runtime.onMessage.removeListener(doneHandler);
                    if (engagementRun && engagementRun.timeoutHandle) clearTimeout(engagementRun.timeoutHandle);
                    if (!engagementRun || engagementRun.cancelled) {
                      try { chrome.tabs.remove(tabId); } catch (_) {}
                      return;
                    }
                    // Open profile and send connect
                    openProfileAndConnect(msg.profileUrl, (profile) => {
                      if (profile && engagementRun) {
                        addProfileLog(profile);
                      }
                      // Close post tab and continue
                      chrome.tabs.remove(tabId, () => {
                        console.log(`✅ Completed post + connect ${engagementRun.index + 1}`);
                        engagementRun.index++;
                        if (engagementRun.index >= engagementRun.urls.length) finalizeAndDownloadLogs();
                        setTimeout(openNextPost, 2000);
                      });
                    });
                  }
                };
                chrome.runtime.onMessage.addListener(doneHandler);
                engagementRun.doneListener = doneHandler;
              }
            );
          }, 3000); // Wait 3s for LinkedIn to render buttons
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      engagementRun.tabUpdateListener = listener;
    });
  };

  openNextPost(); // Start sequence
}

function stopCurrentEngagement(downloadNow) {
  if (!engagementRun) return;
  engagementRun.cancelled = true;
  try {
    if (engagementRun.tabUpdateListener) chrome.tabs.onUpdated.removeListener(engagementRun.tabUpdateListener);
  } catch (_) {}
  try {
    if (engagementRun.doneListener) chrome.runtime.onMessage.removeListener(engagementRun.doneListener);
  } catch (_) {}
  try {
    if (engagementRun.timeoutHandle) clearTimeout(engagementRun.timeoutHandle);
  } catch (_) {}
  try {
    if (engagementRun.profileUpdateListener) chrome.tabs.onUpdated.removeListener(engagementRun.profileUpdateListener);
  } catch (_) {}
  try {
    if (engagementRun.profileDoneListener) chrome.runtime.onMessage.removeListener(engagementRun.profileDoneListener);
  } catch (_) {}
  try {
    if (engagementRun.profileTimeoutHandle) clearTimeout(engagementRun.profileTimeoutHandle);
  } catch (_) {}
  try {
    if (engagementRun.tabId) chrome.tabs.remove(engagementRun.tabId);
  } catch (_) {}
  try {
    if (engagementRun.profileTabId) chrome.tabs.remove(engagementRun.profileTabId);
  } catch (_) {}
  console.log("⏹️ Engagement stopped by user.");
  if (downloadNow) finalizeAndDownloadLogs();
  engagementRun = null;
}

// --- Open author profile tab and send connection request ---
function openProfileAndConnect(profileUrl, onComplete) {
  if (!engagementRun || engagementRun.cancelled) return onComplete && onComplete();
  console.log(`🔗 Opening profile: ${profileUrl}`);
  try {
    chrome.tabs.create({ url: profileUrl, active: true }, (tab) => {
      if (!engagementRun || engagementRun.cancelled) {
        try { chrome.tabs.remove(tab.id); } catch (_) {}
        return onComplete && onComplete();
      }
      const pTabId = tab.id;
      engagementRun.profileTabId = pTabId;

      const updateListener = (updatedTabId, info) => {
        if (updatedTabId === pTabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(updateListener);

          setTimeout(() => {
            chrome.scripting.executeScript(
              { target: { tabId: pTabId }, files: ["connectContent.js"] },
              () => {
                if (chrome.runtime.lastError) {
                  console.error("❌ Connect script injection failed:", chrome.runtime.lastError.message);
                  safeCloseProfileAndComplete(onComplete);
                  return;
                }

                const timeoutMs = 90000;
                engagementRun.profileTimeoutHandle = setTimeout(() => {
                  console.warn("⏱️ Timed out connecting. Moving on...");
                  safeCloseProfileAndComplete(onComplete);
                }, timeoutMs);

                const done = (msg, sndr) => {
                  if (msg && msg.action === "linkedinConnectComplete" && sndr.tab && sndr.tab.id === pTabId) {
                    chrome.runtime.onMessage.removeListener(done);
                    if (engagementRun && engagementRun.profileTimeoutHandle) clearTimeout(engagementRun.profileTimeoutHandle);
                    const profile = msg.profile || null;
                    console.log(`✅ Connect request sent to: ${profile ? profile.url : profileUrl}`);
                    safeCloseProfileAndComplete(() => onComplete && onComplete(profile));
                  }
                };
                chrome.runtime.onMessage.addListener(done);
                engagementRun.profileDoneListener = done;
              }
            );
          }, 2000);
        }
      };
      chrome.tabs.onUpdated.addListener(updateListener);
      engagementRun.profileUpdateListener = updateListener;
    });
  } catch (e) {
    console.error("Connect flow error:", e);
    safeCloseProfileAndComplete(onComplete);
  }
}

function safeCloseProfileAndComplete(onComplete) {
  try {
    if (engagementRun && engagementRun.profileTabId) {
      const id = engagementRun.profileTabId;
      engagementRun.profileTabId = null;
      chrome.tabs.remove(id, () => onComplete && onComplete());
      return;
    }
  } catch (_) {}
  onComplete && onComplete();
}

function addProfileLog(profile) {
  if (!engagementRun) return;
  try {
    const entry = {
      url: profile.url || "",
      name: (profile.name || "").replace(/\s+/g, " ").trim(),
      headline: (profile.headline || "").replace(/\s+/g, " ").trim(),
      status: "connected",
    };
    engagementRun.logs.push(entry);
    console.log(`📝 Logged profile: ${entry.url}`);
  } catch (_) {}
}

function finalizeAndDownloadLogs() {
  if (!engagementRun) return;
  const logs = engagementRun.logs || [];
  if (!logs.length) {
    console.log("No connection requests sent.");
    return;
  }

  let csv = "Profile URL,Name,Headline,Status\n";
  for (const r of logs) {
    const clean = (s) => '"' + String(s || "").replace(/"/g, '""') + '"';
    csv += `${clean(r.url)},${clean(r.name)},${clean(r.headline)},${clean(r.status)}\n`;
  }
  try {
    const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    chrome.downloads.download({ url: dataUrl, filename: "linkedin_connection_requests.csv", saveAs: false });
    console.log(`✅ Downloaded ${logs.length} connection requests`);
  } catch (e) {
    console.error("Failed to download CSV:", e);
  }
}

// --- DeepSeek integration ---
async function generateCommentWithDeepSeek(postText) {
  const apiKey = await getDeepseekApiKey();
  if (!apiKey) {
    throw new Error("Missing DeepSeek API key. Set DEFAULT_DEEPSEEK_API_KEY in background.js.");
  }

  const endpoint = "https://api.deepseek.com/v1/chat/completions";

  const systemPrompt =
    "You are a concise, friendly social media assistant for a digital marketing agency. " +
    "Write a short, context-aware comment (1–2 sentences) that engages with the post content. " +
    "Naturally mention that we are a digital marketing agency, avoid sounding spammy, and never use emojis. " +
    "If the post asks for help or recommendations, gently offer to chat.";

  const userPrompt = `Post content:\n\n${postText}\n\nWrite one short, professional comment.`;

  const body = {
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 120,
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek API error: ${resp.status} ${text}`);
  }

  const json = await resp.json();
  const comment = json.choices?.[0]?.message?.content?.trim();
  if (!comment) throw new Error("No comment generated");
  return comment;
}

function getStoredKey(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (res) => resolve(res[key]));
  });
}

async function getDeepseekApiKey() {
  try {
    const stored = await getStoredKey("deepseekApiKey");
    return stored || DEFAULT_DEEPSEEK_API_KEY;
  } catch (_) {
    return DEFAULT_DEEPSEEK_API_KEY;
  }
}
