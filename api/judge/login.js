const { json, method, sign } =
  require('../../lib/api-utils');

module.exports = async (req, res) => {
  if (!method(req, res, 'POST')) return;

  if (
    !process.env.JUDGE_PASSWORD ||
    !process.env.SESSION_SECRET
  ) {
    return json(res, 500, {
      error: 'Judge login is not configured.'
    });
  }

  if (
    (req.body || {}).password !==
    process.env.JUDGE_PASSWORD
  ) {
    return json(res, 401, {
      error: 'Wrong password'
    });
  }

  const token = sign({
    exp: Date.now() + 8 * 60 * 60 * 1000
  });

  return json(res, 200, { token });
};
