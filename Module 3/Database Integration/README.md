# LU 3.15 — Database Integration

This folder contains a PostgreSQL/Prisma implementation behind repository interfaces. Prisma is imported only by the shared database module and repository modules; services and controllers should continue to depend on repository methods.

## Setup

1. Install Node.js and PostgreSQL.
2. From this directory run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to your local PostgreSQL database. Never commit `.env`.
4. Run `npm run prisma:format`, `npm run prisma:validate`, and `npm run prisma:generate`.
5. Apply the committed migration with `npm run db:deploy`. For a new local development database, `npx prisma migrate dev` can apply and track migrations.
6. Use `npm run db:studio` to inspect data.

## Repository contract

All repositories expose asynchronous `findAll`, `findById`, `create`, `update`, and `remove` methods. `findAll` resolves to an array; `findById` resolves to a record or `null`; `create` resolves to the created record; `update` resolves to the updated record or `null`; `remove` resolves to `true` or `false`. Composite-key repositories use an object ID (for example `{ followerId, followingId }`).

## Constraints and safe errors

The schema uses foreign keys, explicit cascade deletion, indexes, unique usernames/tags, unique votes per user/post, and composite keys for follows and post tags. Known Prisma constraint errors are mapped to safe application-level errors in `src/utils/databaseErrors.js`; raw database messages should never be sent to API clients.

## Scope note

This folder is self-contained so it does not overwrite the existing assignments in the fork. The starter folder for LU 3.15 was not identified through the repository file API during this run, so the existing application services/controllers/routes have not been rewired here. Validate this folder against the exact starter layout and run the migration/tests against a configured PostgreSQL database before submission.
