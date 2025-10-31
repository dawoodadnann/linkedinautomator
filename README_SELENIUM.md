# 🤖 LinkedIn Auto Commenter with Selenium

A Python-based automation tool that reads LinkedIn posts from Google Sheets and automatically comments on approved posts using Selenium WebDriver.

---

## 📖 Overview

This tool helps you automate LinkedIn engagement by:
1. **Reading** post links and comments from a Google Sheet
2. **Filtering** only posts marked as "approved"
3. **Logging in** to LinkedIn (manual, one-time per session)
4. **Commenting** automatically on each post
5. **Updating** status back to the sheet

---

## 🎯 Features

- ✅ Google Sheets integration for easy comment management
- ✅ Status-based filtering (only processes "approved" posts)
- ✅ Manual login (you stay in control)
- ✅ Automatic comment posting
- ✅ Status tracking (Commented/Failed)
- ✅ Rate limiting (configurable delays between posts)
- ✅ Error handling and logging
- ✅ Resume capability

---

## 📋 Files Included

| File | Purpose |
|------|---------|
| `linkedin_auto_commenter.py` | Main Python script |
| `requirements.txt` | Python dependencies |
| `QUICK_START.md` | Quick setup guide (⭐ START HERE) |
| `SETUP_INSTRUCTIONS.md` | Detailed setup with troubleshooting |
| `run_linkedin_commenter.bat` | Windows batch file for easy execution |
| `.gitignore` | Protects your credentials from Git |
| `GoogleAppsScript-Updated.gs` | Updated Apps Script with Status column |

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Python 3.7+ installed
- Google Chrome browser
- Google account with access to Google Cloud Console

### Installation

1. **Install Python packages:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Google Sheets API:**
   - Follow instructions in `QUICK_START.md`
   - Download `credentials.json` and place in this folder

3. **Configure the script:**
   - Open `linkedin_auto_commenter.py`
   - Update `GOOGLE_SHEET_ID` with your Sheet ID

4. **Run:**
   ```bash
   python linkedin_auto_commenter.py
   ```
   
   Or on Windows, double-click `run_linkedin_commenter.bat`

---

## 📊 Google Sheet Format

Your Google Sheet must have these exact columns:

| Column A | Column B | Column C |
|----------|----------|----------|
| Post Link | Comment | Status |

**Example:**

| Post Link | Comment | Status |
|-----------|---------|--------|
| https://www.linkedin.com/posts/user-post-123 | Great insights on AI trends! | approved |
| https://www.linkedin.com/posts/user-post-456 | Thanks for sharing this resource. | approved |
| https://www.linkedin.com/posts/user-post-789 | Interesting perspective! | pending |

**Status Values:**
- `approved` - Will be processed by the script
- `pending` - Ignored
- `Commented` - Successfully commented (updated by script)
- `Failed` - Comment failed (updated by script)

---

## 🔄 Workflow

### Step 1: Generate Comments (Chrome Extension)
Use your existing Chrome extension to:
- Browse LinkedIn posts
- Generate AI-powered comments
- Save to Google Sheets with Status = "pending"

### Step 2: Review & Approve
1. Open your Google Sheet
2. Review generated comments
3. Change Status to "approved" for comments you want to post

### Step 3: Run Automation
```bash
python linkedin_auto_commenter.py
```

The script will:
1. Read your Google Sheet
2. Find all approved posts
3. Open Chrome and wait for you to log in
4. Navigate to each post and comment
5. Update status to "Commented" or "Failed"

---

## 🎮 How to Use

### First Time Setup
1. Follow `QUICK_START.md` to set up credentials
2. Test with 1-2 approved posts first
3. Verify comments post correctly

### Daily Usage
1. Generate comments with Chrome extension
2. Review and approve comments in sheet
3. Run: `python linkedin_auto_commenter.py`
4. Log in when prompted
5. Let it run (you can monitor or do other work)

---

## ⚙️ Configuration Options

### Update Your Sheet ID
```python
# In linkedin_auto_commenter.py, line 21:
GOOGLE_SHEET_ID = "your-sheet-id-here"
```

### Change Sheet/Tab Name
```python
# In linkedin_auto_commenter.py, line 27:
SHEET_NAME = "Sheet1"  # Change to your tab name
```

### Adjust Wait Times
```python
# In linkedin_auto_commenter.py:

# Line 260 - Wait between posts (seconds)
wait_time = 5  # Increase for safer automation

# Line 205 - Wait after clicking comment box
time.sleep(1)  # Increase if comment box doesn't load

# Line 235 - Wait after posting comment
time.sleep(3)  # Increase to ensure post completes
```

### Use Existing Chrome Profile (Stay Logged In)
```python
# In linkedin_auto_commenter.py, uncomment lines 155-157:
options.add_argument(r'user-data-dir=C:\Users\YourName\AppData\Local\Google\Chrome\User Data')
options.add_argument('profile-directory=Default')
```

---

## 🔐 Security Best Practices

1. **Protect Credentials**
   - Never share `credentials.json`
   - Never commit it to Git (included in `.gitignore`)
   
2. **LinkedIn Terms of Service**
   - Use responsibly
   - Don't spam or post irrelevant comments
   - Keep sessions under 50 posts
   
3. **Rate Limiting**
   - Default: 5 seconds between posts
   - Increase for safer automation
   - Monitor for LinkedIn warnings

---

## ⚠️ Troubleshooting

### Google Sheets Connection Issues

**Error: "Could not connect to Google Sheets"**

Solutions:
- Verify `credentials.json` is in the correct folder
- Check you've shared the sheet with service account email
- Ensure Google Sheets API is enabled in Cloud Console

### Selenium/Chrome Issues

**Error: "ChromeDriver version mismatch"**

Solutions:
```bash
pip install webdriver-manager
```

Or download matching ChromeDriver from: https://chromedriver.chromium.org/

**Error: "Could not find comment box"**

Solutions:
- Ensure you're fully logged in to LinkedIn
- Check if LinkedIn changed their HTML structure
- Try scrolling to the comment section manually first
- Increase wait times in the script

### LinkedIn Issues

**Comments not posting**

Solutions:
- Verify you're logged in correctly
- Check if LinkedIn has rate-limited you (wait 24 hours)
- Ensure posts are public and allow comments
- Try posting manually first to test

---

## 📈 Performance & Limits

### Recommended Limits
- **Posts per session:** 20-30 maximum
- **Wait time between posts:** 5-10 seconds minimum
- **Sessions per day:** 2-3 maximum
- **Total comments per day:** 50-80 maximum

### Speed vs Safety
- **Faster** (3 sec delays) = Higher risk of detection
- **Safer** (10 sec delays) = More natural, lower risk
- **Recommended:** 5-7 seconds between posts

---

## 🆘 Support & Help

### Documentation Files
1. `QUICK_START.md` - Fast setup (read this first!)
2. `SETUP_INSTRUCTIONS.md` - Detailed guide with troubleshooting
3. This README - Overview and reference

### Common Questions

**Q: Do I need to log in every time?**
A: Yes, unless you configure Chrome profile (see Configuration section)

**Q: Can I run this on a schedule?**
A: Yes, but requires Chrome profile setup and headless mode (advanced)

**Q: Will LinkedIn detect this as automation?**
A: Possible if overused. Follow rate limits and vary your comments.

**Q: Can I use this for other sites?**
A: The script is LinkedIn-specific, but can be adapted for other sites.

---

## 🛠️ Technical Details

### Architecture
```
Google Sheets (Data Source)
      ↓
Python Script (Controller)
      ↓
Selenium WebDriver (Chrome Automation)
      ↓
LinkedIn Website (Target)
      ↓
Google Sheets (Status Updates)
```

### Dependencies
- `selenium` - Browser automation
- `gspread` - Google Sheets API
- `google-auth` - Authentication
- Chrome browser + ChromeDriver

### Python Version
- Minimum: Python 3.7
- Recommended: Python 3.9+
- Tested on: Python 3.11

---

## 📝 Changelog

### Version 1.0 (Current)
- Initial release
- Google Sheets integration
- Status-based filtering
- Automatic commenting
- Error handling
- Status updates

---

## 🤝 Integration with Chrome Extension

This script works perfectly with your existing Chrome extension:

1. **Chrome Extension** → Browses posts, generates AI comments
2. **Google Sheets** → Stores comments with "pending" status
3. **You** → Review and approve comments
4. **This Script** → Automatically posts approved comments

---

## 📄 License

This is a personal automation tool. Use responsibly and in accordance with:
- LinkedIn Terms of Service
- Google API Terms of Service
- Applicable automation policies

---

## 🎉 You're Ready!

**Next Steps:**
1. Read `QUICK_START.md` for setup
2. Test with 1-2 posts
3. Scale up gradually
4. Monitor results

**Happy automating! 🚀**

---

*Last updated: October 2024*

