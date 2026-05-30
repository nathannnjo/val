# val

## Friends Calendar App

A shared, real-time calendar where events sync instantly across all users.

Open `index.html` in your browser to use the calendar.

### Features
- 📅 Monthly calendar view
- ➕ Click a day to see and add events
- 🌐 **Real-time sync** - events update instantly for everyone (Firebase)
- ⏰ Support for all-day events and busy times
- 📝 Add notes to events
- 🗑️ Delete individual events or entire event series

### Setup

**First time setup required!** See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to connect your calendar to Firebase for real-time sharing.

### Run locally

Option 1: Open `index.html` directly in a browser

Option 2: Start a simple local server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Deploy to GitHub Pages

This repository now includes a GitHub Actions workflow that publishes the site automatically when you push to `main`.

Once GitHub Pages is enabled, the site should be available at:

`https://nathannnjo.github.io/val/`

If the repository is private or Pages is not enabled yet, open the repository Settings > Pages and set the source to `GitHub Actions` or `main` branch root.
