// likeContent.js

function tryLikePost(attempt = 0) {
  // Support different LinkedIn UIs: feed posts, article pages, post permalinks
  const selectors = [
    'button[aria-label*="Like"][aria-pressed="false"]',
    'button[aria-label="Like"]',
    'button[aria-pressed="false"][data-control-name="like_toggle"]',
    'button[aria-pressed="false"][data-test-id="social-actions__reaction-toggle"]',
    'button.reaction-button[aria-pressed="false"]',
  ];

  let likeButton = null;
  for (const sel of selectors) {
    likeButton = document.querySelector(sel);
    if (likeButton) break;
  }

  // Expand more actions if needed
  if (!likeButton) {
    const moreActions = document.querySelector('button[aria-label*="React"], button[aria-label*="Like this post"]');
    if (moreActions) moreActions.click();
  }

  if (!likeButton) {
    // Try scrolling to trigger lazy rendering
    window.scrollBy(0, 300);
  }

  if (likeButton) {
    likeButton.click();
    console.log("👍 Post liked successfully!");
    return;
  }

  if (attempt < 15) {
    setTimeout(() => tryLikePost(attempt + 1), 1000);
  } else {
    console.warn("⚠️ Could not find Like button on this post.");
  }
}

// Give the page time to render dynamic UI
setTimeout(() => tryLikePost(), 2500);

// --- Commenting workflow injected dynamically in linkedinContent.js ---
