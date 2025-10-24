// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // --- Handle CSV download request ---
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
      chrome.downloads.download(
        { url: dataUrl, filename: "google_results.csv", saveAs: false },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Data URL download failed:", chrome.runtime.lastError);

            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            chrome.downloads.download(
              { url: url, filename: "google_results.csv", saveAs: false },
              (id2) => {
                if (chrome.runtime.lastError) {
                  console.error("❌ Blob download failed:", chrome.runtime.lastError);
                } else {
                  console.log("✅ CSV downloaded (blob) id:", id2);
                }
                setTimeout(() => URL.revokeObjectURL(url), 10000);
              }
            );
          } else {
            console.log("✅ CSV downloaded successfully (data URL).");
          }
        }
      );
    } catch (err) {
      console.error("❌ Error while creating CSV download:", err);
    }
  }

  // --- Handle LinkedIn post liking ---
  if (message.action === "likePostsFromCSV") {
    const csvData = message.csvData;
    const urls = parseCSV(csvData);

    if (!urls.length) {
      console.warn("⚠️ No valid LinkedIn URLs found in CSV file.");
      return;
    }

    console.log(`✅ Found ${urls.length} LinkedIn URLs to like.`);

    urls.forEach((url, index) => {
      if (!url.includes("linkedin.com")) return;

      setTimeout(() => {
        chrome.tabs.create({ url: url, active: false }, (tab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === "complete") {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["likeContent.js"]
              });
              chrome.tabs.onUpdated.removeListener(listener);

              // Auto close tab after 8 seconds
              setTimeout(() => chrome.tabs.remove(tab.id), 8000);
            }
          });
        });
      }, index * 10000); // 10s gap between each post
    });
  }
});

// --- Helper function to parse CSV and extract LinkedIn URLs ---
function parseCSV(data) {
  const rows = data.split("\n");
  return rows
    .map((row) => {
      const cols = row.split(",");
      return cols[1]?.trim();
    })
    .filter((url) => url && url.startsWith("http"));
}
