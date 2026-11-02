const { json, method, verify, sheet } =
  require('../lib/api-utils');

module.exports = async (req, res) => {
  if (!method(req, res, 'GET')) return;

  if (!verify(req.headers['x-token'])) {
    return json(res, 401, {
      error: 'Unauthorized. Please log in again.'
    });
  }

  try {
    const result = await sheet('list');

    return json(res, 200, {
      subs: result.subs || []
    });

  } catch (error) {
    console.error('Loading submissions error:', error);

    return json(res, 502, {
      error: 'Could not load submissions.'
    });
  }
};
