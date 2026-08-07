# Ebisu Tracker

Ebisu Tracker is a monorepo containing the personal finance web app and its API.

## Services

- `app/`: Next.js frontend.
- `api/`: Express API and database migrations.

## Local Development

1. Copy `app/.env.example` to `app/.env.local` and provide the frontend configuration.
2. Copy `api/.env.example` to `api/.env` and provide the API and database configuration.
3. Install all workspace dependencies with `npm install`.
4. Run database migrations with `npm exec --workspace money_tracker_api knex migrate:latest`.
5. Seed base data with `npm exec --workspace money_tracker_api knex seed:run`.
6. Start both services with `npm run dev`.

## Commands

- `npm run app:dev`: run the Next.js development server.
- `npm run app:lint`: lint the frontend.
- `npm run app:build`: create the frontend production build.
- `npm run api:dev`: run the API with nodemon.
- `npm run api:start`: run the API with Node.js.

## Branches

- `main`: development branch.
- `master`: production branch.
