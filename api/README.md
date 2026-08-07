## Setup

- Copy `.env.example` to `.env` and fill values.
- Install dependencies with `npm install`.
- Run migrations: `npx knex migrate:latest`.
- Seed base data: `npx knex seed:run`.
- Start dev server: `npm run start`.

## Auth Notes

- API accepts bearer tokens and secure cookie auth (`auth_token`).
- Google login requires `GOOGLE_CLIENT_ID` and verified Google ID tokens.
- Password login and registration require `RECAPTCHA_SECRET_KEY` only when `NODE_ENV=production`. It must belong to the same reCAPTCHA v3 key pair as the frontend's `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
- Set `APP_ORIGIN` to the exact public frontend URL, including `https://`, then restart the API with `pm2 restart <api-name> --update-env`.
