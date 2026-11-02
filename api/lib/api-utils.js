const crypto = require('crypto');

function json(res, status, data) {
  return res.status(status).json(data);
}

function method(req, res, expected) {
  if (req.method !== expected) {
    json(res, 405, { error: 'Method not allowed' });
    return false;
  }
  return true;
}

function sign(payload) {
  const body = Buffer.from(
    JSON.stringify(payload)
  ).toString('base64url');

  const sig = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(body)
    .digest('base64url');

  return body + '.' + sig;
}

function verify(token) {
  if (!token || !process.env.SESSION_SECRET) return false;

  const [body, sig] = token.split('.');
  if (!body || !sig) return false;

  const expected = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(body)
    .digest();

  let actual;

  try {
    actual = Buffer.from(sig, 'base64url');
  } catch {
    return false;
  }

  if (
    actual.length !== expected.length ||
    !crypto.timingSafeEqual(actual, expected)
  ) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString()
    );

    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

async function sheet(action, data = {}) {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!url || !secret) {
    throw new Error(
      'Google Sheets is not configured. Check Vercel environment variables.'
    );
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      secret,
      action,
      ...data
    }),
    redirect: 'follow'
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(
      result.error || 'Google Sheets request failed.'
    );
  }

  return result;
}

module.exports = {
  json,
  method,
  sign,
  verify,
  sheet
};
