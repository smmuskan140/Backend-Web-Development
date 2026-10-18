const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_SECRET || 'oauth-assignment-test-secret', {
    algorithm: 'HS256',
    expiresIn: '15m',
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.ACCESS_SECRET || 'oauth-assignment-test-secret', {
    algorithms: ['HS256'],
  });
}

module.exports = { signToken, verifyToken };
