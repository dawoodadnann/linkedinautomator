function extractResults() {
  const results = [];
  const selectors = ["div.g", "div.tF2Cxc", "div.MjjYud"];
  let items = [];
  for (const sel of selectors) {
    const found = document.querySelectorAll(sel);
    if (found.length > 0) {
      items = found;
      break;
    }
  }

  items.forEach((item) => {
    const title = item.querySelector("h3")?.innerText?.trim() || "";
    const link = item.querySelector("a")?.href?.trim() || "";
    const snippet =
      item.querySelector(".VwiC3b")?.innerText?.trim() ||
      item.querySelector(".lyLwlc")?.innerText?.trim() ||
      "";

    if (title && link && link.startsWith("http")) {
      results.push({ title, link, snippet });
    }
  });
  return results;
}

async function waitForResults() {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = setInterval(() => {
      const items = extractResults();
      if (items.length > 0 || attempts > 20) {
        clearInterval(check);
        resolve(items);
      }
      attempts++;
    }, 500);
  });
}

(async () => {
  console.log('✅ Downloader content script running...');
  const results = await waitForResults();

  if (results && results.length > 0) {
    console.log(`✅ Found ${results.length} Google results`);
    chrome.runtime.sendMessage({ action: 'downloadCSV', data: results });
  } else {
    alert('⚠️ No results found on this page. Make sure you are on a Google search results page.');
  }
})();
