chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      // Try a data URL first (reliable for small CSVs)
      const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      chrome.downloads.download(
        { url: dataUrl, filename: "google_results.csv", saveAs: false },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("Download via data URL failed:", chrome.runtime.lastError);

            // Fallback to blob URL if data URL is rejected or too long
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            chrome.downloads.download(
              { url: url, filename: "google_results.csv", saveAs: false },
              (id2) => {
                if (chrome.runtime.lastError) {
                  console.error("Download via blob URL failed:", chrome.runtime.lastError);
                } else {
                  console.log("✅ CSV downloaded (blob) id:", id2);
                }

                // Revoke the blob URL after a short delay to ensure download started
                setTimeout(() => {
                  try {
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    /* ignore */
                  }
                }, 10000);
              }
            );
          } else {
            console.log("✅ CSV downloaded (data URL) id:", downloadId);
          }
        }
      );
    } catch (err) {
      console.error("Exception while preparing download:", err);
    }
  }
});
