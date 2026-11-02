const crypto = require('crypto');
const { json, method, sheet } =
  require('../lib/api-utils');

module.exports = async (req, res) => {
  if (!method(req, res, 'POST')) return;

  const { type, name, cls, school } = req.body || {};

  if (
    !['team', 'solo'].includes(type) ||
    !String(name || '').trim() ||
    !String(cls || '').trim() ||
    !String(school || '').trim()
  ) {
    return json(res, 400, {
      error: 'Please fill in all registration fields.'
    });
  }

  try {
    const registration = {
      id: crypto.randomUUID(),
      type,
      name: String(name).trim().slice(0, 80),
      cls: String(cls).trim(),
      school: String(school).trim().slice(0, 80),
      at: Date.now()
    };

    await sheet('register', { registration });

    return json(res, 200, registration);

  } catch (error) {
    console.error('Registration error:', error);

    return json(res, 502, {
      error: error.message ||
        'Registration could not be saved.'
    });
  }
};
