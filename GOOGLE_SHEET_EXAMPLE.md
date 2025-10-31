# 📊 Google Sheet Setup Example

## Required Sheet Structure

Your Google Sheet **MUST** have these exact column headers in Row 1:

```
| Post Link | Comment | Status |
```

---

## ✅ Correct Example

### Row 1 (Headers)
| A | B | C |
|---|---|---|
| **Post Link** | **Comment** | **Status** |

### Data Rows
| A | B | C |
|---|---|---|
| https://www.linkedin.com/posts/johndoe_ai-123 | Great insights on AI trends! Thanks for sharing. | approved |
| https://www.linkedin.com/posts/janedoe_tech-456 | This is very helpful information about cloud computing. | approved |
| https://www.linkedin.com/posts/bobsmith_data-789 | Interesting perspective on data analytics! | pending |
| https://www.linkedin.com/posts/alice_ml-101 | Love this breakdown of machine learning concepts. | Commented |
| https://www.linkedin.com/posts/charlie_dev-202 | Thanks for the tutorial! Very clear explanation. | Failed |

---

## 📋 Column Descriptions

### Column A: Post Link
- **Full LinkedIn post URL**
- Must start with `https://www.linkedin.com/posts/`
- Example: `https://www.linkedin.com/posts/username_activity-1234567890/`

### Column B: Comment
- **The comment text to post**
- Can be multiple sentences
- Keep it natural and relevant
- Recommended: 10-200 characters

### Column C: Status
- **Controls what the script does**

| Status | Meaning | Action |
|--------|---------|--------|
| `approved` | Ready to comment | ✅ Script will process |
| `pending` | Under review | ⏭️ Script will skip |
| `Commented` | Successfully posted | ℹ️ Already done |
| `Failed` | Comment failed | ⚠️ Needs attention |
| (anything else) | Not ready | ⏭️ Script will skip |

---

## 🎨 Optional: Format Your Sheet

### Add Colors for Status
Make it easier to scan by adding colors:

1. **approved** → 🟢 Green background
2. **pending** → 🟡 Yellow background
3. **Commented** → 🔵 Blue background
4. **Failed** → 🔴 Red background

### Freeze Header Row
1. Select Row 1
2. View → Freeze → 1 row
3. Now headers stay visible when scrolling

### Auto-Resize Columns
1. Select all columns (click top-left corner)
2. Double-click between any column letters
3. Columns resize to fit content

---

## 🔄 Workflow Example

### Before Running Script:
| Post Link | Comment | Status |
|-----------|---------|--------|
| https://linkedin.com/posts/abc | Great post! | **approved** |
| https://linkedin.com/posts/def | Thanks! | **approved** |
| https://linkedin.com/posts/ghi | Nice! | **pending** |

### After Running Script:
| Post Link | Comment | Status |
|-----------|---------|--------|
| https://linkedin.com/posts/abc | Great post! | **Commented** ✅ |
| https://linkedin.com/posts/def | Thanks! | **Commented** ✅ |
| https://linkedin.com/posts/ghi | Nice! | **pending** ⏭️ |

---

## 🚀 Quick Setup Steps

### 1. Create the Headers
Open your Google Sheet and add these in Row 1:
- **A1:** Post Link
- **B1:** Comment
- **C1:** Status

### 2. Add Some Test Data
Add 1-2 test rows with real LinkedIn posts:
- Copy a LinkedIn post URL → Paste in Column A
- Write a test comment → Paste in Column B
- Type "approved" → Paste in Column C

### 3. Share with Service Account
1. Get your service account email from `credentials.json`
2. Click "Share" in Google Sheets
3. Paste the email
4. Give "Editor" access
5. Click "Send"

---

## ❌ Common Mistakes

### ❌ WRONG: Missing Status Column
| Post Link | Comment |
|-----------|---------|
| https://... | Great! |

**Fix:** Add "Status" header in Column C

### ❌ WRONG: Typo in Status
| Post Link | Comment | Status |
|-----------|---------|--------|
| https://... | Great! | Approved |

**Fix:** Use lowercase "approved" (case-sensitive!)

### ❌ WRONG: Incomplete URL
| Post Link | Comment | Status |
|-----------|---------|--------|
| linkedin.com/posts/abc | Great! | approved |

**Fix:** Use full URL: `https://www.linkedin.com/posts/abc`

### ❌ WRONG: Headers in Wrong Order
| Comment | Post Link | Status |
|---------|-----------|--------|
| Great! | https://... | approved |

**Fix:** Correct order is: Post Link → Comment → Status

---

## 💡 Pro Tips

### 1. Use Data Validation for Status
Create a dropdown for Status column:
1. Select Column C (except header)
2. Data → Data validation
3. Criteria: List of items
4. Values: `approved,pending,Commented,Failed`
5. Save

Now you can select status from dropdown! ✨

### 2. Add a Timestamp Column (Optional)
Add a 4th column "Timestamp" to track when commented:
- The script doesn't use this, but it's helpful for tracking

### 3. Filter View
Create filters to see only specific statuses:
1. Select headers (Row 1)
2. Data → Create a filter
3. Click filter icon on Status column
4. Select only "approved" to see what will be processed

### 4. Conditional Formatting
Auto-color rows based on status:
1. Select all data (A2:C1000)
2. Format → Conditional formatting
3. Format rules:
   - If Status = "approved" → Green
   - If Status = "Commented" → Blue
   - If Status = "Failed" → Red

---

## 🔗 Integration with Chrome Extension

### Update Your Apps Script
Use the updated script (`GoogleAppsScript-Updated.gs`) that includes Status column:

```javascript
sheet.appendRow([postLink, comment, "pending"]);
```

This automatically adds new entries with Status = "pending"

### Update background.js (if needed)
Make sure your extension sends the status field:
```javascript
{
  postLink: "...",
  comment: "...",
  status: "pending"
}
```

---

## 📸 Visual Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│ A                              │ B              │ C                     │
├────────────────────────────────┼────────────────┼───────────────────────┤
│ Post Link                      │ Comment        │ Status                │
├────────────────────────────────┼────────────────┼───────────────────────┤
│ https://linkedin.com/posts/... │ Great insights!│ approved     🟢       │
│ https://linkedin.com/posts/... │ Thanks!        │ Commented    🔵       │
│ https://linkedin.com/posts/... │ Interesting!   │ pending      🟡       │
│ https://linkedin.com/posts/... │ Nice article!  │ Failed       🔴       │
└────────────────────────────────┴────────────────┴───────────────────────┘
```

---

## ✅ Checklist

Before running the script, verify:

- [ ] Column A header = "Post Link"
- [ ] Column B header = "Comment"
- [ ] Column C header = "Status"
- [ ] All post links are complete URLs
- [ ] At least one row has Status = "approved"
- [ ] Sheet is shared with service account email
- [ ] Service account has "Editor" access

---

## 🎯 You're Ready!

Your Google Sheet is now properly formatted for the LinkedIn Auto Commenter script!

**Next step:** Run `python linkedin_auto_commenter.py`

---

*Need help? See QUICK_START.md or SETUP_INSTRUCTIONS.md*

