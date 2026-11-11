# Ana Quran Academy Frontend

Ana Quran Academy's frontend is built with **Next.js App Router**, React, TypeScript, and Tailwind CSS. It is the web client for the ASP.NET Core API; the backend owns authentication, authorization, validation, scheduling, lesson operations, payments, and persistence.

**Product and business rules:** [`../docs/business-requirements/`](../docs/business-requirements/README.md). Read it before changing a flow; several pages that look like features are hardcoded mockups (listed there).

## Run locally

```bash
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL in .env.local
npm run dev
```

Open `http://localhost:3000`.

## Main routes

Public:

- `/` — landing page with reviews and teacher highlights
- `/about` — global positioning, subjects, fees, and FAQ
- `/blog`, `/blog/{slug}` — Quran learning guides with RSS at `/blog/rss.xml`
- `/contact`, `/login`, `/signup`, `/forgot-password` — contact and authentication (email/password or phone OTP)
- `/teach` — teacher application with CV and recording uploads

Student:

- `/student/dashboard` — overview
- `/student/availability` — teacher directory and instant weekly multi-select booking
- `/student/teachers/{id}` — teacher profile and weekly times
- `/student/change-time/{seriesId}` — move your weekly time to another time your teacher publishes; times whose next class is closer than the academy's notice window are not offered
- `/student/payments` — monthly USD statement and claim
- `/schedule`, `/lesson/{id}` — recurring schedule, live room, recap/report/review, lesson operations

Teacher:

- `/teacher/dashboard`, `/teacher/availability`, `/teacher/schedule`, `/teacher/payments`
- Teachers publish weekly rules, see bookings, write reports, and review EGP earnings. There is no teacher request/approval screen.

Admin:

- `/admin/dashboard`, `/admin/students`, `/admin/teachers`, `/admin/assignments`, `/admin/change-requests`, `/admin/teacher-applications`
- `/admin/lessons`, `/admin/lesson-ops`, `/admin/payments`, `/admin/transcripts`, `/admin/support`
- `/support/transcripts`, `/support/transcripts/{id}`, `/support/weekly` — review queue and digest (also reachable by admins)

Support role:

- `/support/transcripts`, `/support/transcripts/{id}`, `/support/weekly`, `/profile`

`/admin/courses`, `/admin/reports`, `/courses`, `/sessions`, `/assignments`, `/invoices`, `/parent/dashboard`, and `/teacher/courses` are **mock screens** with hardcoded data and no API. Do not build on them.

## Scheduling model

A teacher publishes **weekly rules** (weekday + window + IANA time zone; 30, 45, or 60 minutes). Announcing a rule is the teacher's consent, so a student books **any number** of that teacher's open rules instantly — no teacher confirmation and no admin approval. Each booking becomes a permanent series; the API materializes 8 weeks of lessons and rolls the window forward. A student's first-ever lesson is the free trial.

To move a weekly time, the student submits a change request that only the **admin** handles; the teacher is notified that a review is happening but does not see the requested time until approval. Students can end a series themselves.

The frontend's expected .NET endpoints, request/response examples, and server-side consistency rules are documented in [`docs/dotnet-integration.md`](docs/dotnet-integration.md).

## Important

- Public signup creates students only. Admin/teacher/support accounts are provisioned by an admin or by approving a teacher application.
- The `user-role` cookie is only a client navigation hint, never an authorization mechanism.
- Live lessons use self-hosted Jitsi (not LiveKit). The room is unlisted but not authenticated; see the business-requirements live-lesson doc for the exact limits.
- Authenticated pages render from a cached identity and revalidate in the background; do not block first paint on `/api/auth/me`.
- Web has no contact-inbox page; the API and mobile admin screen exist.

## SEO and crawlers

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin in production (for example `https://www.your-domain.com`). It drives canonical URLs, Open Graph URLs, `sitemap.xml`, `robots.txt`, `llms.txt`, and `llms-full.txt`. On Vercel, the build falls back to `VERCEL_PROJECT_PRODUCTION_URL`; other hosts must set the variable.

The public site is English-only and targets English-speaking students worldwide, so there are no regional versions and no `hreflang` tags. Only `/`, `/about`, `/blog`, `/blog/{slug}`, `/contact`, and `/teach` are indexable. Mock and authenticated routes are excluded, and `/courses` is explicitly `noindex` while it remains hardcoded.

Blog posts live in `src/lib/blog.ts` and render through `/blog` and `/blog/[slug]`. The sitemap, RSS feed (`/blog/rss.xml`), per-article Open Graph images, `llms.txt`, and `llms-full.txt` are generated from that list, so adding a post only requires a new entry there. Bump `CONTENT_LAST_UPDATED` in `src/lib/seo.ts` when the marketing pages change so sitemap `lastmod` stays meaningful.

Optional search-engine verification meta tags are read from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION`. Vercel preview deployments automatically send `X-Robots-Tag: noindex, nofollow` and serve a disallow-all `robots.txt`; production and self-hosted builds are unaffected. The web manifest and 180/192/512 PNG icons live alongside the app routes.

Bing/Yandex/Seznam/Naver are notified through IndexNow. The key file is `public/86895a67c74f1ba77dcc62177d618bab.txt` (served at `/<key>.txt`). Once a production deploy is live, run `npm run indexnow` to submit every URL in the live sitemap, or `npm run indexnow -- <url>` to submit specific pages such as a new article; `--dry-run` prints the payload without sending. Rotating the key only requires replacing that file — the script reads the filename and contents from `public/`.

## Deploy and connect to the API

The API is a separate .NET host (for example `https://your-site.runasp.net`). Netlify and Vercel cannot run it. Both settings below are read at build time, so every change requires a redeploy.

### Recommended: same-origin proxy

1. Set `API_ORIGIN=https://your-site.runasp.net` in the frontend hosting environment (Production and Preview).
2. Leave `NEXT_PUBLIC_BACKEND_URL` unset or empty.
3. Redeploy. The browser calls `/api/*` on the frontend origin and `next.config.mjs` rewrites it to the API.

This keeps the `academy-auth` cookie on the frontend domain, so `middleware.ts` can read it and browsers do not treat it as a third-party cookie. Keep `Cookie__SameSite=Lax` on the API, and keep `AllowedOrigins` on the API set to the frontend origin, because proxied POSTs forward the browser's `Origin` header.

### Real-time updates

The browser holds a SignalR WebSocket to the API for change hints (the screens still fetch through REST). WebSocket upgrades do not reliably pass through the `/api` rewrite, so point the socket straight at the API:

1. Set `NEXT_PUBLIC_REALTIME_URL=https://your-site.runasp.net` (origin only) for Production and Preview. Without it the client uses the `hub` URL returned by `GET /api/realtime/ticket`.
2. On the API, optionally set `Realtime__PublicUrl=https://your-site.runasp.net` so the ticket always reports the API origin, even when the request arrived through the proxy.

Authentication uses a short-lived ticket from `/api/realtime/ticket` (sent with the cookie), never a long-lived token in the URL.

### Direct cross-origin

1. Set `NEXT_PUBLIC_BACKEND_URL=https://your-site.runasp.net` (origin only, no `/api` suffix) for Production and Preview.
2. On the API set `AllowedOrigins=https://your-frontend.example` and `Cookie__SameSite=None`. HTTPS is required for `Secure` cookies.
3. Redeploy.

The cookie then belongs to the API domain: `middleware.ts` cannot see it, and Safari or private windows may block it as a third-party cookie.

### Verify

- `https://your-frontend.example/api/auth/me` returns the API's JSON `401` while signed out. That 401 (not an HTML page) proves the rewrite reaches the API; health checks live at the API root (`/health`), not under `/api`.
- Login returns 200 and sets `academy-auth`.
- Reloading a dashboard keeps the user signed in, and `/api/auth/me` returns the profile.
