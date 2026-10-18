require('dotenv').config();
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;

    // 1. Match the stable Google identity first.
    const returningUser = users.find((user) => user.googleId === googleId);
    if (returningUser) return done(null, returningUser);

    // 2. Link an existing local account only after Google verifies its email.
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      if (profile._json.email_verified !== true) return done(null, false);
      existingUser.googleId = googleId;
      return done(null, existingUser);
    }

    // 3. Create a new account with the lowest privilege by default.
    const newUser = {
      id: nextId(),
      googleId,
      email,
      name: profile.displayName,
      role: 'member',
    };
    users.push(newUser);
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
  callbackURL: '/auth/google/callback',
}, verifyCallback));

module.exports = { passport, verifyCallback };
