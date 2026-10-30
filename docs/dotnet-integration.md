# Rayan Academy — ASP.NET Core integration contract

This frontend uses **Next.js App Router** (`src/app`). There is no Pages Router. The ASP.NET Core API owns authentication, authorization, validation, scheduling rules, and persistence. The frontend does not use Supabase.

## Configuration

Create `.env.local` from `.env.local.example` and set:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

For production, prefer a same-origin reverse proxy so the API's HttpOnly session cookie is sent naturally to the Next.js origin. If frontend and API use different origins, configure exact-origin credentialed CORS and appropriate cookie `SameSite`, `Secure`, and domain settings.

## Authentication

| Method | Endpoint             | Purpose                          |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/auth/register` | Public student registration only |
| POST   | `/api/auth/login`    | Sign in                          |
| GET    | `/api/auth/me`       | Current authenticated user       |
| POST   | `/api/auth/logout`   | End session                      |
| POST   | `/api/auth/otp/request` | Send a sign-in/sign-up code to a phone |
| POST   | `/api/auth/otp/verify`  | Verify the code and start a session    |

### Phone OTP

`POST /api/auth/otp/request` takes `{ "phone": "+15550100001" }` and normalizes the number to `+<digits>` (8–15 digits, else `400`). Responses:

- `202 { message, devMode, devCode }` — `devCode` is only populated in dev mode.
- `429` when a code was requested for the same number less than 60 seconds ago.
- `503` in production until an `IOtpSender` is configured, so codes are never silently dropped.
- IP rate limit: 10 requests per 10 minutes.

`POST /api/auth/otp/verify` takes `{ "phone", "code", "fullName"? }`:

- Unknown number without `fullName` → `200 { "requiresProfile": true }`; ask for the name and call again.
- Unknown number with `fullName` → creates a **student** account (`UserName`/`PhoneNumber` = normalized phone, no email), signs it in, returns `200 { user }`.
- Known number → signs in and returns `200 { user }`.
- Wrong or expired code → `401`. Codes expire after 5 minutes and allow 5 attempts; successful use invalidates the code.

Development bypass: `Otp:DevMode` (defaults to `ASPNETCORE_ENVIRONMENT=Development`) and `Otp:DevCode` (default `8888`). With it enabled, every number accepts `8888` and no message is sent. Set `Otp:DevMode=false` in production and register an `IOtpSender` implementation (Twilio Verify, Meta WhatsApp Cloud API, or an SMS gateway).

#### Free SMS via TextBee

`IOtpSender` ships with a TextBee implementation (`Otp:Sender=textbee`), which sends from the SIM of an Android phone registered to a TextBee account — no per-message cost. Free plan: 1 device, 50 messages/day, 300/month (`https://textbee.dev`). Requirements: an Android 7+ phone with a SIM, always online, with the TextBee app installed.

```env
OTP_DEV_MODE=false
OTP_SENDER=textbee
TEXTBEE_API_KEY=<from the TextBee dashboard>
TEXTBEE_DEVICE_ID=<optional, when the account has several phones>
```

If the gateway rejects the message, `/api/auth/otp/request` returns `502` and immediately releases the 60-second resend cooldown. When `Otp:DevMode=false` and no sender is configured, the endpoint returns `503` instead of pretending a code was sent.

There is no free WhatsApp option for real users: the Meta Cloud API test number is limited to about five opted-in recipients, and production authentication templates are billed per message.

Phone accounts have no email and no password; they can only sign in through the mobile tab. Email sign-in for them is not available.

The API should issue an HttpOnly cookie (default expected name: `academy-auth`). Use `Secure` in production, `SameSite=Lax` where deployment permits, and an appropriate expiry. `GET /api/auth/me` may return either `{ "user": { ... } }` or the user object directly. User roles are `student`, `teacher`, `admin` (and optionally `super_admin`). Public registration must ignore or reject any role supplied by the browser and always create a student. Teacher/admin accounts must be provisioned by an authorized admin.

The browser-readable `user-role` cookie is only a navigation hint. Never use it as authorization evidence.

## Core account and assignment endpoints

| Method | Endpoint                                | Purpose                                               |
| ------ | --------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/students`                         | Admin list; teacher-scoped list if policy permits     |
| POST   | `/api/students`                         | Admin creates a student account                       |
| GET    | `/api/teachers`                         | Admin list                                            |
| GET    | `/api/teacher-student-assignments`      | List assignments                                      |
| POST   | `/api/teacher-student-assignments`      | Assign `{ "teacherId": "uuid", "studentId": "uuid" }` |
| DELETE | `/api/teacher-student-assignments/{id}` | Deactivate assignment                                 |

A student has at most one active teacher at a time; the API enforces this and reassignment replaces the previous active assignment.

`GET /api/teachers` and `GET /api/students` accept `?includeInactive=true` for admins so deactivated accounts stay visible for reactivation. Non-admin callers always get active accounts only.

### Admin account management

| Method | Endpoint                | Purpose                                                      |
| ------ | ----------------------- | ------------------------------------------------------------ |
| POST   | `/api/admin/users`      | Create a `teacher` (or `student`) account                    |
| GET    | `/api/teachers/{id}`    | Teacher detail (used by the admin slot screen)               |
| PATCH  | `/api/admin/users/{id}` | Update `{ "fullName"?, "email"?, "password"?, "isActive"? }` |
| DELETE | `/api/admin/users/{id}` | Deactivate a teacher/student account                         |

`PATCH`/`DELETE` apply only to teacher and student accounts and return `409` for a duplicate email or when an account still has upcoming lessons. Deactivation is soft (`isActive=false`): lesson history is preserved, active assignments are removed, pending lesson requests are rejected with their slots released, and future unused availability slots are deleted. Deactivated users cannot log in and `GET /api/auth/me` returns `401`.

### Admin availability management

| Method | Endpoint                                                | Purpose                                                                     |
| ------ | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/admin/teachers/{teacherId}/availability`          | List a teacher's slots                                                      |
| POST   | `/api/admin/teachers/{teacherId}/availability`          | Publish `{ "startsAt": "ISO-8601", "endsAt": "ISO-8601" }` for that teacher |
| DELETE | `/api/admin/teachers/{teacherId}/availability/{slotId}` | Delete one of that teacher's unused available slots                         |

Admin-published slots follow the same rules as teacher-published slots: they must be in the future, no longer than 4 hours, and must not overlap the teacher's other slots or lessons. Only slots in the `available` state can be deleted.

`POST /api/students` is the admin-only provisioning flow used by `/admin/students`. The frontend sends:

```json
{
  "fullName": "Amina Hassan",
  "email": "amina@example.com",
  "password": "Temporary1!",
  "grade": "Grade 4"
}
```

`grade` is optional. The API must ignore any role in the body and always create `student`. Return the created student as `{ "id": "uuid", "name": "Amina Hassan", "fullName": "Amina Hassan", "email": "...", "grade": "Grade 4" }`.

The student scheduling endpoints derive the student identity from the authenticated session. Students must not be able to submit another student's ID.

## Scheduling workflow (agreed MVP)

- Lessons are **individual**: one teacher and one student.
- A teacher publishes exact available time slots.
- A student selects one published slot and submits **one active request at a time**.
- The teacher confirms or rejects the request.
- If confirmed by the teacher, the request moves to admin for final approval.
- Only admin approval creates a confirmed `Lesson` and reserves the slot.
- A rejected, cancelled, or expired request releases its slot.
- Students repeat the process for each subsequent lesson. Recurring-series booking is deferred.
- Students can only request availability belonging to their currently assigned teacher.

### Suggested request states

`pending_teacher` → `pending_admin` → `approved`

Terminal alternatives: `rejected`, `cancelled`, `expired`.

### Availability endpoints

| Method | Endpoint                             | Purpose                                                    |
| ------ | ------------------------------------ | ---------------------------------------------------------- |
| GET    | `/api/teacher/availability`          | Teacher's own slots                                        |
| POST   | `/api/teacher/availability`          | Publish `{ "startsAt": "ISO-8601", "endsAt": "ISO-8601" }` |
| DELETE | `/api/teacher/availability/{slotId}` | Delete an unused available slot                            |
| GET    | `/api/student/teacher/availability`  | Assigned teacher plus their available slots                |

Suggested `GET /api/student/teacher/availability` response:

```json
{
  "teacher": { "id": "uuid", "fullName": "Teacher Name" },
  "slots": [
    {
      "id": "uuid",
      "teacherId": "uuid",
      "startsAt": "2026-11-02T15:00:00Z",
      "endsAt": "2026-11-02T16:00:00Z",
      "status": "available"
    }
  ]
}
```

### Lesson request endpoints

| Method | Endpoint                                          | Purpose                                             |
| ------ | ------------------------------------------------- | --------------------------------------------------- |
| POST   | `/api/lesson-requests`                            | Student requests `{ "availabilitySlotId": "uuid" }` |
| GET    | `/api/student/lesson-requests`                    | Student's own requests                              |
| GET    | `/api/teacher/lesson-requests`                    | Requests for the authenticated teacher              |
| POST   | `/api/teacher/lesson-requests/{id}/confirm`       | Teacher confirms; moves to `pending_admin`          |
| POST   | `/api/teacher/lesson-requests/{id}/reject`        | Teacher rejects; releases slot                      |
| GET    | `/api/admin/lesson-requests?status=pending_admin` | Admin approval queue                                |
| POST   | `/api/admin/lesson-requests/{id}/approve`         | Final approval and creation of `Lesson`             |
| POST   | `/api/admin/lesson-requests/{id}/reject`          | Admin rejects; releases slot                        |

Suggested request response:

```json
{
  "id": "uuid",
  "teacherId": "uuid",
  "studentId": "uuid",
  "availabilitySlotId": "uuid",
  "startsAt": "2026-11-02T15:00:00Z",
  "endsAt": "2026-11-02T16:00:00Z",
  "status": "pending_teacher",
  "studentName": "Student Name",
  "teacherName": "Teacher Name",
  "createdAt": "2026-10-30T12:00:00Z"
}
```

### Booking consistency requirements

These are backend responsibilities, not frontend checks:

1. Validate that the selected slot belongs to the student's assigned teacher and is still available.
2. Enforce one open request per student at a time (`pending_teacher` or `pending_admin`).
3. Use a database transaction and concurrency-safe update/constraint when claiming a slot. Two requests must never book the same slot.
4. Recheck teacher and student calendar conflicts at final admin approval.
5. When a teacher confirms, keep the slot unavailable to other students while waiting for admin. If admin rejects or the request expires, release it.
6. Prevent teachers from changing/deleting slots that are already requested or booked.
7. Store timestamps as UTC (`timestamp with time zone` in PostgreSQL) and validate end > start.
8. Derive actor identity and role from the validated server-side session, never from request JSON or browser cookies.

## Confirmed lessons

| Method | Endpoint            | Purpose                             |
| ------ | ------------------- | ----------------------------------- |
| GET    | `/api/lessons`      | Role-scoped approved lessons        |
| GET    | `/api/lessons/{id}` | Lesson detail                       |
| PATCH  | `/api/lessons/{id}` | Authorized reschedule/status change |
| DELETE | `/api/lessons/{id}` | Authorized cancellation             |

A lesson has `id`, `teacherId`, `studentId`, `startsAt`, `endsAt`, `status`, and optional actual start/end timestamps.

## Lesson room

`/lesson/{id}` loads the lesson through `GET /api/lessons/{id}` (which already enforces ownership) and embeds Jitsi Meet through the official External API (`https://{domain}/external_api.js`) inside our own page. The room name is derived from the lesson id and the Jitsi domain is configurable with `NEXT_PUBLIC_JITSI_DOMAIN` (defaults to `meet.jit.si`). The embedded call starts with microphone and camera enabled; screen sharing is part of the standard Jitsi toolbar. The API gives the browser the microphone/camera permissions it needs, and the call stays inside the app — there is no redirect to meet.jit.si.

Because the room lives on the Jitsi deployment, the room itself is unlisted rather than access-controlled: anyone who knows the room name can join. For production, use a Jitsi deployment with JWT authentication (self-hosted or JaaS) and issue the JWT from an authorized backend endpoint, keeping the room name out of client code.

## Contact form

| Method | Endpoint       | Purpose                                               |
| ------ | -------------- | ----------------------------------------------------- |
| POST   | `/api/contact` | `{ "name": "...", "email": "...", "message": "..." }` |

Validate and rate-limit public contact submissions on the backend.

## Error contract

Prefer RFC 7807 Problem Details. Common status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` missing resource, `409` slot/assignment/scheduling conflict. The frontend displays `title`, `detail`, or `message` when available.

## App Router route map

- `/` — public landing page
- `/contact`, `/login`, `/signup` — public contact and authentication
- `/student/dashboard`, `/student/availability`, `/schedule` — student overview, slot selection, confirmed schedule
- `/teacher/dashboard`, `/teacher/availability`, `/teacher/lesson-requests` — teacher tools
- `/admin/dashboard`, `/admin/lesson-approvals`, `/admin/students`, `/admin/teachers`, `/admin/teachers/{id}/availability`, `/admin/assignments` — admin tools

The landing page is implemented in `src/app/page.tsx`. Feature screens are App Router `page.tsx` files; do not add a `pages/` directory.
