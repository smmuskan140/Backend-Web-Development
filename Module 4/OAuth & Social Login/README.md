# LU 55 — OAuth & Social Login

## Implementation
- The Passport Google verify callback checks the stable `profile.id` / Google subject first.
- Existing local accounts are linked only when `profile._json.email_verified === true`.
- New accounts receive the `member` role by default.
- The callback issues Threadbase's own JWT with `sub` and `role`; Google's access token is never returned.

## Security questions

### Why is the order Google ID → email → create important?
A returning account must be found by its stable Google identity before considering an email match. Email can change and should only be used as a safe linking fallback after Google confirms it is verified. Checking email first can link the login to a different local account that happens to share that email, rather than honoring the already-established Google identity. The verified-email check prevents an unverified address from being used to take over a local account.

### Why issue our own JWT instead of returning Google's access token?
Google's access token is intended for Google's APIs and follows Google's scopes and expiry rules. It does not represent this application's roles or authorization claims. The app signs its own JWT containing `sub` and `role`, so existing `requireAuth` middleware can validate requests locally without forwarding a Google credential to clients.

## Setup
1. Copy `.env.example` to `.env` and set your own Google OAuth credentials and `ACCESS_SECRET`.
2. Run `npm install`.
3. Run `npm test` to execute the assignment test suite, or `npm start` to start the API.

The Google redirect URI must match the callback URL registered in Google Cloud Console. Never put `GOOGLE_CLIENT_SECRET` in frontend code.
