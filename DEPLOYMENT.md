# Deployment

## Branches

- `main` is the development branch.
- `master` is the production branch. Only code merged or committed to `master` is deployed to production.

## Production Server

- Host: `191.101.235.225`
- SSH user: `root`
- Repository: `/var/www/ebisutracker`
- Frontend: `/var/www/ebisutracker/app`
- API: `/var/www/ebisutracker/api`

PM2 processes:

- `ebisu-app`: Next.js frontend, run from `/var/www/ebisutracker/app` with `npm start`.
- `ebisu-api`: Express API, run from `/var/www/ebisutracker/api/app.js`.

## Frontend Deployment

After pushing the intended changes to `master`, connect to production and run:

```sh
ssh root@191.101.235.225
git -C /var/www/ebisutracker fetch origin
git -C /var/www/ebisutracker checkout master
git -C /var/www/ebisutracker pull --ff-only origin master
git -C /var/www/ebisutracker log -1 --oneline
npm ci --prefix /var/www/ebisutracker/app
rm -rf /var/www/ebisutracker/app/.next
npm run build --prefix /var/www/ebisutracker/app
pm2 restart ebisu-app
pm2 save
pm2 list
```

Always remove `app/.next` before building. Old Next.js build artifacts can cause missing-module failures after dependencies are installed or updated.

## API Deployment

When a production commit changes files under `api/`, update the repository as above, then run:

```sh
npm ci --prefix /var/www/ebisutracker/api
pm2 restart ebisu-api
pm2 save
pm2 list
```

Run database migrations when the release includes a new migration:

```sh
npm exec --prefix /var/www/ebisutracker --workspace money_tracker_api knex migrate:latest
```

## Verification

Confirm the deployed commit and PM2 state:

```sh
git -C /var/www/ebisutracker log -1 --oneline
pm2 describe ebisu-app
pm2 describe ebisu-api
```

Inspect logs if a process is not online:

```sh
pm2 logs ebisu-app --lines 100
pm2 logs ebisu-api --lines 100
```
