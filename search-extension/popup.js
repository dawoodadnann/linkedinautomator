document.getElementById("searchBtn").addEventListener("click", () => {
  const searchQuery =
    'site:linkedin.com/posts ("Looking for Agency" OR "Need a marketing agency" OR "Hiring agency")';

  // Open Google search in a new tab
  chrome.tabs.create({ url: "https://www.google.com/search?q=" + encodeURIComponent(searchQuery) });
});
