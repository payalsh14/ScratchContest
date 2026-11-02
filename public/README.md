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

## ✅ Shared database with Google Sheets (free, works on ANY hosting, even static)
1. Create a new Google Sheet → **Extensions → Apps Script**.
2. Delete the sample code, paste `google-sheets-backend/Code.gs`, set your `JUDGE_PASSWORD`, save.
3. **Deploy → New deployment → type: Web app** → Execute as: **Me**, Who has access: **Anyone** → Deploy → authorize → copy the **Web app URL**.
4. Open `public/app.js`, set `const SHEET_URL = 'PASTE_URL_HERE';`
5. Upload `public/` to Netlify / GitHub Pages / any host. Done!
Every registration appears in the **Registrations** tab and every project link in the **Submissions** tab of your sheet.
Judges log in at `/#judge` with the password from Code.gs and see names + links with Copy buttons.
