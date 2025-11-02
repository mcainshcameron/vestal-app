# VESTAL — Visual Efficiency & Speed Training at Lightspeed

Vestal is a fast‑reading web app built with React 19 + Vite 6 + TypeScript and served in production by an Express server on Heroku. It supports:
- Pasting arbitrary text, or fetching an article from Wikipedia (multilingual)
- Adjustable reading parameters: WPM (words per minute), chunk size, and font size
- A setup view for input and configuration, and a reading view for timed display with fine‑grained controls

Deployed app (Heroku, EU region, Eco dyno):
- https://vestal-5098d2e3b384.herokuapp.com/

Repository (clean provenance — no AI Studio template):
- https://github.com/mcainshcameron/vestal-app

Note: The previous “generated from Google Gemini AI Studio template” provenance was removed by migrating the code to a brand‑new repository with no template origin. The codebase itself has been cleaned of AI Studio artifacts.

---

## High‑Level Architecture

- Client: React 19 + TypeScript built with Vite 6
  - `index.html` includes Tailwind via CDN
  - `index.tsx` bootstraps React and mounts `<App />`
  - `App.tsx` orchestrates state and toggles between Setup and Reading views
  - `components/SetupView.tsx`: input area, Wikipedia search, parameter sliders, Start button
  - `components/ReadingView.tsx`: chunked timed rendering loop with controls
- Build: Vite (ESM, TS), output to `dist/`
- Server: `server.mjs` (Express 5 + compression) serves static files from `dist/` and falls back to SPA `index.html`
- Deployment: Heroku (stack heroku-24), single web dyno on the Eco plan, Node engines pinned (>=20.19 <21)

Directory (key files under `Vestal/`):
- `index.html`
- `index.tsx`
- `App.tsx`
- `components/SetupView.tsx`
- `components/ReadingView.tsx`
- `components/icons.tsx`
- `vite.config.ts`
- `server.mjs`
- `tsconfig.json`
- `package.json`
- `Procfile`

---

## Data Flow and Components

### App State and Views (`App.tsx`)
- App‑level state:
  - `text: string` — full text to be rendered
  - `wpm: number` — words per minute
  - `chunkSize: number` — number of words per rendered chunk
  - `fontSize: number` — base font size for rendering
  - `view: AppView` — enum, either `SETUP` or `READING`
  - `isLoading: boolean`, `searchError: string | null` — for Wikipedia search UX
  - `language: string` — Wikipedia language code (e.g. `en`, `it`, `ru`)
- Transitions:
  - Setup → Reading via `handleStartReading()` (with `text.trim()` guard)
  - Reading → Setup via `handleStopReading()`

### Wikipedia Fetch (multilingual)
The app constructs a Wikipedia REST query to fetch the top search result’s extract in the selected language and loads it into `text`.

Core logic (from `App.tsx`):
```ts
const handleWikipediaSearch = async (query: string, lang: string) => {
  if (!query.trim()) return;

  setIsLoading(true);
  setSearchError(null);

  const endpoint =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exlimit=1&explaintext=1&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&origin=*`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Network response was not ok.');
    const data = await response.json();
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId === '-1') throw new Error(`Article not found for "${query}".`);
      const page = pages[pageId];
      const extract = page.extract;
      if (extract) setText(extract);
      else throw new Error('Could not extract text from the article.');
    } else {
      throw new Error('No articles found.');
    }
  } catch (err) {
    setSearchError(err instanceof Error ? err.message : 'An unknown error occurred.');
  } finally {
    setIsLoading(false);
  }
};
```

Notes:
- `origin=*` is required for CORS in browser.
- Languages are user‑selectable; endpoint host changes by `lang` (e.g. `en.wikipedia.org`, `it.wikipedia.org`).
- The extract is plain text (`explaintext=1`), which is ideal for speed reading.

### Setup View (`components/SetupView.tsx`)
- UI elements:
  - Wikipedia search input + language selector + “Search” button. Enter key triggers search.
  - Textarea for manual input.
  - Sliders for `wpm` (50–1500), `chunkSize` (1–7), and `fontSize` (24–144).
  - “Start Reading” button (disabled while loading or with empty text).
- State managed by parent via props to centralize application logic in `App`.

### Reading View (`components/ReadingView.tsx`)
- Chunking:
  - Splits text into chunks of `chunkSize` words:
    ```ts
    const words = text.trim().split(/\s+/);
    for (let i = 0; i < words.length; i += chunkSize) {
      result.push(words.slice(i, i + chunkSize).join(' '));
    }
    ```
- Timing:
  - Per chunk, interval is computed as:
    ```
    baseInterval = (60,000 ms * wordsInChunk) / wpm
    + punctuation pause (150ms for comma, 250ms for . ? !)
    ```
- Controls:
  - Play/Pause toggles timed progression.
  - Stop returns to setup view (user‑driven).
  - Sliders for WPM, chunk size, font size, and position (scrub current index).
  - Changing chunk size maintains reading position by mapping the previous word index into the new chunking.
- Responsive font sizing:
  - `useLayoutEffect` measures text width and reduces font size if it overflows the container. A 0.95 safety factor is applied with a minimum of 12px.

---

## Styling

- Tailwind via CDN in `index.html` for rapid prototyping; no Tailwind build step is required.
- Minimal custom CSS for `<input type="range">` to provide consistent visual sliders.

---

## Build and Server

### Vite Configuration (`vite.config.ts`)
- React plugin and a simple alias for `@` → project root:
```ts
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});
```

### Production Server (`server.mjs`)
- Express 5 + compression serving static `dist/` and SPA fallback to `index.html`.
- Express 5 uses `path-to-regexp` v6; use a RegExp catch‑all for SPA fallback:
```js
app.use(compression());
app.use(express.static(distPath, { extensions: ['html'] }));

// SPA fallback — regex catch-all (Express 5)
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});
```

---

## Local Development

Requirements:
- Node >=20.19 <21 (pinned in `package.json` engines)
- npm

Scripts:
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build` (outputs to `dist/`)
- Preview (static): `npm run preview`

---

## Deployment (Heroku, EU, Eco)

What’s configured in this repo:
- `Procfile` with `web: node server.mjs`
- `server.mjs` serves `dist/` with SPA fallback
- `heroku-postbuild` script runs `npm run build` after dependencies install
- Node engines pinned (>=20.19 <21) to match Vite plugin requirements

One‑time setup (already completed for the live app):
- App created in EU region on stack `heroku-24`
- Eco dyno enabled (flat $5/month shared across all Eco dynos; no add‑ons)
- Pipeline created and connected to the new GitHub repo

Two ways to deploy changes:

1) GitHub Auto‑Deploys (recommended)
- In the Heroku pipeline dashboard (already connected to `mcainshcameron/vestal-app`):
  - Enable “Automatic Deploys” from branch `main`.
  - Each push to `main` triggers a build and release.

2) Manual deploy via Heroku remote
- From the repo directory:
  - `git push heroku main`

Cost and add‑ons:
- Running on a single Eco web dyno; no add‑ons attached — confirms flat Eco cost with no extra charges.
- Verified via CLI: `heroku apps:info -a vestal`, `heroku ps -a vestal`, `heroku addons -a vestal`.

---

## Design Choices and Trade‑offs

- Client‑only Wikipedia fetch keeps the server simple (static serving only).
- Timing is based on WPM × words per chunk with small punctuation delays for natural pacing.
- Tailwind via CDN reduces build complexity; can be converted to a compiled Tailwind pipeline if needed.
- Express 5 routing: using a regex catch‑all avoids `path-to-regexp` v6 wildcard pitfalls.
- Vite provides modern dev UX and fast production builds.

---

## Roadmap Ideas

- Persist user settings (localStorage)
- More languages and search hints or autocomplete
- Advanced parsing to better detect sentence boundaries and more nuanced pauses
- Keyboard shortcuts for play/pause/seek
- Service Worker for offline use
- Optional server‑side proxy for Wikipedia (if stricter CORS policies emerge)

---

## Contributing

Issues and PRs are welcome. Please use conventional commit messages when possible.

---

## License

Add your preferred license (e.g., MIT) and update this section accordingly.
