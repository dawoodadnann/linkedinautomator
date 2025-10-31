"""
LinkedIn Auto Commenter - Selenium Script
Reads approved posts from Google Sheets and comments on them automatically
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import gspread
from google.oauth2.service_account import Credentials

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

# Your Google Sheet ID (from the URL)
GOOGLE_SHEET_ID = "1FZovCeVwPpH8Z9WMPkdigei1c6GxjRTUaZ2Xo34MnoY"

# Path to your Google Service Account JSON file
SERVICE_ACCOUNT_FILE = "credentials.json"  # Update this path

# Sheet name (tab name in your Google Sheet)
SHEET_NAME = "Sheet1"  # Update if different

# ============================================================================
# GOOGLE SHEETS FUNCTIONS
# ============================================================================

def connect_to_google_sheets():
    """Connect to Google Sheets using service account credentials"""
    try:
        print("📊 Connecting to Google Sheets...")
        
        # Define the scope
        SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        
        # Authenticate using service account
        creds = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, 
            scopes=SCOPES
        )
        
        client = gspread.authorize(creds)
        sheet = client.open_by_key(GOOGLE_SHEET_ID).worksheet(SHEET_NAME)
        
        print("✅ Successfully connected to Google Sheets!")
        return sheet
    
    except Exception as e:
        print(f"❌ Error connecting to Google Sheets: {str(e)}")
        print("\n💡 Make sure you have:")
        print("   1. Created a service account in Google Cloud Console")
        print("   2. Downloaded the credentials.json file")
        print("   3. Shared your Google Sheet with the service account email")
        sys.exit(1)


def get_approved_posts(sheet):
    """Get all posts with 'approved' status from the sheet"""
    try:
        print("📋 Reading data from Google Sheets...")
        
        # Get all records as a list of dictionaries
        records = sheet.get_all_records()
        
        # Filter for approved posts
        approved_posts = [
            record for record in records 
            if str(record.get('Status', '')).lower() == 'approved'
        ]
        
        print(f"✅ Found {len(approved_posts)} approved posts to comment on")
        return approved_posts
    
    except Exception as e:
        print(f"❌ Error reading from Google Sheets: {str(e)}")
        sys.exit(1)


def update_post_status(sheet, post_link, new_status):
    """Update the status of a post in the sheet"""
    try:
        # Find all values in the sheet
        all_values = sheet.get_all_values()
        
        # Find the row with the matching post link
        for idx, row in enumerate(all_values[1:], start=2):  # Skip header row
            if row[0] == post_link:  # Post Link is in column A (index 0)
                sheet.update_cell(idx, 3, new_status)  # Status is in column C (3)
                print(f"✅ Updated status to '{new_status}' for post")
                return True
        
        print(f"⚠️  Could not find post link in sheet to update status")
        return False
    
    except Exception as e:
        print(f"❌ Error updating status: {str(e)}")
        return False


# ============================================================================
# SELENIUM AUTOMATION FUNCTIONS
# ============================================================================

def setup_driver():
    """Initialize Chrome WebDriver with options"""
    print("🚀 Starting Chrome browser...")
    
    options = webdriver.ChromeOptions()
    
    # Keep browser open and visible
    options.add_argument('--start-maximized')
    
    # Use your existing Chrome profile to maintain login (optional)
    # Uncomment and update path if you want to use your existing profile:
    # options.add_argument(r'user-data-dir=C:\Users\YourName\AppData\Local\Google\Chrome\User Data')
    # options.add_argument('profile-directory=Default')
    
    driver = webdriver.Chrome(options=options)
    return driver


def wait_for_manual_login(driver):
    """Open LinkedIn and wait for user to manually login"""
    print("\n" + "="*70)
    print("🔐 MANUAL LOGIN REQUIRED")
    print("="*70)
    
    driver.get("https://www.linkedin.com/feed/")
    
    print("\n📋 Instructions:")
    print("   1. Please log in to your LinkedIn account in the browser")
    print("   2. Complete any verification steps if needed")
    print("   3. Once you see your LinkedIn feed, return here")
    print("\n⏳ Waiting for login...")
    
    input("\n👉 Press ENTER after you have successfully logged in: ")
    
    # Verify we're logged in by checking for feed
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[role='main']"))
        )
        print("✅ Login verified! Starting automation...\n")
        return True
    except:
        print("⚠️  Could not verify login. Proceeding anyway...")
        return True


def navigate_to_post(driver, post_url):
    """Navigate to a specific LinkedIn post"""
    print(f"🔗 Opening post: {post_url}")
    driver.get(post_url)
    time.sleep(3)  # Wait for page to load


def post_comment(driver, comment_text):
    """Post a comment on the current LinkedIn post"""
    try:
        # Wait for the comment box to be clickable
        print("💬 Looking for comment box...")
        
        # Try different selectors for the comment box
        comment_selectors = [
            "div.ql-editor[contenteditable='true']",
            ".comments-comment-box__form-container [contenteditable='true']",
            "div[data-placeholder='Add a comment…']",
            ".ql-editor.ql-blank"
        ]
        
        comment_box = None
        for selector in comment_selectors:
            try:
                comment_box = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                if comment_box:
                    print(f"✅ Found comment box using selector: {selector}")
                    break
            except:
                continue
        
        if not comment_box:
            print("❌ Could not find comment box")
            return False
        
        # Click to activate the comment box
        driver.execute_script("arguments[0].scrollIntoView(true);", comment_box)
        time.sleep(1)
        comment_box.click()
        time.sleep(1)
        
        # Type the comment
        print(f"⌨️  Typing comment: {comment_text[:50]}...")
        comment_box.send_keys(comment_text)
        time.sleep(2)
        
        # Find and click the Post button
        print("🔍 Looking for Post button...")
        
        post_button_selectors = [
            "button.comments-comment-box__submit-button--cr",
            "button[aria-label='Post comment']",
            ".comments-comment-box__submit-button",
            "button[type='submit']"
        ]
        
        post_button = None
        for selector in post_button_selectors:
            try:
                post_button = driver.find_element(By.CSS_SELECTOR, selector)
                if post_button and post_button.is_enabled():
                    print(f"✅ Found Post button using selector: {selector}")
                    break
            except:
                continue
        
        if not post_button:
            print("❌ Could not find Post button")
            return False
        
        # Click the Post button
        print("📤 Posting comment...")
        post_button.click()
        time.sleep(3)
        
        print("✅ Comment posted successfully!")
        return True
    
    except TimeoutException:
        print("❌ Timeout: Could not find comment elements")
        return False
    
    except Exception as e:
        print(f"❌ Error posting comment: {str(e)}")
        return False


# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    """Main function to orchestrate the automation"""
    print("\n" + "="*70)
    print("🤖 LinkedIn Auto Commenter")
    print("="*70 + "\n")
    
    # Connect to Google Sheets
    sheet = connect_to_google_sheets()
    
    # Get approved posts
    approved_posts = get_approved_posts(sheet)
    
    if not approved_posts:
        print("\n⚠️  No approved posts found. Exiting...")
        return
    
    # Setup browser
    driver = setup_driver()
    
    try:
        # Wait for manual login
        wait_for_manual_login(driver)
        
        # Process each approved post
        print("\n" + "="*70)
        print(f"🚀 Starting to process {len(approved_posts)} posts")
        print("="*70 + "\n")
        
        for idx, post in enumerate(approved_posts, 1):
            post_link = post.get('Post Link', '')
            comment = post.get('Comment', '')
            
            print(f"\n{'='*70}")
            print(f"📌 Post {idx}/{len(approved_posts)}")
            print(f"{'='*70}")
            
            if not post_link or not comment:
                print("⚠️  Skipping: Missing post link or comment")
                continue
            
            # Navigate to post
            navigate_to_post(driver, post_link)
            
            # Post comment
            success = post_comment(driver, comment)
            
            # Update status in sheet
            if success:
                update_post_status(sheet, post_link, "Commented")
                print("✅ Post completed!")
            else:
                update_post_status(sheet, post_link, "Failed")
                print("❌ Post failed!")
            
            # Wait before next post
            if idx < len(approved_posts):
                wait_time = 5
                print(f"\n⏳ Waiting {wait_time} seconds before next post...")
                time.sleep(wait_time)
        
        print("\n" + "="*70)
        print("🎉 All posts processed!")
        print("="*70 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
    
    finally:
        print("\n🔚 Closing browser...")
        input("Press ENTER to close the browser and exit...")
        driver.quit()


if __name__ == "__main__":
    main()

