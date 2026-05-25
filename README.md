# val

## Friends Calendar App

Open `index.html` in your browser to use the calendar.

Features:
- Monthly calendar view
- Click a day to see and add events
- Events saved automatically in browser storage
- Delete events when plans change

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
