VESTAL

Fast reading web app built with React 19 + Vite 6 + TypeScript. It lets you:
- Paste arbitrary text or fetch an article from Wikipedia (multiple languages)
- Configure reading speed (WPM), chunk size, and font size
- Toggle between setup and reading views


Tech stack
- React 19, react-dom 19
- Vite 6 (TypeScript)
- Tailwind via CDN in index.html (no build step needed for Tailwind)
- Node/Express server for production (serves Vite build from /dist with SPA fallback)

Requirements
- Node >=20.19.0 (declared in package.json engines)
- npm (for scripts)
- No environment variables are required

Local development (optional)
- Install: npm install
- Run dev server: npm run dev
- Build: npm run build
- Preview local build: npm run preview

Production serving
- Build files output to dist/
- server.mjs (Express + compression) serves dist and falls back to index.html for SPA routes
- Procfile starts web dyno: web: node server.mjs
- Heroku will run heroku-postbuild which executes npm run build

Heroku deployment (EU region, Eco dyno)
1) Log in on CLI
   heroku login

2) Create the app in the EU region
   heroku apps:create YOUR_APP_NAME --region eu

3) Connect the app to your GitHub repo (recommended)
   - Go to the Heroku Dashboard > Your App > Deploy tab
   - Deployment method: GitHub
   - Connect to your repository
   - Enable Automatic Deploys from your main branch

   Alternatively (push directly to Heroku remote):
   heroku git:remote -a YOUR_APP_NAME
   git push heroku main

4) Dyno type: set to Eco (to use Eco dyno hours)
   - In the Dashboard > Resources: scale the web dyno to Eco
   - Or via CLI (if available in your CLI version):
     heroku ps:type web=eco -a YOUR_APP_NAME

5) Open the app
   heroku open -a YOUR_APP_NAME

Notes about this repo
- package.json
  - "engines": { "node": ">=20.19.0 <21" }
  - Scripts: dev, build, preview, start (node server.mjs), heroku-postbuild (build)
- Procfile present (web: node server.mjs)
- server.mjs serves dist with SPA fallback
- vite.config.ts simplified (no AI Studio env defines)
- index.html cleaned (removed AI Studio importmap)

AI Studio cleanup
- Removed: importmap pointing to aistudiocdn in index.html
- Removed: GEMINI_API_KEY defines from vite.config.ts
- Recommendation: metadata.json appears to be AI Studio-specific and can be removed from the repo. If you approve, delete Vestal/metadata.json.

Project structure (key files)
- index.html
- index.tsx
- App.tsx
- components/
- vite.config.ts
- tsconfig.json
- server.mjs
- Procfile
- package.json
- README.md

Troubleshooting
- If Heroku warns about Node version, ensure Node >=20.19.0 is used (engines set). Heroku Node buildpack will respect this.
- No config vars needed for this app.
- If using GitHub Deploys, confirm that Automatic Deploys are enabled from your desired branch and region is EU for the app.

License
- Add your preferred license (if any).
