// connectContent.js

(async function () {
  /******************** Utility Functions ********************/
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    const st = window.getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden';
  }

  function clickHuman(el) {
    try {
      el.focus();
      const rect = el.getBoundingClientRect();
      const opts = { bubbles: true, cancelable: true, clientX: rect.left + 4, clientY: rect.top + 4 };
      el.dispatchEvent(new MouseEvent('mousedown', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
      el.dispatchEvent(new MouseEvent('click', opts));
    } catch (_) {
      el.click();
    }
  }

  /******************** Step 1: Handle when on a LinkedIn Post Page ********************/
  async function waitForAuthorLink(timeout = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const selList = [
        'a.app-aware-link[href*="/in/"]',
        'a[href*="/in/"][data-entity-hovercard-id]',
        'a[href*="/in/"]:not([tabindex="-1"])'
      ];
      for (const sel of selList) {
        const link = document.querySelector(sel);
        if (link && link.offsetParent !== null) return link;
      }
      await sleep(500);
    }
    return null;
  }

  function scrollIntoViewIfNeeded(el) {
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function openProfile(link) {
    const profileUrl = link.href;
    if (profileUrl) {
      console.log("Opening profile:", profileUrl);
      window.open(profileUrl, "_blank");
    } else {
      console.log("Profile link missing href");
    }
  }

  /******************** Step 2: Profile Page Connection Logic ********************/
  function extractProfileInfo() {
    const nameSel = ['h1.text-heading-xlarge', 'h1'];
    const headlineSel = ['div.text-body-medium.break-words', 'div.top-card-layout__headline'];

    let name = '';
    for (const s of nameSel) {
      const el = document.querySelector(s);
      if (el && el.innerText) { name = el.innerText.trim(); break; }
    }

    let headline = '';
    for (const s of headlineSel) {
      const el = document.querySelector(s);
      if (el && el.innerText) { headline = el.innerText.trim(); break; }
    }

    const url = location.href;
    return { url, name, headline };
  }

  async function waitForButton(selectors, timeout = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn && isVisible(btn) && !btn.disabled) return btn;
      }
      await sleep(500);
    }
    return null;
  }

  function findPrimaryConnect() {
    const items = document.querySelectorAll('div[role="menu"] li button, div[role="menu"] li a');
    for (const item of items) {
      const t = (item.innerText || '').trim().toLowerCase();
      if (t.includes('connect') || t.includes('invite')) return item;
    }
    return null;
  }

  async function waitForSendButton(timeout = 6000) {
    const sendSelectors = [
      'button[aria-label^="Send"]',
      'button[aria-label^="Done"]',
      'button[aria-label^="Submit"]',
      'button.artdeco-button--primary'
    ];
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const sel of sendSelectors) {
        const sendBtn = document.querySelector(sel);
        if (sendBtn && isVisible(sendBtn)) return sendBtn;
      }
      await sleep(500);
    }
    return null;
  }

  async function sendInviteFlow() {
    // Find connect button
    let btn = await waitForButton([
      'button[aria-label*="Connect"]',
      'button[aria-label^="Invite"]',
      'button[aria-label*="Invite"]',
      'button[aria-label*="More"]',
      'button[aria-label*="Follow"]'
    ]);

    if (!btn) {
      console.log("No connect-like button found on this profile.");
      return;
    }

    if (/more/i.test(btn.getAttribute('aria-label') || '')) {
      clickHuman(btn);
      await sleep(600);
      const connectItem = findPrimaryConnect();
      if (connectItem) btn = connectItem;
    }

    clickHuman(btn);

    const sendBtn = await waitForSendButton();
    if (sendBtn) clickHuman(sendBtn);

    await sleep(800);
    const profile = extractProfileInfo();
    chrome.runtime.sendMessage({ action: 'linkedinConnectComplete', profile });
  }

  /******************** Step 3: Decide What Page We’re On ********************/
  const isPostPage = /linkedin\.com\/feed\/update/.test(window.location.href);
  const isProfilePage = /linkedin\.com\/in\//.test(window.location.href);

  if (isPostPage) {
    console.log("Detected LinkedIn Post Page – locating author profile...");
    const authorLink = await waitForAuthorLink(8000);
    if (authorLink) {
      scrollIntoViewIfNeeded(authorLink);
      await sleep(1000);
      openProfile(authorLink);
    } else {
      console.log("❌ Author profile link not found – skipping this post.");
    }
  } else if (isProfilePage) {
    console.log("Detected LinkedIn Profile Page – attempting connection...");
    setTimeout(() => { sendInviteFlow(); }, 2000);
  } else {
    console.log("Neither a post nor a profile page – no action taken.");
  }

})();
