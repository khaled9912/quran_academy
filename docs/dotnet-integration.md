# Ana Quran Academy — ASP.NET Core integration contract

This frontend uses **Next.js App Router** (`src/app`). There is no Pages Router. The ASP.NET Core API owns authentication, authorization, validation, scheduling rules, and persistence. The frontend does not use Supabase.

**Business rules and product intent:** [`../../docs/business-requirements/`](../../docs/business-requirements/README.md). This file is the endpoint contract; the business docs explain _why_ the rules exist, which surfaces are live, and which pages are mocks.

## How this fits for students

For a student, the experience is simple: the Next.js frontend is the interface they use in the browser, while the ASP.NET Core backend is the system that decides who the student is, whether they are allowed to book a lesson, and whether their schedule or profile is valid. In other words, the frontend handles the experience, but the API handles the rules and trusted data.

A typical student journey looks like this:

- Sign in or create an account from the login/signup screens.
- Complete a profile, add contact details, and upload an avatar.
- Browse teachers and the weekly times each one has announced.
- Pick any number of weekly times and book them instantly — the earliest one is automatically their trial lesson.
- Follow the recurring weekly schedule, receive reminders 5 minutes before and at the start, and request a different weekly time (handled by the admin) if their schedule changes.
- Join the live lesson room and view the class report or review afterward.

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

### Registration eligibility

Public self-service registration is limited to `US`, `GB`, `CA`, `AU`, `NZ`, and `IE`. `POST /api/auth/register` takes `{ "fullName", "email", "password", "country"? }` and returns `403` with the eligibility message for other countries. `POST /api/auth/otp/verify` accepts the same optional `country`; the check only applies when it would create a new account, so existing students can sign in from anywhere.

The API prefers the `x-registration-country` header over the request body. Middleware sets that header from the hosting provider's geo data and mirrors the value to the `academy-country` cookie, which the browser reads before submitting. Web CTAs carry `registration-cta` and are hidden by a pre-paint script, and `/signup` redirects to `/registration-unavailable` outside the allowlist. Mobile has no IP geolocation, so it passes the device locale's region and treats it as a UX hint only.

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

## Teacher directory and instant weekly booking

A teacher announces **weekly availability rules** once — for example “Saturday 15:00–16:00” and “Tuesday 17:00–18:00” in their IANA time zone. Each rule stays bookable until it is removed. Students browse the announced rules and book as many as they want in a single call; there is **no teacher or admin approval step**, because announcing a rule is the teacher's consent. Each booking becomes a permanent `LessonSeries` and lessons are materialized 8 weeks ahead, rolling forward on every schedule request.

| Method | Endpoint                                   | Purpose                                                                    |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------- |
| GET    | `/api/teachers/weekly-directory`           | Active teachers with their announced weekly rules and rating summary       |
| GET    | `/api/teachers/{id}/weekly-availability`   | One active teacher's weekly rules, the caller's series, and latest reviews |
| GET    | `/api/student/teacher/weekly-availability` | Same shape, restricted to the student's currently assigned teacher         |
| POST   | `/api/student/bookings`                    | Book one or more weekly rules instantly                                    |

Each directory item is `{ "teacher": { ...UserDto }, "slots": [ ...WeeklyRuleDto ], "averageRating": 4.8, "reviewCount": 12 }`. A `WeeklyRuleDto` is:

```json
{
  "id": "uuid",
  "teacherId": "uuid",
  "dayOfWeek": 6,
  "startsAtTime": "15:00:00",
  "endsAtTime": "16:00:00",
  "timeZoneId": "Africa/Cairo",
  "status": "available"
}
```

`dayOfWeek` uses `0 = Sunday … 6 = Saturday`. `startsAtTime`/`endsAtTime` are wall-clock `HH:mm:ss` values interpreted in `timeZoneId`, not UTC instants. A rule's `status` is `available`, `booked` (another student took it), or `yours` (the requesting student already books it); only `available` rules can be selected.

`GET /api/teachers/{id}/weekly-availability` and `GET /api/student/teacher/weekly-availability` return:

```json
{
  "teacher": {
    "id": "uuid",
    "fullName": "Teacher Name",
    "avatarUrl": "/api/users/uuid/avatar"
  },
  "slots": [
    {
      "id": "uuid",
      "dayOfWeek": 6,
      "startsAtTime": "15:00:00",
      "endsAtTime": "16:00:00",
      "timeZoneId": "Africa/Cairo",
      "status": "booked"
    }
  ],
  "series": [
    {
      "id": "uuid",
      "teacherId": "uuid",
      "teacherName": "Teacher Name",
      "studentId": "uuid",
      "studentName": "Student Name",
      "dayOfWeek": 6,
      "startsAtTime": "15:00:00",
      "endsAtTime": "16:00:00",
      "timeZoneId": "Africa/Cairo",
      "isActive": true,
      "createdAt": "2026-11-01T12:00:00Z"
    }
  ],
  "averageRating": 4.8,
  "reviewCount": 12,
  "reviews": [],
  "hasLessons": false
}
```

`hasLessons` is `false` until the student has ever had a lesson; the frontend uses it to show that the first booking will be a trial. When the student has no assigned teacher, `/api/student/teacher/weekly-availability` returns `{ "teacher": null, "slots": [], "series": [] }`.

`POST /api/student/bookings` takes `{ "ruleIds": ["uuid", "uuid"] }` with any number of rules (at least one, all from the same teacher) and returns `201` with `{ "series": [...], "lessons": [...] }`. Booking the same teacher again simply adds series; booking a different teacher deactivates the previous active assignment in the same transaction. The API rejects with `409` when a rule was just taken by someone else, overlaps a lesson the student already has, or conflicts with either calendar, and `400` when `ruleIds` is empty.

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
| GET    | `/api/teachers/{id}`    | Teacher detail (used by the admin weekly-times screen)       |
| PATCH  | `/api/admin/users/{id}` | Update `{ "fullName"?, "email"?, "password"?, "isActive"? }` |
| DELETE | `/api/admin/users/{id}` | Deactivate a teacher/student account                         |

`PATCH`/`DELETE` apply only to teacher and student accounts and return `409` for a duplicate email or when an account still has upcoming lessons. Deactivation is soft (`isActive=false`): lesson history is preserved, active assignments are removed, and future unused availability slots/rules stop being bookable. Deactivated users cannot log in and `GET /api/auth/me` returns `401`.

### Admin availability management

| Method | Endpoint                                                      | Purpose                                      |
| ------ | ------------------------------------------------------------- | -------------------------------------------- |
| GET    | `/api/admin/teachers/{teacherId}/availability-rules`          | List that teacher's weekly rules             |
| POST   | `/api/admin/teachers/{teacherId}/availability-rules`          | Publish weekly rules on the teacher's behalf |
| DELETE | `/api/admin/teachers/{teacherId}/availability-rules/{ruleId}` | Delete an unbooked weekly rule               |

The admin body is the same as the teacher's own publish call: `{ "daysOfWeek": [6, 0, 1], "startsAtTime": "15:00:00", "endsAtTime": "16:00:00", "timeZoneId": "Africa/Cairo" }`. Every rule must be 30, 45, or 60 minutes long; rules that overlap the teacher's existing rules or lessons are rejected with `400`. A rule that already backs an active series cannot be deleted — the response is `409` — because deleting it would silently cancel a booked weekly time.

The older one-off endpoints (`/api/admin/teachers/{teacherId}/availability`, `/api/teacher/availability`, `/api/student/teacher/availability`, `/api/teachers/directory`, `/api/lesson-requests`) are still mounted for backwards compatibility but the web and mobile apps no longer call them.

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

| Method | Endpoint                                     | Purpose                                                                |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/api/teacher-applications`                  | Public multipart application with CV, Quran recitation, optional intro |
| GET    | `/api/admin/teacher-applications`            | Admin queue; optional `?status=pending\|approved\|rejected&take=50`    |
| GET    | `/api/admin/teacher-applications/{id}/cv`    | Download the stored CV as an attachment                                |
| GET    | `/api/admin/teacher-applications/{id}/quran` | Download the Quran recitation as an attachment                         |
| GET    | `/api/admin/teacher-applications/{id}/intro` | Download the self-introduction recording as an attachment              |
| PATCH  | `/api/admin/teacher-applications/{id}`       | Review `{ "status": "approved" \| "rejected", "reason"?: "..." }`      |

`POST /api/teacher-applications` is anonymous and takes `multipart/form-data` with the fields `fullName`, `email`, `phoneNumber` (E.164), repeated `subjects` values (`quran`, `tajweed`, `islamic_studies`, `arabic`), `englishLevel` (`beginner`, `intermediate`, `advanced`, `fluent`), `experienceYears`, `bio`, `availabilityNote`, `cv`, `quran`, and `intro`. The CV must be PDF, DOC, or DOCX, at most 2 MB, and its magic bytes are checked. The Quran recitation is required and the intro recording is optional; both must be MP3, M4A, WAV, OGG, WebM, MP4, or MOV, at most 20 MB each, also magic-byte checked. Only one `pending` application per email is allowed. Applications and file bytes live in separate tables (`TeacherApplications`, `TeacherApplicationCvs`, `TeacherApplicationQuranRecordings`, `TeacherApplicationIntros`) so list queries never load the files, which are only fetched on demand through the `/cv`, `/quran`, and `/intro` endpoints. There is no automated deletion of applications.

Approving an application creates an active `teacher` account (with a random internal password) and issues a 15-minute set-password code. If SMTP is configured, the code is emailed with `SendTeacherInviteCodeAsync`; otherwise the `PATCH` response returns `inviteCode` so an admin can share it. If the email already belongs to an account, approval returns `409` and leaves the application pending. Rejecting requires a reason of 3–500 characters.

## Weekly scheduling workflow

- Lessons are **individual**: one teacher and one student.
- A teacher announces **weekly rules** — a weekday, one of the three lesson lengths (30, 45, or 60 minutes), and an IANA time zone. Announcing a rule is the teacher's consent to be booked.
- A student selects **any number** of the teacher's open rules in one action and is booked instantly. There is no teacher confirmation and no admin approval.
- Every booking creates a permanent `LessonSeries`, and the API materializes the next 8 weeks of lessons from it, rolling forward on every schedule read.
- A rule can back only one active series, so a booked rule is no longer offered to other students.
- The student's **first-ever lesson** is flagged `isTrial: true` automatically.
- To move a weekly time, the student submits a change request that goes **to the admin only**. The teacher is not notified and has no screen for it; the admin contacts the teacher out of band and then approves or declines.
- A student may only request a change to another open rule of the same teacher.

### Teacher availability endpoints

| Method | Endpoint                                   | Purpose                                  |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/api/teacher/availability-rules`          | The teacher's own announced weekly rules |
| POST   | `/api/teacher/availability-rules`          | Announce rules for one or more weekdays  |
| DELETE | `/api/teacher/availability-rules/{ruleId}` | Remove an unbooked rule                  |

`POST /api/teacher/availability-rules` takes:

```json
{
  "daysOfWeek": [6, 0, 1],
  "startsAtTime": "15:00:00",
  "endsAtTime": "16:00:00",
  "timeZoneId": "Africa/Cairo"
}
```

It creates one rule per weekday and returns `201` with the created `WeeklyRuleDto` list. It returns `400 { "message": "..." }` when no weekday is given, the end time is not after the start time, the window is not 30, 45, or 60 minutes, the time zone is unknown, or the hours overlap an existing rule. Deleting an unbooked rule returns `204`; a rule referenced by a series or a pending change request returns `409`.

`GET /api/teacher/availability-rules` returns the same `WeeklyRuleDto` list, with `status` reflecting whether a student has booked each rule.

### Open student offers (first teacher books)

A student **without an active teacher** can offer one-off times instead of booking a weekly rule. Every active teacher receives a notification; the first teacher who accepts books a one-off `Lesson` on their schedule instantly, and the offer closes for everyone else.

| Method | Endpoint                                    | Purpose                                                |
| ------ | ------------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/student/open-offers`                  | The student's own offered times (last day and forward) |
| POST   | `/api/student/open-offers`                  | Offer `{ "startsAt": "...", "endsAt": "..." }`         |
| DELETE | `/api/student/open-offers/{offerId}`        | Withdraw an open offer (`204`)                         |
| GET    | `/api/teacher/open-offers`                  | Open offers plus offers claimed in the last 24 hours   |
| POST   | `/api/teacher/open-offers/{offerId}/accept` | Book the offer (`200 { lessonId, offer }`)             |

`POST /api/student/open-offers` rejects students who already have an active assignment (`409`), a window that starts in the past or is not 30, 45, or 60 minutes (`400`), more than 4 open offers (`409`), and overlaps with an open offer or a scheduled lesson (`409`). Each offer returns `OpenStudentOfferDto` (`id`, `studentId`, `studentName`, `startsAt`, `endsAt`, `status`, `claimedByTeacherId`, `claimedByTeacherName`, `lessonId`, `createdAt`, `claimedAt`), where `status` is `open`, `claimed`, or `withdrawn`.

Accepting checks the teacher is active, the student still has no teacher, and neither side has an overlapping scheduled lesson. The claim uses a conditional update (`status = open`) so only one teacher can win; the winner gets an active assignment and a one-off lesson (flagged `isTrial` for the student's first-ever lesson), while the student's other open offers are withdrawn. The student is notified that the teacher accepted, and every other notified teacher's bell entry is rewritten to "Time offer taken — _student_ chose _teacher_" and marked unread. The claiming teacher's entry becomes "You booked this time".

### Weekly time changes

| Method | Endpoint                                         | Purpose                                                                   |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------- |
| GET    | `/api/student/change-requests`                   | The student's own change requests                                         |
| POST   | `/api/student/series/{seriesId}/change-requests` | Move to another open rule `{ "requestedRuleId": "uuid", "note"?: "..." }` |
| DELETE | `/api/student/series/{seriesId}`                 | End a weekly series (`204`); future lessons cancelled                     |
| GET    | `/api/admin/change-requests?status=applied`      | Read-only history (`applied`, plus legacy rows)                           |

A change request returns:

```json
{
  "id": "uuid",
  "seriesId": "uuid",
  "teacherId": "uuid",
  "teacherName": "Teacher Name",
  "studentId": "uuid",
  "studentName": "Student Name",
  "currentDayOfWeek": 6,
  "currentStartsAtTime": "15:00:00",
  "currentEndsAtTime": "16:00:00",
  "requestedDayOfWeek": 2,
  "requestedStartsAtTime": "17:00:00",
  "requestedEndsAtTime": "18:00:00",
  "timeZoneId": "Africa/Cairo",
  "status": "applied",
  "studentNote": "I started a new class on Saturdays.",
  "adminNote": null,
  "createdAt": "2026-11-01T12:00:00Z",
  "adminRespondedAt": null
}
```

The change applies as it is requested — there is no approval call. The target rule must belong to the same teacher (`404`), differ from the current rule, still be open, and not overlap another of the student's series or an existing lesson in the materialized window; a clash returns `409` and the student picks again, including when another student took the slot first. The series is retargeted and its future lessons are rebuilt in the same serializable transaction, then the student and teacher get a `Time changed` notification naming the new time and every admin gets an informational one. Rows already stored with status `pending`, `approved` or `rejected` come from the removed approval queue and stay readable so old records keep rendering; `adminNote` is only set on those legacy rows.

`DELETE /api/student/series/{seriesId}` ends the student's own weekly series. It deactivates the series, cancels its future scheduled lessons with `cancellationOutcome = "series_ended"`, and deactivates the teacher assignment when no other active series with that teacher remains. The teacher receives a notification; the response is `204`. The slot becomes bookable again immediately.

### Booking consistency requirements

These are backend responsibilities, not frontend checks:

1. Validate that the chosen rules still exist, all belong to one teacher, and that teacher is active.
2. Enforce one active series per rule with a database uniqueness constraint, and answer `409` when two students race for the same slot.
3. Reassign the student's active teacher (and add the series, lessons, and trial flag) inside one transaction.
4. Reject a booking that overlaps another of the student's series, the teacher's calendar, or the student's calendar for the next 8 weeks.
5. Materialize 8 weeks of lessons per series and roll the window forward whenever lessons are read.
6. Store instants as UTC (`timestamp with time zone`), weekly times as `time`, and zones as IANA ids; resolve daylight-saving transitions when materializing.
7. Key the admin-only change request on `seriesId`, keep one pending request per series, and never expose the requested time to the teacher (they only get a "being reviewed" notice).
8. Derive actor identity and role from the validated server-side session, never from request JSON or browser cookies.

## Confirmed lessons

| Method | Endpoint            | Purpose                                                |
| ------ | ------------------- | ------------------------------------------------------ |
| GET    | `/api/lessons`      | Role-scoped lessons (includes upcoming series lessons) |
| GET    | `/api/lessons/{id}` | Lesson detail                                          |
| PATCH  | `/api/lessons/{id}` | Authorized reschedule/status change                    |
| DELETE | `/api/lessons/{id}` | Authorized cancellation                                |

A lesson has `id`, `teacherId`, `studentId`, `startsAt`, `endsAt`, `status`, optional actual start/end timestamps, `seriesId` (the weekly booking it came from, `null` for legacy one-off lessons), `isTrial` (true for a student's first ever lesson), and embedded `report` and `review` objects when they exist. Lesson operations add `cancellationOutcome`, `cancelReason`, `cancelledAt`, `cancelledById`, `isMakeup`, and `originalLessonId`; `status` stays one of `scheduled`, `in_progress`, `completed`, `cancelled` so existing filters and reminder cleanup keep working.

## Lesson operations (cancellation, reschedule, attendance, pay)

This is one backend-authoritative system shared by web and mobile. The clients never decide an outcome: they call the preview, show it, and then call cancel. `POST /api/lessons/{id}/cancel` and the legacy `DELETE /api/lessons/{id}` both run `EvaluateCancellationAsync` server-side.

### Policy

One `AcademyPolicies` row (id `1`) drives every decision. Defaults: student/teacher free-cancel window 24 hours, no-show grace 10 minutes, reschedule reply deadline 12 hours, one student grace cancellation per Cairo month, student warning at 3 strikes, student admin review at 4, teacher admin review at 2, trial no-show threshold 2, and `payScheduledDurationWhenAttended = true`.

| Method | Endpoint             | Role  | Purpose                                       |
| ------ | -------------------- | ----- | --------------------------------------------- |
| GET    | `/api/lesson-policy` | any   | Current policy (all fields plus `updatedAt`)  |
| PUT    | `/api/lesson-policy` | admin | Partial update; validates non-negative limits |

Month/day keys use the academy clock (`Africa/Cairo`); every instant is stored UTC.

### Cancellation outcomes

| Outcome                                               | Actor          | Late | Credit                         | Teacher payable   | Reliability                  |
| ----------------------------------------------------- | -------------- | ---- | ------------------------------ | ----------------- | ---------------------------- |
| `free_cancellation`                                   | student        | no   | none                           | 0                 | none                         |
| `grace_cancellation`                                  | student        | yes  | none (one free late cancel/mo) | scheduled minutes | `student_grace_cancellation` |
| `late_cancellation`                                   | student        | yes  | −1 (trials excluded)           | scheduled minutes | `student_late_cancellation`  |
| `cancelled_by_teacher`                                | teacher        | no   | +1 (trials excluded)           | 0                 | `teacher_early_cancellation` |
| `late_cancelled_by_teacher`                           | teacher        | yes  | +1 (trials excluded)           | 0                 | admin review required        |
| `admin_cancelled`                                     | admin          | —    | +1 (trials excluded)           | scheduled minutes | none                         |
| `student_no_show` / `teacher_no_show` / `both_absent` | admin decision | —    | follows incident resolution    | incident value    | strike + admin queue         |

Cancellation is blocked for support, for already cancelled/completed/ended lessons, and once the lesson has started (admins may still cancel). A successful cancellation also withdraws any pending reschedule request and closes any open attendance interval. The preview returns `allowed`, `blockedReason`, the outcome, `hoursBefore`, `scheduledMinutes`, `teacherPayableMinutes`, `creditEffect`, `requiresAdminReview`, a server-written `explanation`, and the policy snapshot.

### Rescheduling and make-up lessons

| Method | Endpoint                                       | Purpose                                                       |
| ------ | ---------------------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/lessons/{id}/reschedule-requests`        | Request history for the lesson                                |
| POST   | `/api/lessons/{id}/reschedule-requests`        | `{ startsAt, endsAt, note? }` (teacher/student/admin)         |
| POST   | `/api/reschedule-requests/{requestId}/accept`  | Accept; moves the lesson or books the make-up                 |
| POST   | `/api/reschedule-requests/{requestId}/decline` | Keep the current time, or book nothing                        |
| POST   | `/api/reschedule-requests/{requestId}/cancel`  | Withdraw a request                                            |
| POST   | `/api/lessons/{id}/replacement`                | Admin-only direct make-up booking; the web app never calls it |

Rules: one `pending` request per lesson; the default reply deadline is the policy's `rescheduleResponseHours`; pending requests expire in the background monitor. A request only stores a proposed time — nothing moves until the other side replies. Accepting on a scheduled lesson moves its `startsAt`/`endsAt` and never creates a duplicate. A reschedule does not cancel the lesson, so no cancellation outcome or credit movement is recorded.

A cancelled lesson is rebooked through the same routes: the teacher (or an admin) posts a reschedule request against it and the student's accept creates the make-up row. A make-up lesson has `isMakeup = true`, `originalLessonId`, the original duration, and exactly one active replacement per original; it adds no credit and no charge. The original and replacement link to each other through `/api/lessons/{id}/operations`. `POST /api/lessons/{id}/replacement` stays as the staff override for times agreed outside the app.

### Attendance (real participation)

| Method | Endpoint                              | Purpose                                                       |
| ------ | ------------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/lessons/{id}/attendance`        | Participant minutes, status, late/early, reconnections        |
| POST   | `/api/lessons/{id}/attendance/events` | `{ action: "join" \| "leave", deviceId, eventId, clientAt? }` |

The web External API listens to `videoConferenceJoined` / `videoConferenceLeft`; the React Native SDK listens to `onConferenceJoined` / `onConferenceLeft`. A device sends a unique `eventId` per beacon so retries are idempotent. The server owns timestamps, clamps intervals to the lesson window, keeps one open interval per lesson/user/device, and closes open intervals at the lesson end. This is independent per participant and is not derived from page opens or `ActualStartedAt`.

### Calling a participant who has not joined

| Method | Endpoint                 | Role               | Purpose                                                   |
| ------ | ------------------------ | ------------------ | --------------------------------------------------------- |
| POST   | `/api/lessons/{id}/call` | participant, staff | `{ targetRole? }` — rings the other side, or a named side |
| GET    | `/api/calls/recent`      | any                | Calls addressed to the caller in the last 30 minutes      |

A participant always rings the other side; `targetRole` is only read from staff. An accepted call returns the new row and appears in `LessonOperations.calls` (also `AdminLessonOpsDetail.calls`), newest first, at most 20. Rejections are `409` with a plain sentence the client shows as-is: outside the window, the target is already in the room, one call per 30 seconds, three calls per lesson per caller.

`src/lib/lesson-ringer.ts` synthesises the ring with WebAudio because the web app ships no audio file, `LessonRingProvider` (mounted in `components/providers.tsx`) watches the `["lesson-calls"]` query, and `IncomingCallAlert` stays on screen until it is answered. A browser can never ring a closed tab: there is no service worker and no Web Push subscription, autoplay stays blocked until the user has interacted with the tab, and the flashing document title plus an optional `Notification` (only when permission was already granted) are the fallback.

### Teacher hours, credits, reliability, salary

| Method | Endpoint                            | Role            | Purpose                                            |
| ------ | ----------------------------------- | --------------- | -------------------------------------------------- |
| GET    | `/api/student/credits`              | student         | Balance plus append-only ledger                    |
| GET    | `/api/student/reliability`          | student         | Own reliability events                             |
| GET    | `/api/teacher/reliability`          | teacher         | Own reliability events                             |
| GET    | `/api/teacher/hours?month=&status=` | teacher         | Per-lesson hours                                   |
| GET    | `/api/teacher/salary-periods`       | teacher         | Monthly salary periods                             |
| POST   | `/api/devices/register`             | any             | `{ token, platform }` Expo push token              |
| POST   | `/api/devices/unregister`           | any             | `{ token, platform? }` — call on sign-out          |
| GET    | `/api/lessons/{id}/excuse`          | student         | Existing excuse request                            |
| POST   | `/api/lessons/{id}/excuse`          | student         | `{ category, explanation }` (late/no-show lessons) |
| POST   | `/api/lessons/{id}/incident`        | teacher/student | `{ type, detail }` attendance dispute or no-show   |

Three independent teacher-hour values are stored per lesson: `actualAttendanceMinutes` from intervals, `proposedPayableMinutes` (actual, or the full scheduled time when the policy pays scheduled duration and both sides attended), and admin `approvedPayableMinutes`. Approval status is `pending`, `approved`, `adjusted`, `rejected`, or `not_applicable`, with the auditor and adjustment reason recorded.

The student credit ledger (`LessonCreditTransactions`) is append-only and idempotent per lesson/outcome; it is an audit trail, not a second wallet. Monthly USD/EGP billing remains the existing claims/rates system. Reliability events feed warning/review thresholds and an admin queue. Salary periods aggregate minutes, penalties, cancellations, and no-shows per teacher and month; the final EGP amount stays manual (no automatic transfer), and `status` moves `open` → `reviewed` → `paid`.

### Admin operations

| Method | Endpoint                                     | Purpose                                                       |
| ------ | -------------------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/admin/lesson-ops?date=YYYY-MM-DD`      | Day monitor: summary counters plus every lesson and its state |
| GET    | `/api/admin/lesson-ops/{lessonId}`           | Full detail with intervals, cancellations, requests, hours    |
| GET    | `/api/admin/excuse-requests?status=`         | Excuse queue                                                  |
| POST   | `/api/admin/excuse-requests/{id}/approve`    | Approve (restores the lesson credit)                          |
| POST   | `/api/admin/excuse-requests/{id}/reject`     | Reject                                                        |
| GET    | `/api/admin/lesson-incidents?status=`        | Incident queue                                                |
| POST   | `/api/admin/lesson-incidents/{id}/resolve`   | `{ action, note?, teacherPayableMinutes? }`                   |
| GET    | `/api/admin/teacher-hours?month=&status=`    | Hours approval queue                                          |
| POST   | `/api/admin/teacher-hours/{id}/approve`      | `{ approvedMinutes?, note? }`                                 |
| POST   | `/api/admin/teacher-hours/{id}/reject`       | Reject                                                        |
| GET    | `/api/admin/teacher-penalties?status=`       | Penalty list                                                  |
| POST   | `/api/admin/teacher-penalties`               | Create penalty                                                |
| POST   | `/api/admin/teacher-penalties/{id}/review`   | Approve/reject/void                                           |
| GET    | `/api/admin/reliability?role=&userId=&type=` | Reliability queue                                             |
| POST   | `/api/admin/reliability/{id}/resolve`        | Resolve with note                                             |
| GET    | `/api/admin/students/{id}/credits`           | Student ledger and balance                                    |
| POST   | `/api/admin/students/{id}/credits/adjust`    | Manual adjustment with reason                                 |
| GET    | `/api/admin/salary-periods?month=`           | Salary periods                                                |
| POST   | `/api/admin/salary-periods/generate`         | Materialize a month from approved hours                       |
| PATCH  | `/api/admin/salary-periods/{id}`             | Adjustment, final amount, notes, or status                    |

`LessonOpsMonitor` runs every minute: it expires reschedule requests, closes attendance and finalizes hours, opens/dismisses no-show incidents after the grace period, sends reminders and report-due notices, and notifies admins. `AcademyPushSender` delivers through the Expo Push API using the device tokens above; notifications are also written to the in-app feed and email where configured.

Every lesson-related notice — no-show incidents, excuse requests, late-cancellation reviews, reminders, and report-due notices — carries `link = /lesson/{id}` and a body naming both participants, the lesson date and time, and what happened. `/lesson/{id}` exists on both clients and is admin-readable, so an admin tapping a notice lands directly on that lesson's room and operations panel. Push payloads repeat the same value in `data.link`, which the mobile app routes on tap; local reminders still route through `data.lessonId`.

A notification row is stored once and read by both clients, so `link` always uses the mobile app's flat routes (`/schedule`, `/book`, `/people`, `/payments`, `/earnings`, `/lesson/{id}`, `/admin/lesson-ops`) — never a role-prefixed web path. The web app nests the same screens per role and translates the flat paths in `resolveNotificationHref` (`src/services/notification.service.ts`); add an entry there whenever a notice starts pointing at a new screen. Teachers have no lesson-request screen on either client, so request notices send them to `/schedule`.

### Schema and client routes

New Postgres tables: `AcademyPolicies`, `LessonCancellations`, `LessonRescheduleRequests`, `LessonScheduleChanges`, `LessonAttendances`, `LessonAttendanceEvents`, `LessonAttendanceIntervals`, `LessonCreditTransactions`, `TeacherHours`, `TeacherPenalties`, `ReliabilityEvents`, `SalaryPeriods`, `AuditLogs`, `LessonExcuseRequests`, `LessonIncidents`, `DeviceTokens`. New lesson columns: `CancellationOutcome`, `CancelReason`, `CancelledById`, `CancelledAt`, `IsMakeup`, `OriginalLessonId`. The API creates these idempotently at boot (`Database:EnsureCreated`).

Web lesson pages render `LessonOperationsPanel` (cancel, reschedule, make-up, attendance with the call buttons, excuse, incident). Admins use `/admin/lesson-ops` (day monitor, review queues, salary review, policy). The mobile app mirrors the lesson panel on the lesson screen and provides `/admin/lesson-ops` under the admin dashboard; support reviewers see neither the panel actions nor the admin screen. Mobile push registration requires an EAS `projectId` in `app.config.ts`; without it the app silently relies on local reminders.

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

The mobile app embeds the same room with the native `@jitsi/react-native-sdk` (not a WebView) and must point at the same self-hosted Jitsi host as the web build (the domain is baked into the app bundle). The room header exposes a native share sheet with the room URL so a participant can invite someone they trust; the room stays unlisted.

After `endsAt` the page closes the room and switches to the lesson recap: teachers submit or edit the class report, students read the report and rate the lesson, and admins see both.

Either participant can open the room; there is no presence check that blocks the other side. Web and mobile send attendance beacons (`join`/`leave`) from real Jitsi conference events, so participation is recorded without gating the room. The page registers the room on load and the "Show lesson room" button re-opens it after navigation, so nobody waits for the other side to arrive.

Admins and super admins can open any confirmed lesson room as academy support: `/admin/lessons` lists live, upcoming, and past lessons with a link to `/lesson/{id}`. The API already authorizes admins on the lesson, report, and review reads; the room adds "(Academy support)" to the admin's Jitsi display name so the teacher and student know why a third person joined. The start-time gate still applies to admins, and the room allows three participants (there is no participant cap on the Jitsi deployment).

The room is unlisted, not access-controlled. The Jitsi room itself is unlisted rather than locked: anyone who knows the room name can join directly on the Jitsi deployment, and display names are not verified. Real enforcement requires a JWT-enabled Jitsi (JaaS or self-hosted) where only the teacher receives a moderator token and the room is protected by lobby or required moderator.

### Screen marking (lesson pen)

Jitsi cannot annotate a live screen share, so marks travel over the existing realtime hub as a lesson-scoped ink layer. Clients draw on a transparent canvas/SVG over the Jitsi view; points are normalized to that overlay (`0..1`) and the REST layer is not involved.

| Hub method                                               | Purpose                                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `JoinLessonPen(lessonId)`                                | Participant-only. Adds the connection to `lesson-pen:{lessonId}` and returns `{ strokes: [{ id, color, width, points }] }` |
| `StartPenStroke(lessonId, strokeId, color, width, x, y)` | Drawer-only. Broadcasts `PenStrokeStarted { id, color, width, x, y }` to the other participants                            |
| `AppendPenStroke(lessonId, strokeId, points)`            | Drawer-only. `points` is `[x, y, ...]` (at most 256 doubles per call); broadcasts `PenStrokeAppended`                      |
| `EndPenStroke(lessonId, strokeId)`                       | Drawer-only. Broadcasts `PenStrokeEnded`                                                                                   |
| `ClearLessonPen(lessonId)`                               | Drawer-only. Broadcasts `PenCleared`                                                                                       |

Only the lesson's teacher, an admin, or a super admin may draw; support staff and students receive the marks read-only. Ink is ephemeral in-memory state (newest 400 strokes, dropped after 6 idle hours) and is never persisted. Points are normalized to each viewer's own stage, so a share that is letterboxed or cropped differently — especially a portrait phone — can drift from the shared picture.

## Lesson transcripts and off-platform flags

Transcripts are not captured by the web or mobile app: the call runs in a cross-origin iframe, so only the Jitsi deployment can record audio. The API exposes the storage and review side, ready for the transcription bot.

| Method | Endpoint                             | Purpose                                                                                                  |
| ------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| POST   | `/api/lessons/{id}/transcript`       | Bot ingest; `{ segments: [{ speaker?, text, atSeconds? }] }`                                             |
| GET    | `/api/admin/transcripts`             | Flagged lessons, newest first (ReviewerOnly)                                                             |
| GET    | `/api/admin/lessons/{id}/transcript` | Full ordered transcript for one lesson (ReviewerOnly)                                                    |
| GET    | `/api/admin/review-queue`            | Review queue: `status=all\|unreviewed\|draft\|submitted\|flagged`, optional `flagged=true`, `from`, `to` |
| GET    | `/api/admin/lessons/{id}/review`     | Lesson, metrics, existing review and ordered segments                                                    |
| PUT    | `/api/admin/lessons/{id}/review`     | Upsert the rubric review (draft or submitted)                                                            |
| GET    | `/api/admin/review-digest`           | Weekly per-teacher rollup: `weekStart=yyyy-MM-dd` (defaults to this Monday, UTC)                         |

Ingest rules: anonymous but requires the `X-Transcript-Key` header to equal `Transcripts:IngestKey`; the route returns `404` while no key is configured, which keeps the feature off. Each request carries 1–200 segments; empty text is skipped, text is capped at 4000 characters, and the speaker defaults to `Unknown`. `AtSeconds` is the offset from the start of the recording.

The API scans every segment for `phone`, `email`, `platform` (WhatsApp, Telegram, Instagram, TikTok, Signal, Skype, …) and `offplatform` ("call me", "my number", "outside the lesson"). Matches are stored as comma-separated flags on the segment. The admin list groups flagged segments per lesson and merges the reasons; the detail view returns every segment with `flags` as an array so the UI can highlight the offending lines.

Transcript text belongs in this API and Postgres only. Never enable Jitsi's `/transcripts` static route: it publishes files at a guessable public URL, which is unacceptable for lessons involving minors.

### Support review workflow

The `support` role is read-only outside reviews: it can open the transcript endpoints above, save a rubric review, and read the weekly digest. It cannot change lessons, students, teachers, or assignments. Admins and super admins share the same review access through the `ReviewerOnly` policy (`admin`, `super_admin`, `support`); `AdminOnly` still guards everything else under `/api/admin`.

- **Automated metrics** in the workspace: segment counts by speaker, estimated talk-time balance (~150 words per minute; a signal, not a clock), recorded length from `atSeconds`, and flagged segments/reasons. The text comes from ASR, so the API never scores recitation or tajweed automatically.
- **Rubric**: four 1–5 scores (`teachingClarity`, `studentPractice`, `correctionQuality`, `engagement`) plus `strengths`, `gaps`, `teacherAction`, `studentAction`. Drafts can be incomplete; submitting requires all four scores and a gap of at least 3 characters. A lesson must have at least one transcript segment before it can be reviewed.
- **Audit**: every workspace or transcript read writes a `TranscriptAccessLogs` row (`lessonId`, `userId`, `accessedAt`). There is no UI for the log yet; query it directly when an access audit is needed.
- **Weekly digest**: groups submitted reviews by teacher for the week, with rubric averages, follow-up actions, and the lessons still unreviewed or only drafted. This is the artifact the support lead reviews at the end of the week.
- **Accounts**: admins create support reviewers from `/admin/support` (`POST /api/admin/users` with `role: "support"`), list them with `GET /api/admin/support-users`, and deactivate/reactivate them through the existing `PATCH`/`DELETE /api/admin/users/{id}` endpoints.

The frontend mirrors the API: `/support/transcripts` is the queue, `/support/transcripts/{id}` is the transcript plus rubric, and `/support/weekly` is the digest. Admins reach the same pages from the navigation.

Consent and retention are product decisions, not API details: transcripts cover lessons that may involve minors, so tell students and guardians what is recorded, who can read it, and how long it is kept before enabling capture.

## Contact form

| Method | Endpoint       | Purpose                                               |
| ------ | -------------- | ----------------------------------------------------- |
| POST   | `/api/contact` | `{ "name": "...", "email": "...", "message": "..." }` |

The API stores the submission, then sends a plain-text notification to **one receiver configured on the server** (`Email:To` / `CONTACT_RECEIVER_EMAIL`). The browser cannot choose the recipient, so the form cannot be used as an open relay. The student's address is used as `Reply-To`. Email delivery is best effort: a failure is logged and does not lose the stored submission.

## Monthly payments

Each month has a student statement (USD) and a teacher earnings summary (EGP). Months follow the academy clock (`Africa/Cairo`); a month can be claimed only after it ends.

| Method | Endpoint                                 | Role    | Purpose                                                                      |
| ------ | ---------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| GET    | `/api/student/billing?month=YYYY-MM`     | student | Month list (last 12), completed lessons, amount due, USD bank account, claim |
| POST   | `/api/student/billing/claims`            | student | `{ "month": "YYYY-MM", "note": "..." }` — mark a closed month as paid        |
| GET    | `/api/teacher/billing?month=YYYY-MM`     | teacher | Completed lessons, EGP total, per-lesson rate, saved payout details          |
| PUT    | `/api/teacher/billing/payout-details`    | teacher | InstaPay, Vodafone Cash, bank name/holder/IBAN                               |
| GET    | `/api/admin/billing?month=YYYY-MM`       | admin   | Academy USD account, teacher rates, claims, per-teacher payouts              |
| PUT    | `/api/admin/billing/academy-account`     | admin   | The USD account students copy into their banking app                         |
| PUT    | `/api/admin/billing/rates/{teacherId}`   | admin   | `{ "studentPriceUsd": 12.5, "payoutEgp": 300 }`                              |
| POST   | `/api/admin/billing/claims/{id}/confirm` | admin   | Confirm a pending claim                                                      |
| POST   | `/api/admin/billing/claims/{id}/reject`  | admin   | `{ "note": "..." }` — student may re-claim the month later                   |

- A student's trial lesson appears on the statement with amount `0`; the teacher is still paid the normal EGP rate for it.
- One claim per student and month (`pending`, `confirmed`, `rejected`). Only closed months with a total above zero can be claimed; a confirmed or pending claim blocks a new one, while a rejected claim can be re-submitted and returns to `pending`.
- Claim lesson count and USD amount are frozen when the claim is created, so later rate changes do not rewrite a submitted statement.
- `canClaim` on the student response is the single source of truth for showing the "I've sent the payment" action.
- Teacher and student responses are role-scoped: the API derives the user id from the session, never from a query parameter.

The web pages are `/student/payments`, `/teacher/payments`, and `/admin/payments`; the mobile app mirrors the first two as `/payments` and `/earnings`.

## Error contract

Prefer RFC 7807 Problem Details. Common status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` missing resource, `409` slot/assignment/scheduling conflict. The frontend displays `title`, `detail`, or `message` when available.

## App Router route map

- `/` — public landing page (includes the latest student reviews)
- `/contact`, `/login`, `/signup` — public contact and authentication (email/password or phone OTP)
- `/teach` — public teacher application form (details plus CV and recording uploads)
- `/teachers`, `/teachers/{id}` — authenticated students only; anonymous visitors are redirected to `/login`, other roles to their dashboard
- `/profile` — student/teacher/admin profile: name, email, mobile, photo, and class-report history
- `/notifications` — in-app notification feed (bookings, reminders, requests, payments, system)
- `/student/dashboard`, `/student/availability`, `/student/teachers/{id}`, `/student/change-time/{seriesId}`, `/student/payments`, `/schedule`, `/lesson/{id}` — student overview, teacher directory with unlimited weekly multi-select, self-service weekly time change, monthly payment statement, recurring schedule, and post-lesson recap/review
- `/teacher/dashboard`, `/teacher/availability`, `/teacher/schedule`, `/teacher/payments` — teacher tools: announce weekly rules, see the weekly bookings, submit reports, and review monthly EGP earnings with payout details. Teachers have no lesson-request or approval screens.
- `/admin/dashboard`, `/admin/change-requests`, `/admin/students`, `/admin/teachers`, `/admin/teachers/{id}/availability`, `/admin/teacher-applications`, `/admin/assignments`, `/admin/lessons`, `/admin/lesson-ops`, `/admin/payments`, `/admin/transcripts`, `/admin/support` — admin tools; `/admin/change-requests` is the read-only history of the weekly times students moved, `/admin/lesson-ops` is the live day monitor plus review queues, salary review, and the lesson policy, and `/admin/payments` holds the USD account, per-teacher rates, and student claim reviews
- `/support/transcripts`, `/support/transcripts/{id}`, `/support/weekly` — support reviewers (also reachable by admins): queue, transcript plus rubric review, and the weekly per-teacher digest

The landing page is implemented in `src/app/page.tsx`. Feature screens are App Router `page.tsx` files; do not add a `pages/` directory.
