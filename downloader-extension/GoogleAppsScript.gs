/**
 * Google Apps Script for LinkedIn Comments Logger
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1FZovCeVwPpH8Z9WMPkdigei1c6GxjRTUaZ2Xo34MnoY/edit
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Save the project (File → Save)
 * 5. Deploy as Web App (Deploy → New deployment)
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web app URL and add it to background.js
 */

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
    
    // Log for debugging
    Logger.log("Added row: " + postLink);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data added successfully",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log error for debugging
    Logger.log("Error: " + error.toString());
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * Run this from the Apps Script editor to test
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        postLink: "https://www.linkedin.com/posts/test-123",
        comment: "This is a test comment"
      })
    }
  };
  
  const response = doPost(testData);
  Logger.log(response.getContent());
}

