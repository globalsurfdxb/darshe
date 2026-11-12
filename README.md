# DarShe

Landing page and enquiry admin for **DarShe**, a women-only co-living residence for working women in Dubai.

- **Landing page** at `/`: single page, nine sections, enquiry form.
- **API** at `POST /api/enquiries`: validates, rate-limits, saves, optionally emails the team.
- **Admin** at `/admin/enquiries`: password-protected list, search, filters, status changes, CSV export.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · Prisma 6 · Zod 4 · jose (session cookie) · SQLite locally, PostgreSQL in production.

## Folder structure

```
app/
  page.tsx                      Landing page (composes the sections)
  layout.tsx                    Fonts, metadata, Open Graph
  icon.svg                      Favicon (arch logo)
  api/enquiries/route.ts        Enquiry endpoint
  admin/login/                  Login page + server actions
  admin/(panel)/enquiries/      List, detail ([id]), CSV export
components/
  landing/                      One component per landing section
  admin/                        Admin UI pieces
  ui/Logo.tsx                   Inline SVG logo
lib/
  site-config.ts                Every business detail (email, phone, address, response time)
  enquiry-schema.ts             Zod schema shared by the form and the API
  rate-limit.ts, email.ts, ...  Server helpers
prisma/
  schema.prisma                 Local schema (SQLite)
  migrations/                   SQLite migrations
  postgres/schema.prisma        Production schema (PostgreSQL)
  postgres/migrations/          PostgreSQL migrations
  seed.ts                       Five sample enquiries
scripts/prisma.mjs              Runs Prisma against the right schema (see below)
middleware.ts                   Protects /admin/*
```

## Local setup

Requires Node 20.12 or newer.

```bash
npm install
cp .env.example .env     # then edit the values (on Windows: copy .env.example .env)
npm run db:migrate       # creates prisma/dev.db and applies migrations
npm run db:seed          # optional: 5 sample enquiries
npm run dev              # http://localhost:3000
```

Admin: <http://localhost:3000/admin/login>, using `ADMIN_PASSWORD` from your `.env`.

### Images

Place the brand photos in `public/images/` with exactly these names:

`hero.jpg`, `room-sage.jpg`, `lounge.jpg`, `room-cream.jpg`, `meals.jpg`, `housekeeping.jpg`, `wellness.jpg`, `dining.jpg`, `she-is-darshe.jpg`

The repository currently contains labelled **placeholder** images under those names so the layout renders. Overwrite them with the real photos. Review the `alt` text in `components/landing/*.tsx` against the real photos: it was written before the images were available.

### Business details

Edit `lib/site-config.ts`. Replace the values marked `TODO` (email, phone, address, response time). They flow into the form, the footer and the "What happens next" steps.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` locally; `postgresql://…` in production |
| `ADMIN_PASSWORD` | yes | Password for `/admin/login` |
| `SESSION_SECRET` | yes | Signs the admin session cookie. 32+ characters |
| `IP_HASH_SALT` | yes | Salt for the SHA-256 IP hash. Raw IPs are never stored |
| `EMAIL_ENABLED` | no | `true` to email each new enquiry. Default off |
| `DARSHE_EMAIL` | if email on | Where notifications are delivered (falls back to `lib/site-config.ts`) |
| `EMAIL_FROM` | if email on | Sender, e.g. `DarShe <enquiries@yourdomain.com>`. Must be verified with your provider |
| `RESEND_API_KEY` | option A | Send via Resend |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | option B | Send via SMTP (Nodemailer); used when `RESEND_API_KEY` is empty |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL, used for canonical and Open Graph URLs |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Email failures never block or fail an enquiry. The enquiry is saved first; errors are logged.

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
npm run db:seed      # seed sample enquiries
npm run db:studio    # browse data
```

**When you change the data model**, edit both schema files, then:

1. With a `file:` URL, run `npm run db:migrate -- --name your_change` to create the SQLite migration.
2. Switch `DATABASE_URL` to a PostgreSQL database (a free Neon branch is fine) and run `npm run db:migrate -- --name your_change` to create the matching PostgreSQL migration.
3. Commit both migration folders.

`prisma migrate dev` is development-only. Production uses `migrate deploy`.

## Deploying to Vercel with Neon or Supabase

1. **Create a PostgreSQL database.**
   - Neon: create a project and copy the connection string (pooled is fine; it ends in `?sslmode=require`).
   - Supabase: Project Settings → Database → Connection string. Use the **pooler** URI (port 6543) and append `?pgbouncer=true` for the app. Migrations need a direct connection; if `migrate deploy` fails on the pooler, set `DATABASE_URL` to the direct URI (port 5432) for the build.
2. **Push the project to GitHub** and import it in Vercel.
3. **Add environment variables** in Vercel → Settings → Environment Variables (Production): everything in the table above, with `DATABASE_URL` set to the PostgreSQL URL and `NEXT_PUBLIC_SITE_URL` set to your domain.
4. **Deploy.** Vercel runs the `vercel-build` script, which generates the PostgreSQL client, applies pending migrations (`migrate deploy`) and builds the site.
5. Visit `/admin/login` and confirm you can sign in, then submit a test enquiry on the live site.
6. Optional: run the seed against production only if you want sample data (`DATABASE_URL=… npm run db:seed`). The seed only removes and recreates rows whose email ends in `@example.com`.

### Production notes

- **Rate limiting** is in-memory (`lib/rate-limit.ts`): 5 enquiries per IP per hour, and 10 login attempts per 15 minutes. On serverless each instance has its own counters, so treat this as a basic safety net. Swap in Upstash Redis for real protection; the file contains the replacement snippet and the call sites don't change.
- **Email**: with Resend, verify your sending domain and set `EMAIL_FROM` to an address on it. The default `onboarding@resend.dev` only delivers to the account owner.
- The admin session cookie is `httpOnly`, `sameSite=lax` and `secure` in production, valid for 8 hours.

## Changing the admin password

The password is the `ADMIN_PASSWORD` environment variable. There is no user table.

- **Locally:** edit `ADMIN_PASSWORD` in `.env` and restart `npm run dev`.
- **Vercel:** change `ADMIN_PASSWORD` in Settings → Environment Variables, then **redeploy** so it takes effect.
- To sign everyone out immediately (for example after a password leak), also change `SESSION_SECRET`: every existing session cookie becomes invalid.

## Admin features

- Newest first, 20 per page; search by name, email or phone; filter by status and occupation.
- Times are shown in Dubai time (Asia/Dubai).
- Detail view with `mailto:` and WhatsApp links, and a status dropdown (NEW → CONTACTED → CLOSED).
- **Export CSV** exports everything matching the current search and filters.
- `/admin/*` is `noindex`, excluded in `robots.txt`, and sent with `X-Robots-Tag` and `no-store` headers.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm run db:*` | Prisma helpers (see above) |
