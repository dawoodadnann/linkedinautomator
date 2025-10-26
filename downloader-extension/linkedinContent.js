// linkedinContent.js

(function () {
  const MAX_EXTRACT_CHARS = 2000;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          const err = chrome.runtime.lastError;
          if (err) return reject(err);
          resolve(response);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function likePost() {
    const selectors = [
      'button[aria-label*="Like"][aria-pressed="false"]',
      'button[aria-label="Like"]',
      'button[aria-pressed="false"][data-control-name="like_toggle"]',
      'button[aria-pressed="false"][data-test-id="social-actions__reaction-toggle"]',
      'button.reaction-button[aria-pressed="false"]',
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        btn.click();
        return true;
      }
    }
    return false;
  }

  function extractPostText() {
    // Try several common containers
    const containers = [
      'article',
      'div.feed-shared-update-v2',
      'div.update-components-actor__container',
      'div.comments-comments-list',
      'div.core-rail',
    ];
    let text = '';
    for (const sel of containers) {
      const el = document.querySelector(sel);
      if (el) {
        text = el.innerText || '';
        if (text && text.trim().length > 80) break;
      }
    }
    text = (text || '').replace(/\s+/g, ' ').trim();
    return text.slice(0, MAX_EXTRACT_CHARS);
  }

  function ensureCommentBox() {
    // Try to focus/open the comment editor
    const openers = [
      'button.comment-button',
      'button[aria-label*="Comment"]',
      'button[aria-label="Comment"]',
    ];
    for (const sel of openers) {
      const btn = document.querySelector(sel);
      if (btn) { btn.click(); break; }
    }
  }

  function getCommentTextarea() {
    // LinkedIn uses contenteditable div for comments
    const editors = [
      'div.comments-comment-box__editor[contenteditable="true"]',
      'div.editor-content[contenteditable="true"]',
      'div[role="textbox"][contenteditable="true"]',
    ];
    for (const sel of editors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findSubmitButton() {
    const selectors = [
      'button.comments-comment-box__submit-button:not([disabled])',
      'button[aria-label="Post comment"]:not([disabled])',
      'button[aria-label*="Post"]:not([disabled])',
      'button[aria-label="Comment"]:not([disabled])',
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn && isVisible(btn)) return btn;
    }
    // Fallback: find a visible button with text "Comment" or "Post"
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const b of buttons) {
      const text = (b.innerText || '').trim().toLowerCase();
      if (!b.disabled && isVisible(b) && (text === 'comment' || text === 'post')) return b;
    }
    return null;
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }

  function findSubmitNearEditor(editor) {
    if (!editor) return null;
    const container = editor.closest('div.comments-comment-box, form') || editor.parentElement;
    if (!container) return null;
    const trySelectors = [
      'button.comments-comment-box__submit-button',
      'button[aria-label="Post comment"]',
      'button[aria-label*="Post"]',
      'button[aria-label="Comment"]',
    ];
    for (const sel of trySelectors) {
      const btn = container.querySelector(sel);
      if (btn && isVisible(btn) && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true') return btn;
    }
    // Text fallback scoped to container
    const buttons = Array.from(container.querySelectorAll('button'));
    for (const b of buttons) {
      const text = (b.innerText || '').trim().toLowerCase();
      if (isVisible(b) && !b.disabled && b.getAttribute('aria-disabled') !== 'true' && (text === 'comment' || text === 'post')) {
        return b;
      }
    }
    return null;
  }

  function clickLikeHuman(el) {
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

  function triggerEditorInput(editor, text) {
    try {
      const inputEvt = new InputEvent('input', { bubbles: true, cancelable: true, data: text });
      editor.dispatchEvent(inputEvt);
    } catch (_) {
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    editor.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
  }

  function injectApprovalUI(proposedComment) {
    // Remove existing if any
    const existing = document.getElementById('dm-approval-banner');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'dm-approval-banner';
    wrapper.style.position = 'fixed';
    wrapper.style.right = '16px';
    wrapper.style.bottom = '16px';
    wrapper.style.zIndex = '2147483647';
    wrapper.style.maxWidth = '520px';
    wrapper.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    wrapper.style.borderRadius = '8px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.background = '#fff';
    wrapper.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial';

    wrapper.innerHTML = `
      <div style="padding:12px 16px; background:#0a66c2; color:#fff; font-weight:600;">Proposed Comment</div>
      <div style="padding:12px 16px; max-height:160px; overflow:auto; white-space:pre-wrap;">${escapeHtml(proposedComment)}</div>
      <div style="display:flex; gap:8px; padding:12px 16px; border-top:1px solid #eee;">
        <button id="dm-approve" style="flex:1; padding:8px 12px; background:#0a66c2; color:#fff; border:none; border-radius:6px; cursor:pointer;">Approve & Comment</button>
        <button id="dm-reject" style="flex:1; padding:8px 12px; background:#aaa; color:#fff; border:none; border-radius:6px; cursor:pointer;">Skip Comment</button>
      </div>
    `;

    document.body.appendChild(wrapper);

    return {
      onApprove: (cb) => document.getElementById('dm-approve').addEventListener('click', cb),
      onReject: (cb) => document.getElementById('dm-reject').addEventListener('click', cb),
      destroy: () => wrapper.remove(),
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function main() {
    // Step 1: Like
    for (let i = 0; i < 6; i++) {
      if (likePost()) break;
      await sleep(800);
      window.scrollBy(0, 200);
    }

    // Step 2: Extract post text for AI
    const postText = extractPostText();

    // Step 3: Ask background to generate a comment
    let comment = '';
    try {
      const resp = await sendMessageAsync({ action: 'generateCommentForPost', postText });
      if (resp && resp.ok) comment = (resp.comment || '').trim();
    } catch (e) {
      // ignore
    }

    if (!comment) {
      // Nothing to comment. Signal completion and exit after a short delay
      await sleep(500);
      chrome.runtime.sendMessage({ action: 'linkedinTaskComplete' });
      return;
    }

    // Step 4: Show approval UI
    const ui = injectApprovalUI(comment);

    // Step 5: Wire actions
    ui.onReject(async () => {
      ui.destroy();
      await sleep(300);
      chrome.runtime.sendMessage({ action: 'linkedinTaskComplete' });
    });

    ui.onApprove(async () => {
      try {
        ensureCommentBox();
        await sleep(600);
        const box = getCommentTextarea();
        if (box) {
          // Set comment text in contenteditable
          box.focus();
          // Clear existing and insert text
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, comment);
          triggerEditorInput(box, comment);

          await sleep(400);

          // Submit comment
          let submitBtn = findSubmitNearEditor(box) || findSubmitButton();
          if (submitBtn) {
            clickLikeHuman(submitBtn);
          } else {
            // Fallback: press Enter in the editor
            const down = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
            const press = new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', bubbles: true });
            const up = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true });
            box.dispatchEvent(down);
            box.dispatchEvent(press);
            box.dispatchEvent(up);
          }
          // Give LinkedIn time to post before we close the tab
          await sleep(2500);
        }
      } catch (e) {
        // ignore
      } finally {
        ui.destroy();
        await sleep(500);
        chrome.runtime.sendMessage({ action: 'linkedinTaskComplete' });
      }
    });
  }

  // Start
  main();
})();


