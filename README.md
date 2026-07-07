# Auction Survey Prep Tool

Mobile-first SPA for logging lost-and-found auction items with photos, client-side image compression, and one-click export that matches the M:-drive folder scheme.

Built with **Wensity UI** components on **Vite + React + Tailwind CSS v4**, deployed to **Cloudflare Workers** with **D1** (SQLite) and **R2** (photo storage).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

The app talks to a Cloudflare Worker API at `/api/*`. In dev mode the Worker runs locally via the Cloudflare Vite plugin. You'll need a D1 database and R2 bucket created in your Cloudflare dashboard before the API works.

## Project structure

```
src/
  screens/        # Login, ItemsList, ItemForm, Admin
  components/
    wensity/      # Wensity UI design-system components
  lib/            # API client, hash router, image compression, export, XLSX scanner
worker/
  index.ts        # Cloudflare Worker API (auth, CRUD, file uploads)
schema.sql        # D1 table definitions
```

## Deploy (one-time setup)

Requires a free Cloudflare account. Note: enabling **R2** requires a payment card on file even though the 10 GB free tier is never billed.

```bash
npx wrangler login                                # opens browser

npx wrangler d1 create auction-survey-prep        # prints a database_id →
#   paste it into wrangler.jsonc under "database_id" before continuing

npx wrangler r2 bucket create auction-survey-photos

npx wrangler d1 execute auction-survey-prep --remote --file=schema.sql

npm run deploy     # builds frontend + deploys Worker to *.workers.dev
```

The deploy prints the live URL. First visit shows a one-time **create admin account** page. Then in Admin → Numbering, upload `L&F Master - Survey.xlsx` to seed the survey-number counter, and add student accounts under Admin → Users. On phones, use the browser's *Add to Home Screen* to install the app.

**When deploying changes, bump `CACHE_VERSION` in `public/sw.js`** so installed phones pick up the new build.

## API

| Endpoint                          | Method | Auth    | Description                    |
|-----------------------------------|--------|---------|--------------------------------|
| `/api/me`                         | GET    | —       | Session status + setup check   |
| `/api/setup`                      | POST   | —       | First-run admin creation       |
| `/api/login` / `/api/logout`      | POST   | —       | Session auth                   |
| `/api/items`                      | GET    | ✓       | List/search items              |
| `/api/items`                      | POST   | ✓       | Create item (auto-numbered)    |
| `/api/items/:id`                  | GET/PUT/DELETE | ✓ | Single item CRUD         |
| `/api/items/:id/photos`           | POST   | ✓       | Upload photo (binary body)     |
| `/api/photos/:id`                 | GET/DELETE | ✓    | Serve / delete photo           |
| `/api/items/mark-exported`        | POST   | ✓ (admin)| Batch status update          |
| `/api/next-number`                | GET    | ✓       | Preview next survey number     |
| `/api/users`                      | GET/POST | ✓ (admin)| List / create users        |
| `/api/users/:id`                  | DELETE | ✓ (admin)| Delete user                  |
| `/api/users/:id/password`         | POST   | ✓ (admin)| Reset password               |
| `/api/settings`                   | GET/PUT | ✓ (admin)| Prefix / numbering override |
| `/api/seed`                       | POST   | ✓ (admin)| Seed numbering from xlsx scan |

## Export ZIP layout

Matches the manual M:-drive scheme:

```
27-LF001_Red Trek Bike/
  Pictures/1.jpg ...
  27-LF001 Notes.txt
Master Survey Import.csv
Master Survey Paste.txt
```

Extract the ZIP into `M:\Property\LOST AND FOUND\AUCTIONS L&F\FY XX-XX\`. The app's Price field maps to the master sheet's **Original Amount** column and Disposal Action is pre-filled with `AUCTION` (adjust in `src/lib/export.ts`).

## Fiscal year numbering

FY starts July 1. Survey numbers use the two-digit ending year: July 2026 → `27-LF001`, July 2027 → `28-LF001`. Assignment is atomic (concurrent saves can't collide); manual numbers are allowed with a duplicate check.
