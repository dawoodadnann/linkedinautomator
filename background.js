chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadCSV") {
    const rows = message.data;
    if (!rows || !rows.length) return;

    let csvContent = "Title,Link,Snippet\n";
    rows.forEach((r) => {
      const clean = (text) =>
        `"${text.replace(/"/g, '""').replace(/\n/g, " ")}"`;
      csvContent += `${clean(r.title)},${clean(r.link)},${clean(r.snippet)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: "google_results.csv",
      saveAs: true,
    });
  }
});
