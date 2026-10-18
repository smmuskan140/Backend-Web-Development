# LU 54 — Authorization & RBAC

Authentication is already provided. This assignment adds role-based authorization and resource ownership checks.

## Setup

```bash
cp .env.example .env
npm install
npm test
npm start
```

The test suite uses the local test secret in `.env.example`. Do not use that secret in production.

## Implemented authorization rules

- `requireAuth` verifies the Bearer token and sets trusted `req.user = { id, role }`.
- `requireRole(...allowedRoles)` returns 401 if identity is missing, 403 if the verified role is not allowed, and calls `next()` otherwise.
- `DELETE /users/:id` is admin-only.
- `POST /posts/:id/hide` is restricted to moderators and admins.
- `PATCH /posts/:id` and `DELETE /posts/:id` require the caller to own the post or have a moderator/admin role.
- Missing posts return 404 before ownership is evaluated.
- Roles are read only from `req.user.role`, never from client-controlled request data.

## Why test case #2 now returns 403

Member B is authenticated, but does not own member A's post and has no privileged role. The shared `loadOwnedOrPrivileged` helper in `src/routes/posts.js` compares `post.authorId` with `req.user.id` and returns `403 FORBIDDEN` when neither ownership nor the moderator/admin bypass applies. This closes the Broken Object Level Authorization (IDOR) vulnerability.
