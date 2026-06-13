/* Netlify function — proxied from /api/doll via netlify.toml.
   Reuses the same Doll brain as the Vercel handler. Set
   ANTHROPIC_API_KEY (and optionally DOLL_MODEL) in Netlify env. */
var core = require('../../lib/doll-core');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  var body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  try {
    var out = await core.getReply(body);
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(out) };
  } catch (err) {
    return {
      statusCode: err && err.code ? err.code : 502,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: (err && err.message) || 'error' })
    };
  }
};
