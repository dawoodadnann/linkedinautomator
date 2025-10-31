/**
 * Alternative Google Apps Script for LinkedIn Comments Logger
 * This version uses GET parameters as fallback
 */

function doGet(e) {
  return doPost(e);
}

function doPost(e) {
  try {
    let data;
    
    // Try parsing POST data first
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } 
    // Fallback to GET parameters
    else if (e.parameter) {
      data = {
        postLink: e.parameter.postLink || "",
        comment: e.parameter.comment || ""
      };
    }
    else {
      throw new Error("No data received");
    }
    
    const postLink = data.postLink || "";
    const comment = data.comment || "";
    
    if (!postLink && !comment) {
      throw new Error("Both postLink and comment are empty");
    }
    
    // Get the active spreadsheet and first sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append a new row with the data
    sheet.appendRow([postLink, comment]);
    
    // Log for debugging
    Logger.log("Added row: " + postLink);
    
    // Return success response with CORS headers
    const output = ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data added successfully",
      timestamp: new Date().toISOString(),
      postLink: postLink,
      commentLength: comment.length
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    // Log error for debugging
    Logger.log("Error: " + error.toString());
    
    // Return error response
    const output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/**
 * Test function - Run this to authorize the script
 */
function testWrite() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow(["https://linkedin.com/test-123", "This is a test comment from authorization"]);
  Logger.log("✅ Authorization test successful! Check your sheet.");
}

