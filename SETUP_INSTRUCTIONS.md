# LinkedIn Auto Commenter - Setup Instructions

This Python script uses Selenium to automatically comment on approved LinkedIn posts from your Google Sheet.

## 📋 Prerequisites

1. Python 3.7 or higher installed
2. Google Chrome browser installed
3. A Google Cloud Project with Sheets API enabled
4. Your Google Sheet with columns: **Post Link**, **Comment**, **Status**

---

## 🚀 Step-by-Step Setup

### Step 1: Install Python Dependencies

Open a terminal/command prompt in this folder and run:

```bash
pip install -r requirements.txt
```

### Step 2: Install Chrome WebDriver

The script uses Selenium with Chrome. Make sure you have Chrome installed, then:

**Option A: Automatic (Recommended)**
```bash
pip install webdriver-manager
```

**Option B: Manual**
1. Check your Chrome version: `chrome://settings/help`
2. Download matching ChromeDriver from: https://chromedriver.chromium.org/downloads
3. Add ChromeDriver to your system PATH

### Step 3: Set Up Google Sheets API Access

#### 3.1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### 3.2: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - **Service account name**: linkedin-commenter
   - **Service account ID**: (auto-generated)
4. Click "Create and Continue"
5. Skip the optional steps (you can leave roles empty for this use case)
6. Click "Done"

#### 3.3: Download Credentials

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. Save the downloaded file as `credentials.json` in this folder

#### 3.4: Share Your Google Sheet

1. Open your Google Sheet
2. Copy the **service account email** from the JSON file (looks like: `linkedin-commenter@your-project.iam.gserviceaccount.com`)
3. Click "Share" in your Google Sheet
4. Paste the service account email
5. Give it "Editor" access
6. Click "Send"

### Step 4: Update Google Sheet Structure

Make sure your Google Sheet has these exact column headers in row 1:

| Post Link | Comment | Status |
|-----------|---------|--------|

- **Post Link**: The full LinkedIn post URL
- **Comment**: The comment text to post
- **Status**: Mark as "approved" for posts you want to comment on

### Step 5: Configure the Script

Open `linkedin_auto_commenter.py` and update these values at the top:

```python
# Your Google Sheet ID (from the URL)
GOOGLE_SHEET_ID = "YOUR_SHEET_ID_HERE"

# Path to your Google Service Account JSON file
SERVICE_ACCOUNT_FILE = "credentials.json"

# Sheet name (tab name in your Google Sheet)
SHEET_NAME = "Sheet1"  # Update if different
```

**To find your Sheet ID:**
- Look at your Google Sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
- Copy the long string between `/d/` and `/edit`

---

## ▶️ Running the Script

### Method 1: Command Line

```bash
python linkedin_auto_commenter.py
```

### Method 2: Double-click (Windows)

Simply double-click `linkedin_auto_commenter.py` if Python is set up as default program for `.py` files.

---

## 📖 How It Works

1. **Connects to Google Sheets**: Reads your sheet using the service account credentials
2. **Filters Approved Posts**: Only processes rows where Status = "approved"
3. **Opens LinkedIn**: Launches Chrome and navigates to LinkedIn
4. **Manual Login**: Pauses and waits for you to log in manually
5. **Automated Commenting**: 
   - Opens each approved post
   - Types and posts the comment
   - Updates the status to "Commented" or "Failed"
   - Waits 5 seconds between posts
6. **Completion**: Shows summary and keeps browser open until you press ENTER

---

## 🎯 Usage Workflow

1. Add LinkedIn post links and comments to your Google Sheet
2. Set **Status** to "approved" for posts you want to comment on
3. Run the script: `python linkedin_auto_commenter.py`
4. When prompted, log in to LinkedIn in the browser
5. Press ENTER to start automation
6. The script will:
   - Comment on all approved posts
   - Update their status to "Commented"
   - Skip any posts that aren't approved

---

## ⚙️ Advanced Configuration

### Use Your Existing Chrome Profile (Stay Logged In)

To avoid logging in every time, uncomment these lines in `linkedin_auto_commenter.py`:

```python
# Find your Chrome profile path:
# Windows: C:\Users\YourName\AppData\Local\Google\Chrome\User Data
# Mac: ~/Library/Application Support/Google/Chrome
# Linux: ~/.config/google-chrome

options.add_argument(r'user-data-dir=YOUR_CHROME_USER_DATA_PATH')
options.add_argument('profile-directory=Default')
```

### Adjust Wait Times

Change these values in the script:
- **Between posts**: Line ~260, `wait_time = 5`
- **After clicking comment box**: Line ~205, `time.sleep(1)`
- **After posting**: Line ~235, `time.sleep(3)`

---

## ⚠️ Troubleshooting

### "Could not connect to Google Sheets"
- Make sure `credentials.json` is in the same folder as the script
- Verify you shared the sheet with the service account email
- Check that Google Sheets API is enabled in your Google Cloud project

### "Could not find comment box"
- LinkedIn may have changed their HTML structure
- The script tries multiple selectors - if all fail, you may need to update the selectors
- Make sure you're fully logged in to LinkedIn

### "ChromeDriver version mismatch"
- Your Chrome version doesn't match ChromeDriver
- Install `webdriver-manager`: `pip install webdriver-manager`
- Or download the correct ChromeDriver version

### Rate Limiting
- LinkedIn may temporarily block automation if you comment too quickly
- Increase the wait time between posts (currently 5 seconds)
- Keep sessions under 50 posts at a time

---

## 🔒 Security Notes

- **Keep `credentials.json` secure** - it gives access to your Google Sheets
- **Never commit `credentials.json` to Git** - add it to `.gitignore`
- **LinkedIn Terms of Service** - Use responsibly and within LinkedIn's automation policies
- **Rate Limits** - Don't process too many posts too quickly to avoid detection

---

## 📝 Status Values

The script uses these status values:

- **approved**: Posts to be commented on
- **Commented**: Successfully commented
- **Failed**: Comment attempt failed
- *(anything else)*: Ignored by the script

---

## 💡 Tips

1. **Test First**: Start with 2-3 approved posts to test the automation
2. **Review Comments**: Make sure your comments are high-quality and relevant
3. **Monitor**: Watch the first few comments to ensure everything works correctly
4. **Backup**: Keep a backup of your Google Sheet
5. **Stay Safe**: Don't automate too aggressively to avoid LinkedIn restrictions

---

## 🤝 Support

If you encounter issues:
1. Check the error messages in the console
2. Verify all setup steps were completed
3. Make sure Chrome and ChromeDriver versions match
4. Test with a single approved post first

---

## 📊 Google Sheet Example

Your sheet should look like this:

| Post Link | Comment | Status |
|-----------|---------|--------|
| https://www.linkedin.com/posts/... | Great insights! Thanks for sharing. | approved |
| https://www.linkedin.com/posts/... | This is very helpful information. | approved |
| https://www.linkedin.com/posts/... | Interesting perspective on this topic. | pending |

Only posts with Status = "approved" will be processed.

---

Enjoy your automated LinkedIn commenting! 🚀

