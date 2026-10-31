# Rayan Academy Frontend

Rayan Academy's frontend is built with **Next.js App Router**, React, TypeScript, and Tailwind CSS. It is prepared to integrate with an ASP.NET Core Web API; the backend is responsible for authentication, authorization, validation, scheduling, and persistence.

## Run locally

```bash
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL in .env.local
npm run dev
```

Open `http://localhost:3000`.

## Main routes

- `/` — public academy landing page
- `/contact`, `/login`, `/signup` — public pages
- `/student/dashboard` — student overview
- `/student/availability` — student selects one available teacher slot and requests a lesson
- `/teacher/availability` — teacher publishes available time slots
- `/teacher/lesson-requests` — teacher confirms or rejects student requests
- `/admin/lesson-approvals` — admin final approval queue

## Scheduling model

Each lesson is booked individually. Teacher publishes availability → student chooses one slot → teacher confirms → admin approves → confirmed lesson is created. The student can repeat the process for their next lesson. Recurring series are intentionally deferred.

The frontend's expected .NET endpoints, request/response examples, and server-side consistency rules are documented in [`docs/dotnet-integration.md`](docs/dotnet-integration.md).

## Important

- Public signup creates students only. Admin/teacher account provisioning must be protected by the backend.
- The `user-role` cookie is only a client navigation hint, never an authorization mechanism.
- The scheduling UI depends on the API contract in `docs/dotnet-integration.md`; it will show API errors until those endpoints are implemented.
- LiveKit voice and screen-sharing integration is intentionally deferred until the account and lesson booking workflow is working.

## Deploy and connect to the API

The API is a separate .NET host (for example `https://your-site.runasp.net`). Netlify and Vercel cannot run it. Both settings below are read at build time, so every change requires a redeploy.

### Recommended: same-origin proxy

1. Set `API_ORIGIN=https://your-site.runasp.net` in the frontend hosting environment (Production and Preview).
2. Leave `NEXT_PUBLIC_BACKEND_URL` unset or empty.
3. Redeploy. The browser calls `/api/*` on the frontend origin and `next.config.mjs` rewrites it to the API.

This keeps the `academy-auth` cookie on the frontend domain, so `middleware.ts` can read it and browsers do not treat it as a third-party cookie. Keep `Cookie__SameSite=Lax` on the API, and keep `AllowedOrigins` on the API set to the frontend origin, because proxied POSTs forward the browser's `Origin` header.

### Direct cross-origin

1. Set `NEXT_PUBLIC_BACKEND_URL=https://your-site.runasp.net` (origin only, no `/api` suffix) for Production and Preview.
2. On the API set `AllowedOrigins=https://your-frontend.example` and `Cookie__SameSite=None`. HTTPS is required for `Secure` cookies.
3. Redeploy.

The cookie then belongs to the API domain: `middleware.ts` cannot see it, and Safari or private windows may block it as a third-party cookie.

### Verify

- `https://your-frontend.example/api/auth/me` returns the API's JSON `401` while signed out. That 401 (not an HTML page) proves the rewrite reaches the API; health checks live at the API root (`/health`), not under `/api`.
- Login returns 200 and sets `academy-auth`.
- Reloading a dashboard keeps the user signed in, and `/api/auth/me` returns the profile.
