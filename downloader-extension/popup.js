// popup.js

// --- Download Google Results ---
document.getElementById("scrape").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      alert("No active tab found.");
      return;
    }

    // Check if it's a Google search results page
    if (!tab.url.includes("google.com/search")) {
      alert("Please open a Google search results page before running this.");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }, () => {
      if (chrome.runtime.lastError) {
        alert("Error injecting content script: " + chrome.runtime.lastError.message);
      } else {
        alert("✅ Content script injected — downloading Google results...");
      }
    });
  });
});

// --- Like LinkedIn Posts from CSV ---
document.getElementById("likePosts").addEventListener("click", () => {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("⚠️ Please select a CSV file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const csvContent = e.target.result;
    chrome.runtime.sendMessage({ action: "likePostsFromCSV", csvData: csvContent });
  };
  reader.readAsText(file);
});

// --- Stop Engagement ---
document.getElementById("stopEngagement").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stopEngagement" });
  alert("⏹️ Stopping engagement run...");
});

// DeepSeek key UI removed: use DEFAULT_DEEPSEEK_API_KEY in background.js