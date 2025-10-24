// likeContent.js
function likePost() {
  console.log("👍 Trying to like post...");

  // LinkedIn post like buttons have multiple patterns
  const selectors = [
    'button[aria-label*="Like"]',
    'button[aria-pressed="false"][data-control-name*="like"]',
    'button[aria-pressed="false"][data-test-like-button]',
  ];

  for (const sel of selectors) {
    const btn = document.querySelector(sel);
    if (btn) {
      btn.click();
      console.log("✅ Post liked!");
      return;
    }
  }

  console.warn("⚠️ No like button found on this page.");
}

// Run after DOM fully loaded
setTimeout(() => {
  likePost();
}, 5000);
