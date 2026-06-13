/* Vercel serverless function — POST /api/doll
   Thin wrapper around the shared Doll brain. Works on Vercel with
   zero config; set ANTHROPIC_API_KEY (and optionally DOLL_MODEL)
   in the project's environment variables. */
var core = require('../lib/doll-core');

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  return await new Promise(function (resolve) {
    var data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }
  try {
    var body = await readJson(req);
    var out = await core.getReply(body);
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(out));
  } catch (err) {
    res.statusCode = err && err.code ? err.code : 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: (err && err.message) || 'error' }));
  }
};
