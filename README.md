# World Cup 2026 — My Bracket

A personal web app to follow the 2026 FIFA World Cup in **Melbourne time**: fixtures
with your favourite teams highlighted (others greyed but scores still shown), a knockout
bracket, and a watchlist "Calendar" tab. Installable on iPhone via *Add to Home Screen*.

## How it works
- **Live (local dev):** `npm run dev` proxies the [football-data.org](https://www.football-data.org)
  API through Vite, injecting the API key from `.env` (`FOOTBALL_DATA_TOKEN=...`).
- **Deployed (GitHub Pages):** a scheduled GitHub Action re-fetches the fixtures every
  ~10 minutes using the `FOOTBALL_DATA_TOKEN` repo secret, bakes them into `matches.json`,
  builds the app, and publishes to Pages. The key is never exposed to the browser.

## Local development
```bash
npm install
echo "FOOTBALL_DATA_TOKEN=your_token" > .env   # free key: football-data.org/client/register
npm run dev
```

## Deploy
Push to `main`. The `Build & deploy to GitHub Pages` workflow handles the rest. Make sure
the `FOOTBALL_DATA_TOKEN` secret is set and Pages source is set to **GitHub Actions**.
