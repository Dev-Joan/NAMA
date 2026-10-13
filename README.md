# NAMA Polyclinic website

The website of NAMA Polyclinic in Jal El Dib, in French, English and Arabic.
A static React + Vite site: no server, no database. The contact form sends
messages by email through [Web3Forms](https://web3forms.com).

## Run it locally

You need [Node.js](https://nodejs.org) 22 or newer and [pnpm](https://pnpm.io).

```sh
cp .env.example .env   # then fill in VITE_WEB3FORMS_KEY (and SITE_URL if you have it)
pnpm install
pnpm dev               # http://localhost:5173
```

| Command          | What it does                                          |
|------------------|-------------------------------------------------------|
| `pnpm dev`       | Development server with live reload                   |
| `pnpm build`     | Type-checks, then builds the site into `dist/`        |
| `pnpm preview`   | Serves the built `dist/` folder to test it locally    |
| `pnpm typecheck` | Type-checks only                                      |

## Where things are

| What                                   | Where                              |
|----------------------------------------|------------------------------------|
| All page text (FR, EN, AR), team, form | `src/App.tsx` (`translations`)     |
| Privacy policy and legal notice        | `src/legal.tsx`                    |
| Phone number, email, page links        | `src/site.ts`                      |
| Styles                                 | `src/index.css`                    |
| Team photos (how to add someone)       | `src/assets/team/` (see its README)|
| Icons, share image, redirects          | `public/`                          |

## Deploy on Cloudflare Pages

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**,
   and pick this repository.
2. Build settings:
   - Framework preset: **None** (or Vite)
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Root directory: leave empty
3. Under **Settings → Variables and Secrets**, add for Production (and Preview):
   - `VITE_WEB3FORMS_KEY`: the Web3Forms access key
   - `SITE_URL`: the public address, e.g. `https://www.namapolyclinic.com`
     (used for the canonical URL, the share image and `sitemap.xml`)
   - `PNPM_VERSION`: `12.10.1` (same pnpm as `packageManager` in `package.json`)
   - `PREVIEW`: `true` during the review period, so search engines stay out
     (noindex on every page, `robots.txt` disallows everything, no sitemap).
     Delete it at launch and redeploy.
4. Save and deploy. Every push to the main branch redeploys automatically.

Node 22 is picked up from `.node-version`. The legal pages (`/confidentialite`,
`/mentions-legales`) are served by the same page through `public/_redirects`, so
they work when opened directly or refreshed.

After the first deploy, send one test message from the contact form and check
that it arrives at namapolyclinic@gmail.com (look in spam the first time).
