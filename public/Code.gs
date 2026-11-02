// Google Apps Script backend: stores registrations + submissions in this Google Sheet
const JUDGE_PASSWORD = 'judge123'; // <-- CHANGE THIS

function sh_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.appendRow(headers); s.setFrozenRows(1); }
  return s;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet() { return out_({ status: 'Scratch contest backend is running' }); }

function doPost(e) {
  const b = JSON.parse(e.postData.contents || '{}');
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    if (b.action === 'register') {
      if (!b.name || !b.cls) return out_({ error: 'Missing fields' });
      const id = Utilities.getUuid();
      sh_('Registrations', ['Time', 'ID', 'Type', 'Name / Team', 'Class', 'School']).appendRow([new Date(), id, b.type, b.name, b.cls, b.school]);
      return out_({ id: id, type: b.type, name: b.name, cls: b.cls, school: b.school });
    }
    if (b.action === 'submit') {
      if (!/^https:\/\/scratch\.mit\.edu\/projects\/\d+/.test(b.link || '')) return out_({ error: 'Invalid Scratch link' });
      const s = sh_('Submissions', ['Time', 'RegID', 'Name / Team', 'Class', 'School', 'Problem', 'Project Link']);
      const d = s.getDataRange().getValues();
      for (let i = d.length - 1; i >= 1; i--) if (d[i][1] === b.regId && d[i][5] === b.problem) s.deleteRow(i + 1);
      s.appendRow([new Date(), b.regId, b.name, b.cls, b.school, b.problem, b.link]);
      return out_({ ok: true });
    }
    if (b.action === 'login') return out_(b.password === JUDGE_PASSWORD ? { ok: true } : { error: 'bad' });
    if (b.action === 'list') {
      if (b.password !== JUDGE_PASSWORD) return out_({ error: 'bad' });
      const d = sh_('Submissions', ['Time', 'RegID', 'Name / Team', 'Class', 'School', 'Problem', 'Project Link']).getDataRange().getValues();
      const subs = d.slice(1).map(r => ({ at: new Date(r[0]).getTime(), regId: r[1], name: r[2], cls: String(r[3]), school: r[4], problem: r[5], link: r[6] }));
      subs.sort((x, y) => y.at - x.at);
      return out_({ subs: subs });
    }
    return out_({ error: 'Unknown action' });
  } finally { lock.releaseLock(); }
}
