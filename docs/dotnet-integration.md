# Rayan Academy — ASP.NET Core integration contract

This frontend uses **Next.js App Router** (`src/app`). There is no Pages Router. The ASP.NET Core API owns authentication, authorization, validation, scheduling rules, and persistence. The frontend does not use Supabase.

## How this fits for students

For a student, the experience is simple: the Next.js frontend is the interface they use in the browser, while the ASP.NET Core backend is the system that decides who the student is, whether they are allowed to book a lesson, and whether their schedule or profile is valid. In other words, the frontend handles the experience, but the API handles the rules and trusted data.

A typical student journey looks like this:

- Sign in or create an account from the login/signup screens.
- Complete a profile, add contact details, and upload an avatar.
- Browse teachers, view available lesson slots, and request a lesson.
- Wait for teacher approval, then admin approval before the lesson is confirmed.
- Join the live lesson room after confirmation and view the final class report or review afterward.

This means the student does not need to understand the backend details directly; they just interact with a clean interface while the API enforces the rules behind the scenes. The frontend fetches data from the API, submits requests for booking or profile updates, and displays the results in a friendly way.

## Configuration

Create `.env.local` from `.env.local.example` and set:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

For production, prefer a same-origin reverse proxy so the API's HttpOnly session cookie is sent naturally to the Next.js origin. If frontend and API use different origins, configure exact-origin credentialed CORS and appropriate cookie `SameSite`, `Secure`, and domain settings.

## Authentication

| Method | Endpoint                     | Purpose                                             |
| ------ | ---------------------------- | --------------------------------------------------- |
| POST   | `/api/auth/register`         | Public student registration only                    |
| POST   | `/api/auth/login`            | Sign in                                             |
| GET    | `/api/auth/me`               | Current authenticated user                          |
| POST   | `/api/auth/logout`           | End session                                         |
| POST   | `/api/auth/change-password`  | Change the signed-in user's password (profile page) |
| POST   | `/api/auth/password/request` | Email a one-time password reset code                |
| POST   | `/api/auth/password/reset`   | Set a new password with the email code              |
| POST   | `/api/auth/otp/request`      | Send a sign-in/sign-up code to a phone              |
| POST   | `/api/auth/otp/verify`       | Verify the code and start a session                 |

`POST /api/auth/change-password` takes `{ "currentPassword": "...", "newPassword": "..." }`, returns `204`, rotates the caller's cookie, and signs other devices out. It returns `409` for phone-only accounts and `400` with `currentPassword`/`newPassword` errors. Admins can still reset a teacher or student password through `PATCH /api/admin/users/{id}`.

Password reset is anonymous and email-based. `POST /api/auth/password/request` takes `{ "email" }` and always answers `202` with a generic message (no account enumeration); the code expires after 15 minutes and resend is throttled to one per minute. In Development it returns `devCode` (`8888` by default). `POST /api/auth/password/reset` takes `{ "email", "code", "newPassword" }`, returns `204`, and invalidates existing sessions; an invalid or expired code returns `401`. Both return `503` when SMTP is not configured, so production needs `Email__Enabled=true`, `Email__SmtpHost`, `Email__SmtpPort`, `Email__Username`, `Email__Password`, and `Email__From`.

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

## Profile and avatars

| Method | Endpoint                 | Purpose                                                     |
| ------ | ------------------------ | ----------------------------------------------------------- |
| GET    | `/api/profile`           | Current user as `{ "user": { ... } }`                       |
| PATCH  | `/api/profile`           | Update `{ "fullName"?, "email"?, "phoneNumber"? }`          |
| POST   | `/api/profile/avatar`    | Multipart upload in the `file` field (PNG/JPEG/WebP, ≤2 MB) |
| DELETE | `/api/profile/avatar`    | Remove the current photo                                    |
| GET    | `/api/users/{id}/avatar` | Anonymous image bytes; 404 when the user has no photo       |

`PATCH /api/profile` normalizes the phone to E.164. Changing the email updates both `Email` and `UserName` and marks it confirmed. Changing the phone clears `PhoneNumberConfirmed`, so the next phone sign-in re-verifies ownership. Duplicate email, username, or phone values return `409`.

Avatars live in a separate `UserAvatars` table (`bytea`) so user queries never load image bytes. Uploads validate the declared content type and magic bytes before storing. The frontend renders the stable `/api/users/{id}/avatar` URL with a cache-busting query string after an upload.

## Teacher directory and self-service booking

| Method | Endpoint                     | Purpose                                                                |
| ------ | ---------------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/teachers/directory`    | Active teachers with their future `available` slots and rating summary |
| GET    | `/api/teachers/{id}/profile` | One active teacher plus open slots and latest reviews                  |

Each item has the shape `{ "teacher": { ...UserDto }, "slots": [ ... ] }`. A student may request any teacher's open slot with `POST /api/lesson-requests`. When the request is created, the API claims the slot and makes that teacher the student's active assignment inside the same transaction. The request then follows the normal `pending_teacher → pending_admin → approved` flow.

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

## Teacher applications

| Method | Endpoint                                     | Purpose                                                                 |
| ------ | -------------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/teacher-applications`                  | Public multipart application with CV + intro recording (rate-limited)   |
| GET    | `/api/admin/teacher-applications`            | Admin queue; optional `?status=pending\|approved\|rejected&take=50`     |
| GET    | `/api/admin/teacher-applications/{id}/cv`    | Download the stored CV as an attachment                                 |
| GET    | `/api/admin/teacher-applications/{id}/intro` | Download the self-introduction recording as an attachment               |
| PATCH  | `/api/admin/teacher-applications/{id}`       | Review `{ "status": "approved" \| "rejected", "reason"?: "..." }`       |

`POST /api/teacher-applications` is anonymous and takes `multipart/form-data` with the fields `fullName`, `email`, `phoneNumber` (E.164), repeated `subjects` values (`quran`, `tajweed`, `islamic_studies`, `arabic`), `englishLevel` (`beginner`, `intermediate`, `advanced`, `fluent`), `experienceYears`, `bio`, `availabilityNote`, `cv`, and `intro`. The CV must be PDF, DOC, or DOCX, at most 2 MB, and its magic bytes are checked. The intro recording must be MP3, M4A, WAV, OGG, WebM, MP4, or MOV, at most 20 MB, also magic-byte checked. Only one `pending` application per email is allowed. Applications, CV bytes, and recording bytes live in separate tables (`TeacherApplications`, `TeacherApplicationCvs`, `TeacherApplicationIntros`) so list queries never load the files. There is no automated deletion of applications.

Approving an application creates an active `teacher` account (with a random internal password) and issues a 15-minute set-password code. If SMTP is configured, the code is emailed with `SendTeacherInviteCodeAsync`; otherwise the `PATCH` response returns `inviteCode` so an admin can share it. If the email already belongs to an account, approval returns `409` and leaves the application pending. Rejecting requires a reason of 3–500 characters.

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
| GET    | `/api/teachers/directory`                         | Active teachers and their open slots                |
| GET    | `/api/teachers/{id}/profile`                      | One active teacher, open slots, and latest reviews  |
| GET    | `/api/teachers/public`                            | Public teacher list with ratings (no sign-in)       |
| GET    | `/api/teachers/public/{id}`                       | Public teacher profile and up to 50 reviews         |
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

1. Validate that the selected slot is still available and belongs to an active teacher.
2. Enforce one open request per student at a time (`pending_teacher`, `pending_student`, or `pending_admin`).
3. Use a database transaction and concurrency-safe update/constraint when claiming a slot. Two requests must never book the same slot.
4. When a student chooses a slot from the teacher directory, make that teacher the student's active assignment in the same transaction.
5. Recheck teacher and student calendar conflicts at final admin approval.
6. When a teacher confirms, keep the slot unavailable to other students while waiting for admin. If admin rejects or the request expires, release it.
7. Prevent teachers from changing/deleting slots that are already requested or booked.
8. Store timestamps as UTC (`timestamp with time zone` in PostgreSQL) and validate end > start.
9. Derive actor identity and role from the validated server-side session, never from request JSON or browser cookies.

## Confirmed lessons

| Method | Endpoint            | Purpose                             |
| ------ | ------------------- | ----------------------------------- |
| GET    | `/api/lessons`      | Role-scoped approved lessons        |
| GET    | `/api/lessons/{id}` | Lesson detail                       |
| PATCH  | `/api/lessons/{id}` | Authorized reschedule/status change |
| DELETE | `/api/lessons/{id}` | Authorized cancellation             |

A lesson has `id`, `teacherId`, `studentId`, `startsAt`, `endsAt`, `status`, optional actual start/end timestamps, and embedded `report` and `review` objects when they exist.

## Class reports and teacher reviews

| Method | Endpoint                   | Purpose                                                                             |
| ------ | -------------------------- | ----------------------------------------------------------------------------------- |
| GET    | `/api/lessons/{id}/report` | Class report (participant/admin); `404` when absent                                 |
| POST   | `/api/lessons/{id}/report` | Teacher submits `{ classSummary, studentFeedback, progress }` after the lesson ends |
| GET    | `/api/lessons/{id}/review` | Teacher review (participant/admin); `404` when absent                               |
| POST   | `/api/lessons/{id}/review` | Student submits `{ rating, comment? }` after the lesson ends                        |
| GET    | `/api/profile/reports`     | Role-scoped report history; paged: `?skip=0&take=3` returns `{ items, hasMore }`    |

Rules enforced by the API: one report and one review per lesson; both are rejected before `endsAt` and for cancelled lessons; a report marks the lesson `completed`; `progress` is `excellent`, `good`, or `needs_attention`; `rating` is 1–5. Public teacher responses expose only name, avatar, rating summary, and reviews.

`/api/profile/reports` is newest-first. `take` defaults to 20 and is clamped to 1–50, `skip` is clamped at 0. The profile page requests 3 at a time and shows a "Load 3 more reports" button only while `hasMore` is true.

## Lesson room

`/lesson/{id}` loads the lesson through `GET /api/lessons/{id}` (which already enforces ownership) and embeds Jitsi Meet through the official External API (`https://{domain}/external_api.js`) inside our own page. The room name is derived from the lesson id and the Jitsi domain is configurable with `NEXT_PUBLIC_JITSI_DOMAIN` (defaults to `meet.jit.si`). Before joining, the page asks for camera/microphone access and offers three modes: camera + mic, mic only, or watch/listen only. Devices are enumerated first; when none are present (or permission is blocked) the page explains why and keeps a working "Join without camera & mic" path instead of dead-ending. Screen sharing is part of the standard Jitsi toolbar.

After `endsAt` the page closes the room and switches to the lesson recap: teachers submit or edit the class report, students read the report and rate the lesson, and admins see both.

Only the teacher opens a room. While connected, the teacher's client sends `POST /api/lessons/{id}/presence` every 15 seconds (teacher-only, ownership-checked). Students poll `GET /api/lessons/{id}/presence` every 5 seconds and see a "Waiting for your teacher" panel instead of join buttons until `teacherPresent` is true. The API drops a heartbeat after 45 seconds, so a closed tab stops counting without an explicit leave request, and app-pool recycles only cause a short wait. Once a student has joined, the room stays mounted even if the heartbeat lapses.

This is a UX gate, not access control. The Jitsi room itself is unlisted rather than locked: anyone who knows the room name can join directly on the Jitsi deployment, and display names are not verified. Real enforcement requires a JWT-enabled Jitsi (JaaS or self-hosted) where only the teacher receives a moderator token and the room is protected by lobby or required moderator.

## Contact form

| Method | Endpoint       | Purpose                                               |
| ------ | -------------- | ----------------------------------------------------- |
| POST   | `/api/contact` | `{ "name": "...", "email": "...", "message": "..." }` |

The API stores the submission, then sends a plain-text notification to **one receiver configured on the server** (`Email:To` / `CONTACT_RECEIVER_EMAIL`). The browser cannot choose the recipient, so the form cannot be used as an open relay. The student's address is used as `Reply-To`. Email delivery is best effort: a failure is logged and does not lose the stored submission.

## Error contract

Prefer RFC 7807 Problem Details. Common status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` missing resource, `409` slot/assignment/scheduling conflict. The frontend displays `title`, `detail`, or `message` when available.

## App Router route map

- `/` — public landing page (includes the latest student reviews)
- `/contact`, `/login`, `/signup` — public contact and authentication (email/password or phone OTP)
- `/teach` — public teacher application form (details plus CV upload)
- `/teachers`, `/teachers/{id}` — authenticated students only; anonymous visitors are redirected to `/login`, other roles to their dashboard
- `/profile` — student/teacher/admin profile: name, email, mobile, photo, and class-report history
- `/student/dashboard`, `/student/availability`, `/schedule`, `/lesson/{id}` — student overview, teacher directory booking, schedule, and post-lesson recap/review
- `/teacher/dashboard`, `/teacher/availability`, `/teacher/lesson-requests`, `/teacher/schedule` — teacher tools including report-due indicators
- `/admin/dashboard`, `/admin/lesson-approvals`, `/admin/students`, `/admin/teachers`, `/admin/teachers/{id}/availability`, `/admin/teacher-applications`, `/admin/assignments` — admin tools

The landing page is implemented in `src/app/page.tsx`. Feature screens are App Router `page.tsx` files; do not add a `pages/` directory.
