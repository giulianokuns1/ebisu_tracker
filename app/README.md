## Local Development

- Copy `.env.example` to `.env.local` and fill values.
- Install dependencies with `npm install`.
- Start app with `npm run dev`.

## Deploy

- Create `.env.local` with the production values before building. `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` must be the reCAPTCHA v3 site key registered for the deployed frontend domain.
- Get the updated version of the `production` branch.
- Run `npm install`.
- Run `npm run build`.
- Restart the app: `pm2 restart app --update-env`, or start it with `pm2 start npm --name "app" -- start` when it is not yet managed by PM2.
