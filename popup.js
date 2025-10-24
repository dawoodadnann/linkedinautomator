document.getElementById("searchBtn").addEventListener("click", () => {
  const searchQuery =
    'site:linkedin.com/posts ("Looking for Agency" OR "Need a marketing agency" OR "Hiring agency")';

  // Open Google search in a new tab
  chrome.tabs.create(
    { url: "https://www.google.com/search?q=" + encodeURIComponent(searchQuery) },
    (tab) => {
      // Wait 4 seconds, then inject content script
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      }, 4000);
    }
  );
});

// Added button to like posts from CSV
const likePostsBtn = document.createElement('button');
likePostsBtn.id = 'likePostsBtn';
likePostsBtn.innerText = 'Like Posts from CSV';

// Append the button to the popup
document.body.appendChild(likePostsBtn);

likePostsBtn.addEventListener("click", () => {
  const csvUrl = "path/to/your/google_results.csv"; // Update with the actual path to your CSV
  chrome.runtime.sendMessage({ action: "likePostsFromCSV", csvUrl: csvUrl });
});
