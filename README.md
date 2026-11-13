# DarShe

Landing page, housing survey and admin for **DarShe**, a women-only co-living residence for working women in Dubai.

- **Landing page** at `/`: single page. Its "Take the survey" buttons link to the survey.
- **Survey** at `/survey`: the 34-question Women's Housing Survey as a 7-step form (one section per step).
- **API**: `POST /api/survey` validates, rate-limits and saves a response.
- **Admin** at `/admin/survey` (password-protected): responses list with search and filters, detail view, delete, CSV export.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · GSAP · Prisma 6 · Zod 4 · jose (session cookie) · SQLite locally, PostgreSQL in production.

## Folder structure

```
app/
  page.tsx                      Landing page (composes the sections)
  layout.tsx                    Fonts, metadata, Open Graph
  icon.svg                      Favicon (arch logo)
  survey/page.tsx               Survey page (/survey)
  api/survey/route.ts           Survey endpoint
  admin/login/                  Login page + server actions
  admin/(panel)/survey/         Responses: list, detail ([id]), delete, CSV export
components/
  landing/                      One component per landing section (+ GSAP animations)
  survey/SurveyForm.tsx         Multi-step survey form
  admin/DeleteButton.tsx        Two-step delete confirmation
  ui/Logo.tsx                   Inline SVG logo
lib/
  site-config.ts                Business details (email, location)
  survey.ts                     Survey questions, sections and validation (single source)
  survey-queries.ts             Admin filters
  rate-limit.ts, ...            Server helpers
prisma/
  schema.prisma                 Local schema (SQLite)
  migrations/                   SQLite migrations
  postgres/schema.prisma        Production schema (PostgreSQL)
  postgres/migrations/          PostgreSQL migrations
scripts/prisma.mjs              Runs Prisma against the right schema (see below)
middleware.ts                   Protects /admin/*
```

## Local setup

Requires Node 20.12 or newer.

```bash
npm install
cp .env.example .env     # then edit the values (on Windows: copy .env.example .env)
npm run db:migrate       # creates prisma/dev.db and applies migrations
npm run dev              # http://localhost:3000
```

Admin: <http://localhost:3000/admin/login>, using `ADMIN_PASSWORD` from your `.env`.

### Images

Place the brand photos in `public/images/` with exactly these names:

`hero.jpg`, `room-sage.jpg`, `lounge.jpg`, `room-cream.jpg`, `meals.jpg`, `housekeeping.jpg`, `wellness.jpg`, `dining.jpg`, `she-is-darshe.jpg`

To replace an image, overwrite the file with the same name. If the dev server still shows the old one, delete `.next/cache/images`.

### Business details

Edit `lib/site-config.ts` for the contact email and location. They appear in the footer, and the email also appears in the survey's error message. No phone number is published; to add one later, add a `phone` value there and a list item in `components/landing/Footer.tsx`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` locally; `postgresql://…` in production |
| `ADMIN_PASSWORD` | yes | Password for `/admin/login` |
| `SESSION_SECRET` | yes | Signs the admin session cookie. 32+ characters |
| `IP_HASH_SALT` | yes | Salt for the SHA-256 IP hash. Raw IPs are never stored |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL, used for canonical and Open Graph URLs |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database and migrations

Prisma can't switch database provider from an environment variable, so the project keeps two schemas that are identical apart from the datasource block:

| `DATABASE_URL` starts with | Schema used | Migrations |
|---|---|---|
| `file:` | `prisma/schema.prisma` (SQLite) | `prisma/migrations` |
| `postgresql://` | `prisma/postgres/schema.prisma` | `prisma/postgres/migrations` |

`scripts/prisma.mjs` picks the right one automatically, so the same commands work in both environments:

```bash
npm run db:migrate   # prisma migrate dev   (create/apply migrations while developing)
npm run db:deploy    # prisma migrate deploy (apply existing migrations; use in production)
npm run db:studio    # browse data
```

**When you change the data model**, edit both schema files, then:

1. With a `file:` URL, run `npm run db:migrate -- --name your_change` to create the SQLite migration.
2. Switch `DATABASE_URL` to a PostgreSQL database (a free Neon branch is fine) and run `npm run db:migrate -- --name your_change` to create the matching PostgreSQL migration.
3. Commit both migration folders.

`prisma migrate dev` is development-only. Production uses `migrate deploy`.

### Leftover `Enquiry` table

Enquiries were removed from the app. Databases created before that still contain an empty `Enquiry` table and an `EnquiryStatus` type. They are harmless and nothing reads them. To remove them, run this against the database yourself:

```sql
DROP TABLE "Enquiry";
DROP TYPE "EnquiryStatus";   -- PostgreSQL only
```

## Deploying to Vercel with Neon or Supabase

1. **Create a PostgreSQL database.**
   - Neon: create a project and copy the connection string (pooled is fine; it ends in `?sslmode=require`).
   - Supabase: Project Settings → Database → Connection string. Use the **pooler** URI (port 6543) and append `?pgbouncer=true` for the app. Migrations need a direct connection; if `migrate deploy` fails on the pooler, set `DATABASE_URL` to the direct URI (port 5432) for the build.
2. **Push the project to GitHub** and import it in Vercel.
3. **Add environment variables** in Vercel → Settings → Environment Variables (Production): everything in the table above, with `DATABASE_URL` set to the PostgreSQL URL and `NEXT_PUBLIC_SITE_URL` set to your domain.
4. **Deploy.** Vercel runs the `vercel-build` script, which generates the PostgreSQL client, applies pending migrations (`migrate deploy`) and builds the site.
5. Visit `/admin/login` and confirm you can sign in, then complete a test survey on the live site and check it appears in the admin (delete it afterwards so it isn't in your results).

### Production notes

- **Rate limiting** is in-memory (`lib/rate-limit.ts`): 10 survey submissions per IP per hour and 10 login attempts per 15 minutes. On serverless each instance has its own counters, so treat this as a basic safety net. Swap in Upstash Redis for real protection; the file contains the replacement snippet and the call sites don't change.
- The admin session cookie is `httpOnly`, `sameSite=lax` and `secure` in production, valid for 8 hours.

## Changing the admin password

The password is the `ADMIN_PASSWORD` environment variable. There is no user table.

- **Locally:** edit `ADMIN_PASSWORD` in `.env` and restart `npm run dev`.
- **Vercel:** change `ADMIN_PASSWORD` in Settings → Environment Variables, then **redeploy** so it takes effect.
- To sign everyone out immediately (for example after a password leak), also change `SESSION_SECRET`: every existing session cookie becomes invalid.

## Survey

The survey lives at `/survey` (not indexed by search engines; share the link directly).

- **Questions** are defined once in `lib/survey.ts`: wording, options, selection limits and sections. The browser form, the API and the admin views all read from it, so editing a question there updates everywhere.
- **Steps:** one section per step, with a progress bar and per-step validation. Single-choice and multi-choice questions are required; "Select up to N" limits and exclusive options (such as "None of the above") are enforced. The contact section is optional, but consent (Q34) is required if an email address or WhatsApp number is given.
- **Drafts:** an unfinished survey is kept in the respondent's browser (`localStorage`) so a refresh doesn't lose their answers. It is cleared on submit.
- **Storage:** each response is one `SurveyResponse` row. `answers` holds every answer as JSON keyed by question id (`q1`…`q34`); first name, email, WhatsApp number and consent are also copied into their own columns. Raw IPs are never stored (SHA-256 hash only).
- **Spam protection:** hidden honeypot field and the rate limit above.

To add or change a question, edit `lib/survey.ts`. Existing responses keep their stored answers; the CSV and detail view show an empty cell for questions a response doesn't have.

## Admin

- **List:** newest first, 20 per page, times in Dubai time (Asia/Dubai).
- **Search and filters:** search by first name, email or WhatsApp number; filter by age group, employment, "would consider DarShe", contact status (agreed / declined / no contact details) and received date range. Filters combine, and the URL keeps them so a filtered view can be bookmarked.
- **Detail view:** every answer by section, with `mailto:` and WhatsApp links.
- **Export CSV:** one row per response, one column per question, multi-select answers joined with `;`. It exports exactly what the current filters show.
- **Delete:** each response has a **Delete** button in its list row and on its detail page. It asks "Delete permanently?" first (Cancel is focused by default; Escape cancels). Deletion can't be undone, so export a CSV first if you want a backup.
- `/admin/*` is `noindex`, excluded in `robots.txt`, and sent with `X-Robots-Tag` and `no-store` headers.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm run db:*` | Prisma helpers (see above) |
