# 🔐 Step-by-Step: Getting Google Credentials

## Follow These Exact Steps (5 minutes)

### Step 1: Go to Google Cloud Console

1. Open your browser
2. Go to: **https://console.cloud.google.com/**
3. Log in with your Google account

---

### Step 2: Create a New Project

1. Click the project dropdown at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Project name: `LinkedIn Automation`
4. Click **"Create"**
5. Wait 10 seconds for it to create
6. Make sure it's selected (check top bar)

---

### Step 3: Enable Google Sheets API

1. In the left menu, click **"APIs & Services"** → **"Library"**
2. In the search box, type: `Google Sheets API`
3. Click on **"Google Sheets API"**
4. Click the blue **"Enable"** button
5. Wait for it to enable

---

### Step 4: Create Service Account

1. In the left menu, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"Service Account"**

Fill in the form:
- **Service account name:** `linkedin-commenter`
- **Service account ID:** (auto-filled)
- **Service account description:** `Automation for LinkedIn comments`

4. Click **"Create and Continue"**
5. Skip Step 2 (Grant access) - Click **"Continue"**
6. Skip Step 3 (Grant users access) - Click **"Done"**

---

### Step 5: Download Credentials JSON

1. You'll see your service accounts list
2. Click on the **email** of the service account you just created
   - It looks like: `linkedin-commenter@your-project.iam.gserviceaccount.com`
3. Click the **"Keys"** tab at the top
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**

📥 **A JSON file will download to your computer**

7. **IMPORTANT:** Rename it to `credentials.json`
8. **IMPORTANT:** Move it to your project folder: `C:\Users\Dawood Adnan\Desktop\hello-world-extension\`

---

### Step 6: Copy the Service Account Email

1. Open the `credentials.json` file with Notepad
2. Find the line with `"client_email":`
3. Copy the entire email address
   - Example: `linkedin-commenter@linkedin-automation-12345.iam.gserviceaccount.com`
4. Keep this - you'll need it in the next step!

---

### Step 7: Share Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1FZovCeVwPpH8Z9WMPkdigei1c6GxjRTUaZ2Xo34MnoY/edit
2. Click the **"Share"** button (top-right corner)
3. **Paste the service account email** you just copied
4. Make sure it says **"Editor"** (not Viewer!)
5. **Uncheck** "Notify people" (no need to send email)
6. Click **"Share"** or **"Send"**

✅ Done! Your sheet is now connected to the script!

---

### Step 8: Verify credentials.json Location

Make sure your file structure looks like this:

```
C:\Users\Dawood Adnan\Desktop\hello-world-extension\
├── credentials.json  ← Should be HERE!
├── linkedin_auto_commenter.py
├── requirements.txt
├── START_HERE.md
└── ...
```

---

## ✅ You're Ready!

The credentials are now set up. Continue with Step 4 in the main instructions.

---

## 🆘 Troubleshooting

**"Can't find the project dropdown"**
- Look at the very top of the page, left side
- It says "Google Cloud" with a dropdown arrow

**"Service account not created"**
- Make sure you're in the correct project (check top bar)
- Try refreshing the page

**"Can't share the sheet"**
- Make sure you copied the entire email address
- Check there are no extra spaces
- Make sure you're logged into the same Google account

**"credentials.json not downloading"**
- Check your Downloads folder
- Try a different browser (Chrome recommended)
- Make sure pop-ups are not blocked

---

## 🔒 Security Note

**Keep `credentials.json` PRIVATE!**
- Never share it with anyone
- Never upload it to GitHub
- Never email it
- It gives access to your Google Sheets

---

Done! Return to the main setup guide.

