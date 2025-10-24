document.getElementById("extractBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractGoogleResults
  });
});

function extractGoogleResults() {
  // New structure used by Google as of 2025
  const resultBlocks = [...document.querySelectorAll('.MjjYud, .g')];

  const data = resultBlocks.map(block => {
    const link = block.querySelector('a')?.href || '';
    const title = block.querySelector('h3')?.innerText || '';
    const snippet = block.querySelector('.VwiC3b')?.innerText || '';
    return { title, link, snippet };
  }).filter(item => item.title && item.link); // keep only valid results

  if (data.length === 0) {
    alert("No results found. Please make sure you're on a Google search results page!");
    return;
  }

  const csv = "Title,Link,Snippet\n" +
    data.map(d =>
      `"${d.title.replace(/"/g, '""')}","${d.link}","${d.snippet.replace(/"/g, '""')}"`
    ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "google_results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
