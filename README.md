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
