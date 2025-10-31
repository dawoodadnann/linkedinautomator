# 🚀 Quick Start Guide - LinkedIn Auto Commenter

## What You Need (5 minutes setup)

1. ✅ Python installed on your computer
2. ✅ Google Chrome browser
3. ✅ Your Google Sheet with: **Post Link** | **Comment** | **Status**
4. ✅ Google Cloud credentials (we'll set this up)

---

## ⚡ Super Quick Setup (3 Steps)

### Step 1: Install Dependencies (1 minute)

Open terminal/command prompt in this folder and run:

```bash
pip install -r requirements.txt
```

### Step 2: Set Up Google Sheets API (3 minutes)

#### A. Create Service Account
1. Go to: https://console.cloud.google.com/
2. Create/select a project
3. Enable "Google Sheets API" (search in APIs & Services > Library)
4. Create credentials:
   - APIs & Services > Credentials
   - Create Credentials > Service Account
   - Name it: `linkedin-commenter`
   - Create and download JSON key
   - Save as `credentials.json` in this folder

#### B. Share Your Sheet
1. Open the `credentials.json` file
2. Copy the email address (looks like: `linkedin-commenter@...iam.gserviceaccount.com`)
3. Open your Google Sheet
4. Click "Share"
5. Paste the email and give "Editor" access

### Step 3: Configure the Script (30 seconds)

Open `linkedin_auto_commenter.py` and update line 21:

```python
GOOGLE_SHEET_ID = "YOUR_SHEET_ID_HERE"
```

**Get your Sheet ID from the URL:**
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
                                        ^^^^^^^^^^^^
                                        Copy this part
```

---

## ▶️ Run the Script

```bash
python linkedin_auto_commenter.py
```

**What happens:**
1. ✅ Connects to your Google Sheet
2. ✅ Finds all rows with Status = "approved"
3. ✅ Opens LinkedIn in Chrome
4. ⏸️ **PAUSES** - You manually log in to LinkedIn
5. ✅ Automatically comments on each approved post
6. ✅ Updates Status to "Commented" or "Failed"

---

## 📋 Your Google Sheet Format

Make sure your sheet looks like this:

| Post Link | Comment | Status |
|-----------|---------|--------|
| https://www.linkedin.com/posts/abc-123 | Great insights! | **approved** |
| https://www.linkedin.com/posts/def-456 | Thanks for sharing! | **approved** |
| https://www.linkedin.com/posts/ghi-789 | Interesting! | pending |

**Important:** Only rows with Status = "approved" will be processed!

---

## 🎯 Workflow

```
1. Generate comments using your Chrome extension
   ↓
2. Comments added to Google Sheet with Status = "pending"
   ↓
3. Review comments and change Status to "approved" for ones you like
   ↓
4. Run Python script: python linkedin_auto_commenter.py
   ↓
5. Log in to LinkedIn when prompted
   ↓
6. Script automatically comments on all approved posts
   ↓
7. Status updated to "Commented" ✅
```

---

## ⚠️ Common Issues

**"Could not connect to Google Sheets"**
- Make sure `credentials.json` is in this folder
- Make sure you shared the sheet with the service account email

**"ChromeDriver version mismatch"**
- Run: `pip install webdriver-manager`

**"Could not find comment box"**
- Make sure you're fully logged in to LinkedIn
- Try manually scrolling to the comment section first

---

## 💡 Pro Tips

1. **Test First**: Mark only 1-2 posts as "approved" to test
2. **Stay Safe**: Don't process more than 20-30 posts per session
3. **Stay Logged In**: Configure Chrome profile in the script to skip login (see SETUP_INSTRUCTIONS.md)
4. **Wait Times**: Script waits 5 seconds between posts by default

---

## 🔐 Security

- Never commit `credentials.json` to Git (it's in `.gitignore`)
- Keep your service account credentials private
- Use responsibly to avoid LinkedIn restrictions

---

## 📞 Need Help?

See `SETUP_INSTRUCTIONS.md` for detailed setup guide with troubleshooting.

---

**That's it! You're ready to automate LinkedIn commenting! 🎉**

