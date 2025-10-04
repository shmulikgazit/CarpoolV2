# 🚨 URGENT SECURITY FIX REQUIRED

## What Happened
GitHub detected that your Firebase API keys were exposed in your code repository. This means anyone who has access to your GitHub repository can see and potentially misuse your Firebase credentials.

## What You Need To Do NOW

### Step 1: Revoke the Exposed Key (CRITICAL - Do This First!)

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project `carpoolv2-c05f3`
3. Go to **APIs & Services** → **Credentials**
4. Find the API key: `AIzaSyABTC6Ow-sOR5zyozhaLzTCDcFD3vYi6uw`
5. Click on it and either:
   - **OPTION A (Recommended)**: Click **DELETE** to permanently remove it
   - **OPTION B**: Restrict it severely (but deletion is safer)

### Step 2: Create New Firebase Credentials

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project `carpoolv2-c05f3`
3. Click the gear icon → **Project Settings**
4. Scroll to "Your apps" section
5. Click on your web app OR click **Add app** → **Web** (</> icon)
6. Copy the new firebaseConfig values

### Step 3: Create .env File with New Credentials

1. **Open File Explorer** and navigate to: `C:\Users\shmulikg\CarpoolV2\CarpoolApp`
2. **Create a new file** named exactly `.env` (including the dot at the start)
   - In PowerShell: `New-Item -Path "CarpoolApp\.env" -ItemType File`
3. **Open the new `.env` file** in Notepad or VS Code
4. **Copy the template from `env.example.txt`** (in the same folder)
5. **Replace** `YOUR_NEW_API_KEY_HERE` and `YOUR_NEW_APP_ID_HERE` with the values from Step 2
6. **Save the file**

### Step 4: Install Environment Variable Package

Run this command in PowerShell from the CarpoolApp folder:
```powershell
cd CarpoolApp
npm install react-native-dotenv
```

### Step 5: Verify .env is NOT Tracked by Git

Run these commands:
```powershell
cd CarpoolApp
git status
```

You should NOT see `.env` in the list of changes. If you do see it, contact me immediately.

### Step 6: Remove the Old Keys from Git History (Advanced)

Even after fixing the files, the old keys are still in your Git history. You have two options:

**OPTION A (Simpler but less secure)**: 
- Just make sure you completed Step 1 (revoked the key)
- The history still has the old key, but it's now useless

**OPTION B (Complete removal - Recommended)**:
- Contact me and I'll help you use `git filter-branch` or BFG Repo-Cleaner to remove the keys from history
- This is more complex but completely removes all traces

### Step 7: Test the App

After setting up the .env file:
```powershell
cd CarpoolApp
npm start
```

The app should now load Firebase credentials from your .env file instead of hardcoded values.

## Files That Were Updated

I've updated these files to use environment variables:
- All Firebase configuration files now read from process.env
- `.gitignore` now blocks .env files from being committed

## What I've Protected

The `.gitignore` file now prevents these files from ever being committed:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`

## Need Help?

If you get stuck on any step, let me know and I'll walk you through it!

