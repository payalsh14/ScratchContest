const { json, method, sheet } =
  require('../lib/api-utils');

module.exports = async (req, res) => {
  if (!method(req, res, 'POST')) return;

  const { regId, problem, link } = req.body || {};

  if (
    !regId ||
    !['P1', 'P2', 'P3', 'P4'].includes(problem)
  ) {
    return json(res, 400, {
      error: 'Please register and select a valid problem.'
    });
  }

  if (
    !/^https:\/\/scratch\.mit\.edu\/projects\/\d+\/?$/.test(
      String(link || '')
    )
  ) {
    return json(res, 400, {
      error: 'Enter a valid Scratch project URL.'
    });
  }

  try {
    await sheet('submit', {
      submission: {
        regId,
        problem,
        link,
        at: Date.now()
      }
    });

    return json(res, 200, { ok: true });

  } catch (error) {
    console.error('Submission error:', error);

    return json(res, 502, {
      error: error.message ||
        'Submission could not be saved.'
    });
  }
};
