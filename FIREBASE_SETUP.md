# HOV Calendar - Firebase Setup Guide

Your calendar is now configured to save events to a shared Firebase database! Follow these steps to get it working:

## Step 1: Create a Firebase Project

1. Go to [https://firebase.google.com](https://firebase.google.com)
2. Click **"Get Started"** and sign in with Google
3. Click **"Create a project"** (or use existing project)
4. Enter a project name (e.g., "hov-calendar")
5. Disable Google Analytics (optional) and create

## Step 2: Create a Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click **"Create Database"**
3. Choose **Start in test mode** (for now - you can add security rules later)
4. Select your region and click **Enable**

## Step 3: Configure Security Rules

1. Go to **Rules** tab in Realtime Database
2. Replace the rules with:

```json
{
  "rules": {
    "calendar": {
      "events": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

5. Click **Publish**

**⚠️ Security Note:** These rules allow anyone to read/write. For production, add authentication.

## Step 4: Get Your Firebase Config

1. Go to **Project Settings** (gear icon, top left)
2. Scroll to **Your apps** and click the web icon `</>`
3. Register an app (name doesn't matter)
4. Copy the Firebase config object
5. In your code folder, open `firebase-config.js`
6. Replace the `YOUR_*` placeholders with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD9fC1hha13zCWm7zkCV3HPQAnZ4EF_x3c",
  authDomain: "hop-on-val-6fcf7.firebaseapp.com",
  databaseURL: "https://hop-on-val-6fcf7-default-rtdb.firebaseio.com",
  projectId: "hop-on-val-6fcf7",
  storageBucket: "hop-on-val-6fcf7.firebasestorage.app",
  messagingSenderId: "716426590301",
  appId: "1:716426590301:web:b73a72a54944bfe457f5b4",
  measurementId: "G-7K95WBH6S4
};
```

## Step 5: Deploy & Test

1. Commit and push your changes to GitHub
2. Open the calendar website
3. Add an event
4. Open the website in another tab/browser - **you'll see the event appear in real-time!**

## How It Works

- **Real-time sync:** When anyone adds/edits/deletes an event, it instantly updates for all other users viewing the calendar
- **Cloud storage:** Events are stored in Firebase, not locally
- **No backend needed:** Firebase handles everything

## Troubleshooting

- **Events not saving?** Open browser DevTools (F12) → Console and check for errors
- **No config?** Make sure `firebase-config.js` is loaded - check the HTML script tags
- **Security errors?** Your database rules might be too restrictive - check Step 3

## Next Steps (Optional)

- Add Firebase Authentication to require login
- Implement more granular security rules
- Add user-specific event filtering
- Set up daily email reminders
