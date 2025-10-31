# Google Sheets Setup Instructions

This extension requires a Google Apps Script Web App to write comments to your Google Sheet.

## Step 1: Open Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1FZovCeVwPpH8Z9WMPkdigei1c6GxjRTUaZ2Xo34MnoY/edit?gid=0#gid=0
2. Make sure it has two columns: **Post Link** and **Comment** (in row 1)

## Step 2: Create the Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy and paste the following code:

```javascript
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    const postLink = data.postLink || "";
    const comment = data.comment || "";
    
    // Get the active spreadsheet and first sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append a new row with the data
    sheet.appendRow([postLink, comment]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data added successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾 icon) and give your project a name (e.g., "LinkedIn Comments Logger")

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: LinkedIn Comments (or any name you want)
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. You may need to authorize the app:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to [Your Project Name] (unsafe)**
   - Click **Allow**
6. Copy the **Web app URL** (it should look like: `https://script.google.com/macros/s/...../exec`)

## Step 4: Configure the Extension

1. Open `background.js` in your extension folder
2. Find this line near the top:
   ```javascript
   const GOOGLE_SHEETS_WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your Web app URL from Step 3
4. Save the file

## Step 5: Reload the Extension

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **Reload** button (🔄)

## Done!

Your extension is now configured to write comments to your Google Sheet. When you run the extension:
1. It will like each LinkedIn post
2. Generate an AI comment using DeepSeek
3. Add the post link and comment to your Google Sheet
4. Move to the next post

## Troubleshooting

- **If comments are not appearing in the sheet**: 
  - Check the browser console (F12) for error messages
  - Make sure you copied the correct Web app URL
  - Try redeploying the Apps Script (Deploy → Manage deployments → Edit → New version)

- **If you get authorization errors**:
  - Make sure you set "Who has access" to "Anyone" in the deployment settings
  - Try reauthorizing the script

- **If the sheet has the wrong columns**:
  - Make sure the first row has exactly: `Post Link` and `Comment` (column A and B)

