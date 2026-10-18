require('dotenv').config();
const assert = require('node:assert/strict');
const http = require('node:http');
const { users } = require('../src/data');
const { verifyCallback } = require('../src/auth/passport');
const { signToken, verifyToken } = require('../src/utils/jwt');
const app = require('../src/app');

let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log('✓ ' + name);
  } catch (error) {
    failed++;
    console.error('✗ ' + name + ': ' + error.message);
  }
}
function callVerify(profile) {
  let result;
  let thrown;
  verifyCallback('unused-google-access-token', null, profile, (error, user) => {
    thrown = error;
    result = user;
  });
  if (thrown) throw thrown;
  return result;
}
function profile(id, email, name, verified = true) {
  return { id, emails: [{ value: email }], displayName: name, _json: { email_verified: verified } };
}

async function request(port, path, token) {
  return new Promise((resolve, reject) => {
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    http.get({ hostname: '127.0.0.1', port, path, headers }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} }));
    }).on('error', reject);
  });
}

async function main() {
  // Reset the known starter records so the tests are repeatable.
  users.splice(0, users.length,
    { id: 'u-bob', googleId: 'google-bob-123', email: 'bob@example.com', name: 'Bob', role: 'moderator' },
    { id: 'u-alice', email: 'alice@example.com', name: 'Alice', role: 'member' },
    { id: 'u-admin', email: 'admin@example.com', name: 'Admin', role: 'admin' }
  );

  const bob = callVerify(profile('google-bob-123', 'bob@example.com', 'Bob'));
  check('returning Google user is found by googleId', () => assert.equal(bob.id, 'u-bob'));
  check('returning user keeps moderator role', () => assert.equal(bob.role, 'moderator'));
  check('returning user does not create a duplicate', () => assert.equal(users.length, 3));

  const alice = callVerify(profile('google-alice-456', 'alice@example.com', 'Alice'));
  check('verified email links the existing local account', () => assert.equal(alice.id, 'u-alice'));
  check('linked account stores the Google ID', () => assert.equal(alice.googleId, 'google-alice-456'));
  check('linking does not create a duplicate', () => assert.equal(users.length, 3));

  const beforeCarol = users.length;
  const carol = callVerify(profile('google-carol-789', 'carol@example.com', 'Carol'));
  check('unknown Google profile creates a user', () => assert.ok(carol));
  check('new account is added to the store', () => assert.equal(users.length, beforeCarol + 1));
  check('new account defaults to member role', () => assert.equal(carol.role, 'member'));
  check('new account stores the stable Google ID', () => assert.equal(carol.googleId, 'google-carol-789'));
  check('new account stores the email and display name', () => {
    assert.equal(carol.email, 'carol@example.com');
    assert.equal(carol.name, 'Carol');
  });

  const aliceGoogleId = alice.googleId;
  const attacker = callVerify(profile('attacker-google-id', 'alice@example.com', 'Attacker', false));
  check('unverified email linking is rejected', () => assert.equal(attacker, false));
  check('rejected linking leaves Alice Google ID unchanged', () => assert.equal(alice.googleId, aliceGoogleId));

  const token = signToken({ sub: carol.id, role: carol.role });
  const decoded = verifyToken(token);
  check('app JWT contains the correct subject', () => assert.equal(decoded.sub, carol.id));
  check('app JWT contains the correct role', () => assert.equal(decoded.role, 'member'));

  const server = app.listen(0);
  try {
    const port = server.address().port;
    const authorized = await request(port, '/posts', token);
    check('valid app JWT accesses protected GET /posts', () => assert.equal(authorized.status, 200));
    check('protected route returns the correct userId', () => assert.equal(authorized.body.userId, carol.id));
    const unauthorized = await request(port, '/posts');
    check('request without a token returns 401', () => assert.equal(unauthorized.status, 401));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
