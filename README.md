# VESTAL — Visual Efficiency & Speed Training at Lightspeed

Vestal is a fast‑reading web app built with React + Vite + TypeScript and served in production by an Express server on Heroku. It supports:
- Pasting arbitrary text, or fetching an article from Wikipedia (multilingual)
- Adjustable reading parameters: WPM (words per minute), chunk size, and font size
- A setup view for input and configuration, and a reading view for timed display with fine‑grained controls

Deployed app (Heroku, EU region, Eco dyno)
- https://vestal-5098d2e3b384.herokuapp.com/

Repository (clean provenance — no AI Studio template)
- https://github.com/mcainshcameron/vestal-app

Note: The previous “generated from Google Gemini AI Studio template” provenance was removed by migrating the code to a brand‑new repository with no template origin. The codebase itself has been cleaned of AI Studio artifacts.

---

## High‑Level Architecture (Conceptual)

- Client (React + TypeScript, built with Vite)
  - index.html includes Tailwind via CDN for styling
  - index.tsx mounts the root React component
  - App.tsx holds the main state and switches between Setup and Reading views
  - SetupView: input, language selection, Wikipedia search, parameter sliders, Start button
  - ReadingView: chunk calculation, timing loop, controls (play/pause/stop), responsive font sizing
- Build: Vite compiles/optimizes to static files in dist/
- Server: Express serves dist/ and falls back to index.html for client‑side routing
- Deployment: Heroku (stack heroku‑24), single Eco web dyno, Node engines pinned (>=20.19 <21)

Directory (key files under Vestal/)
- App.tsx, index.tsx, index.html
- components/SetupView.tsx, components/ReadingView.tsx, components/icons.tsx
- vite.config.ts, server.mjs, tsconfig.json, package.json, Procfile

---

## End‑to‑End Data Flow

1) User provides content
   - Option A: Paste text into a textarea in the Setup view
   - Option B: Use Wikipedia search (choose language, type query, press Enter or click Search)
   - When text is present, clicking Start switches the app to the Reading view

2) Reading workflow
   - Text is split into words and grouped into chunks of configurable size
   - A timing loop advances through chunks based on WPM and punctuation‑aware pauses
   - Controls allow adjusting WPM, chunk size, font size, and scrubbing position
   - Stop returns to the Setup view without losing configuration

3) Build and Serve
   - Vite builds the app into dist/
   - Express serves dist/ as static assets and responds with index.html for any route (SPA)

4) Deploy
   - Heroku builds the app (heroku‑postbuild runs Vite build), then runs `web: node server.mjs`
   - Stack: heroku‑24, Region: EU, Dyno: Eco web (no add‑ons)

---

## Wikipedia Fetch (Pseudocode)

Goal: Fetch the plain‑text extract of the top Wikipedia search result in the selected language.

```
function fetchWikipedia(query, lang):
  if query is empty:
    return

  set isLoading = true
  clear searchError

  url = "https://{lang}.wikipedia.org/w/api.php" +
        "?action=query" +
        "&format=json" +
        "&prop=extracts" +
        "&exlimit=1" +
        "&explaintext=1" +
        "&generator=search" +
        "&gsrsearch=" + encode(query) +
        "&gsrlimit=1" +
        "&origin=*"

  try:
    response = HTTP GET url
    if response not OK:
      raise "Network error"

    data = parse JSON response
    pages = data.query.pages (if any)

    if pages exist:
      firstId = first key in pages
      if firstId == "-1":
        raise "Article not found"
      extract = pages[firstId].extract

      if extract exists:
        set text = extract
      else:
        raise "Could not extract text"
    else:
      raise "No articles found"

  catch error:
    set searchError = error.message or "Unknown error"

  finally:
    set isLoading = false
```

Notes
- origin=* is required for browser CORS
- Language subdomain changes per selection (en/it/ru, etc.)
- We fetch plaintext (explaintext=1) for speed‑reading suitability

---

## Reading Logic (Pseudocode)

Chunking and timing:

```
function splitIntoChunks(text, chunkSize):
  words = split text by whitespace
  chunks = []
  for i from 0 to length(words) step chunkSize:
    chunk = join words[i : i+chunkSize] with space
    if chunk not empty:
      append chunk to chunks
  return chunks

function intervalForChunk(chunk, wpm):
  wordsInChunk = count words in chunk
  baseIntervalMs = (60000 * wordsInChunk) / wpm

  lastChar = last character of chunk
  punctuationPause =
    if lastChar == "," then 150
    else if lastChar in [".", "?", "!"] then 250
    else 0

  return baseIntervalMs + punctuationPause
```

Playback loop:

```
state:
  currentIndex = 0
  isRunning = true
  chunks = splitIntoChunks(text, chunkSize)

loop:
  if not isRunning or chunks is empty:
    wait
  else:
    chunk = chunks[currentIndex]
    wait intervalForChunk(chunk, wpm) milliseconds
    if currentIndex < last chunk:
      currentIndex = currentIndex + 1
    else:
      isRunning = false  // reached the end
```

Controls and adjustments:

```
onTogglePlayPause():
  if atEnd and not isRunning:
    currentIndex = 0
  isRunning = not isRunning

onStop():
  switch to Setup view (retain state as needed)

onChangeChunkSize(newSize):
  // Preserve reading position by mapping word index to new chunk index
  currentWordIndex = currentIndex * oldChunkSize
  currentIndex = floor(currentWordIndex / newSize)
  chunkSize = newSize

onChangeFontSize(value):
  fontSize = value

onChangeWpm(value):
  wpm = value
```

Responsive font sizing:

```
onChunkOrResize():
  set displayed font size to user value
  if measured text width > available container width:
    computed = (containerWidth / textWidth) * userFontSize
    set displayed font size = max(12, computed * 0.95)  // with a safety factor
```

---

## Build and Server (Conceptual)

Vite (build):

- Transpiles/bundles React + TypeScript into optimized static assets in dist/
- Dev server provides fast HMR (local development)

Express (server.mjs):

```
on start:
  enable compression
  serve static files from /dist (serve index.html and assets)
  for any GET route:
    respond with /dist/index.html  // SPA fallback (regex catch‑all)

listen on PORT environment variable (provided by Heroku)
```

Rationale:
- The regex catch‑all avoids wildcard parsing issues in Express 5’s underlying path‑to‑regexp v6.

---

## Local Development

Requirements:
- Node >= 20.19 and < 21 (enforced via package.json engines)
- npm

Commands:
- Install: `npm install`
- Run dev server: `npm run dev`
- Build for production: `npm run build` → outputs to dist/
- Preview (static): `npm run preview`

---

## Deployment (Heroku, EU, Eco)

What this repo provides:
- Procfile: `web: node server.mjs`
- heroku‑postbuild script: runs `npm run build` after dependencies are installed
- Node engines: `>=20.19 <21` (compatible with the Vite React plugin)
- Express static server with SPA fallback

Completed setup for the live app:
- App created in EU region on stack heroku‑24
- Eco dyno enabled (flat $5/month shared across all Eco dynos; no add‑ons)
- Pipeline created and connected to the new GitHub repo

Two deployment flows:

1) GitHub Auto‑Deploys (recommended)
- Pipeline is connected to mcainshcameron/vestal‑app
- Enable “Automatic Deploys” from branch main in the Heroku Dashboard
- Every push to main triggers build & release

2) Manual via Heroku remote
- From the repo: `git push heroku main`
- Heroku runs the Node buildpack, installs deps, runs postbuild, and starts `web: node server.mjs`

Cost controls:
- Single Eco web dyno, no add‑ons → stays at the flat Eco fee
- Verified via CLI (apps:info, ps, addons)

---

## Design Choices and Trade‑offs

- Client‑side Wikipedia fetch: simpler server (static serving only)
- Timing model: WPM‑based interval per chunk + small punctuation pauses to improve rhythm
- Tailwind via CDN: avoids extra CSS tooling; can switch to compiled Tailwind if needed
- Express 5 routing: regex catch‑all ensures SPA fallback compatibility
- Vite: modern dev/build pipeline with fast local iteration and small deployable assets

---

## Roadmap Ideas

- Persist user settings (e.g., localStorage)
- Additional languages and search UX improvements (suggestions/autocomplete)
- Enhanced pause heuristics based on syntax/semantics
- Keyboard shortcuts (play/pause/seek)
- Offline support via Service Worker
- Optional server‑side proxy for Wikipedia if CORS policies tighten

---

## Contributing

Issues and PRs are welcome. Please use clear commit messages and describe changes precisely.

---

## License

Add your preferred license (e.g., MIT) and update this section accordingly.
