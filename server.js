// Zero-dependency server: serves /public and stores data in data.json
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const JUDGE_PASSWORD = process.env.JUDGE_PASSWORD || 'judge123'; // CHANGE THIS
const DB = path.join(__dirname, 'data.json');
const tokens = new Set();
const load = () => { try { return JSON.parse(fs.readFileSync(DB)); } catch { return { regs: [], subs: [] }; } };
const save = d => fs.writeFileSync(DB, JSON.stringify(d, null, 2));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      let b = {}; try { b = JSON.parse(body || '{}'); } catch {}
      const d = load(), route = req.url.split('?')[0];
      if (route === '/api/register' && req.method === 'POST') {
        if (!b.name || !b.cls) return send(res, 400, { error: 'Missing fields' });
        const reg = { id: crypto.randomUUID(), type: b.type, name: String(b.name).slice(0, 80), cls: b.cls, school: String(b.school || '').slice(0, 80), at: Date.now() };
        d.regs.push(reg); save(d); return send(res, 200, reg);
      }
      if (route === '/api/submit' && req.method === 'POST') {
        const reg = d.regs.find(r => r.id === b.regId);
        if (!reg) return send(res, 400, { error: 'Register first' });
        if (!/^https:\/\/scratch\.mit\.edu\/projects\/\d+/.test(b.link || '')) return send(res, 400, { error: 'Invalid Scratch link' });
        d.subs = d.subs.filter(s => !(s.regId === reg.id && s.problem === b.problem));
        d.subs.push({ regId: reg.id, name: reg.name, cls: reg.cls, school: reg.school, problem: b.problem, link: b.link, at: Date.now() });
        save(d); return send(res, 200, { ok: true });
      }
      if (route === '/api/judge/login' && req.method === 'POST') {
        if (b.password !== JUDGE_PASSWORD) return send(res, 401, { error: 'Wrong password' });
        const t = crypto.randomBytes(24).toString('hex'); tokens.add(t); return send(res, 200, { token: t });
      }
      if (route === '/api/submissions') {
        if (!tokens.has(req.headers['x-token'])) return send(res, 401, { error: 'Unauthorized' });
        return send(res, 200, { subs: d.subs.sort((a, b) => b.at - a.at) });
      }
      send(res, 404, { error: 'Not found' });
    }); return;
  }
  let f = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(f)) f = path.join(__dirname, 'public', 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'text/plain' }); fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log('Contest platform running on http://localhost:' + PORT));
