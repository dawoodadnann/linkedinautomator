# LinkedIn Auto-Engagement Extension

A Chrome extension that automatically likes LinkedIn posts and logs AI-generated comments to a Google Sheet.

## Features

✅ **Automatically like LinkedIn posts** from a CSV file  
✅ **Generate contextual comments** using DeepSeek AI  
✅ **Log comments to Google Sheet** for review before posting  
✅ **Stop button** to pause the process at any time  
✅ **Download Google search results** to CSV  

## Quick Start

### 1. Set Up Google Apps Script (5 minutes)

**Step 1:** Open your Google Sheet  
https://docs.google.com/spreadsheets/d/1FZovCeVwPpH8Z9WMPkdigei1c6GxjRTUaZ2Xo34MnoY/edit

**Step 2:** Make sure your sheet has these column headers in row 1:
- Column A: `Post Link`
- Column B: `Comment`

**Step 3:** Go to **Extensions** → **Apps Script**

**Step 4:** Copy the code from `GoogleAppsScript.gs` (in this folder) and paste it into the Apps Script editor

**Step 5:** Save the project (File → Save or Ctrl+S)

**Step 6:** Deploy as Web App:
1. Click **Deploy** → **New deployment**
2. Click ⚙️ next to "Select type" → Choose **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Authorize** the app if prompted
6. **Copy the Web app URL** (looks like: `https://script.google.com/macros/s/.../exec`)

**Step 7:** Add the URL to `background.js`:
```javascript
const GOOGLE_SHEETS_WEB_APP_URL = "YOUR_WEB_APP_URL_HERE";
```

**Step 8:** Reload the extension in Chrome:
- Go to `chrome://extensions/`
- Find this extension
- Click the Reload button (🔄)

### 2. Prepare Your CSV File

Create a CSV file with LinkedIn post URLs. Format:
```csv
Title,Link,Snippet
"Post Title","https://www.linkedin.com/posts/username-123456789/","Post snippet"
"Another Post","https://www.linkedin.com/posts/username-987654321/","Another snippet"
```

**Tip:** You can use the built-in Google Search scraper to generate this CSV automatically!

### 3. Run the Extension

1. Click the extension icon in Chrome
2. Click **"Like Posts & Add Comments to Sheet"**
3. Select your CSV file
4. Watch as the extension:
   - Opens each post
   - Likes it
   - Generates a comment
   - Adds it to your Google Sheet
   - Moves to the next post

### 4. Stop at Any Time

Click the **"Stop Process"** button to pause the automation.

## How It Works

```
┌─────────────────┐
│  Upload CSV     │
│  with LinkedIn  │
│  Post URLs      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Open Each Post │◄──────┐
│  Sequentially   │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  Like the Post  │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  Extract Post   │       │
│  Content        │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  Generate       │       │
│  Comment with   │       │
│  DeepSeek AI    │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  Add to Google  │       │
│  Sheet          │       │
│  (Post Link +   │       │
│   Comment)      │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  Close Tab      │       │
└────────┬────────┘       │
         │                │
         ▼                │
      More posts? ────────┘
         │ No
         ▼
┌─────────────────┐
│  Complete!      │
└─────────────────┘
```

## Files

- **`manifest.json`** - Extension configuration
- **`background.js`** - Main logic for processing posts and API calls
- **`linkedinContent.js`** - Content script that runs on LinkedIn pages
- **`popup.html`** - Extension popup interface
- **`popup.js`** - Popup logic
- **`GoogleAppsScript.gs`** - Script to deploy to Google Sheets
- **`GOOGLE_SHEETS_SETUP.md`** - Detailed setup instructions
- **`CHANGES_SUMMARY.md`** - What changed in this version

## Configuration

### DeepSeek API Key
Already configured in `background.js`:
```javascript
const DEFAULT_DEEPSEEK_API_KEY = "sk-eee1fb6f86764537ac4098a6e5bedb42";
```

### Google Sheets Web App URL
Add your URL in `background.js`:
```javascript
const GOOGLE_SHEETS_WEB_APP_URL = "YOUR_WEB_APP_URL_HERE";
```

### Google Sheet Format
Your sheet should have two columns:
| Post Link | Comment |
|-----------|---------|
| https://... | This is a great post... |
| https://... | Thanks for sharing... |

## Troubleshooting

### Comments not appearing in the sheet?
- Check browser console (F12) for errors
- Verify the Web App URL is correct in `background.js`
- Make sure the Google Apps Script is deployed with "Who has access: Anyone"
- Try redeploying the script (Deploy → Manage deployments → Edit → New version)

### Extension not loading?
- Go to `chrome://extensions/`
- Enable "Developer mode" (top right)
- Check for errors in the extension
- Try reloading the extension

### AI comments not generating?
- Check the DeepSeek API key in `background.js`
- Check browser console for API errors
- Make sure you have internet connection

### Like button not working?
- LinkedIn may have updated their UI
- Check browser console for errors
- The script tries multiple selectors to find the like button

## Support

For detailed setup instructions, see:
- **`GOOGLE_SHEETS_SETUP.md`** - Step-by-step Google Apps Script setup
- **`CHANGES_SUMMARY.md`** - What changed from previous version

## Privacy & Security

- Your DeepSeek API key is stored in `background.js` (local to your machine)
- The Google Apps Script runs under your Google account
- No data is sent to third parties except:
  - DeepSeek API (for comment generation)
  - Google Sheets (for logging comments)
- The extension requires permissions for:
  - LinkedIn (to like posts and extract content)
  - DeepSeek API (to generate comments)
  - Google Apps Script (to log comments to your sheet)

## License

This is a personal tool. Use responsibly and in accordance with LinkedIn's Terms of Service.

---

**Questions?** Check the `GOOGLE_SHEETS_SETUP.md` file for detailed instructions.

