/**
 * Google Apps Script for LinkedIn Comments Logger (Updated with Status column)
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1FZovCeVwPpH8Z9WMPkdigei1c6GxjRTUaZ2Xo34MnoY/edit
 * 2. Make sure your sheet has three columns: Post Link | Comment | Status
 * 3. Go to Extensions → Apps Script
 * 4. Delete any existing code and paste this entire file
 * 5. Save the project (File → Save)
 * 6. Deploy as Web App (Deploy → New deployment)
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the Web app URL and add it to background.js
 */

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    const postLink = data.postLink || "";
    const comment = data.comment || "";
    const status = data.status || "pending";  // Default status is "pending"
    
    // Get the active spreadsheet and first sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append a new row with the data (Post Link, Comment, Status)
    sheet.appendRow([postLink, comment, status]);
    
    // Log for debugging
    Logger.log("Added row: " + postLink + " | Status: " + status);
    
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
        comment: "This is a test comment",
        status: "pending"
      })
    }
  };
  
  const response = doPost(testData);
  Logger.log(response.getContent());
}

/**
 * Helper function to set up the sheet with proper headers
 * Run this once to set up your sheet columns
 */
function setupSheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Set headers
  sheet.getRange(1, 1).setValue("Post Link");
  sheet.getRange(1, 2).setValue("Comment");
  sheet.getRange(1, 3).setValue("Status");
  
  // Format headers
  sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  sheet.getRange(1, 1, 1, 3).setBackground("#4285f4");
  sheet.getRange(1, 1, 1, 3).setFontColor("#ffffff");
  
  // Set column widths
  sheet.setColumnWidth(1, 400);  // Post Link
  sheet.setColumnWidth(2, 500);  // Comment
  sheet.setColumnWidth(3, 120);  // Status
  
  Logger.log("Sheet headers set up successfully!");
}

