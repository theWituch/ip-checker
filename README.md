# ip-checker

Static page for checking whether the current public IP address exists in the saved list.

## How it works

- the user's public IP address is fetched from `https://api.ipify.org`
- the IP list is stored locally in the browser (`localStorage`)
- the list uses JSON format: an array of objects with `name` and `ip` fields
- if the current IP matches an entry from the list, that record is highlighted

## Local run

If you have Docker Desktop installed:

- `npm run serve:nginx`
- open `http://localhost:8080`
- stop it with `npm run serve:nginx:stop`

The entry point is `index.html`.

## Deployment

The project can be deployed to any static hosting platform, for example:

- GitHub Pages
- Netlify
- Cloudflare Pages
- Vercel in static mode
