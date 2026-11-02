# 🐱 Scratch Junior Coding Contest (Classes 5–8)

## Run (full platform, shared database)
1. Install Node.js 16+
2. `JUDGE_PASSWORD="your-secret" node server.js`  (Windows: `set JUDGE_PASSWORD=your-secret && node server.js`)
3. Open http://localhost:3000 — Judge portal is at `/#judge`

Deploy to Render / Railway / any VPS: start command `node server.js`, set env var `JUDGE_PASSWORD`.
Submissions are saved to `data.json`.

## Static-only mode
Upload only the `public/` folder to Netlify/GitHub Pages. Data then lives in each browser's localStorage
(good for demos only — judges will NOT see other students' submissions). Demo judge password: `judge123`.

## Editing
- Problems: top of `public/app.js` (PROBLEMS array)
- Colors: `:root` in `public/style.css`
