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
- Follow the recurring weekly schedule, receive reminders 5 minutes before and at the start, move a weekly booking to another time the teacher published (applied instantly; the teacher is notified), and propose moving a single lesson, which the other side accepts or declines.
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

Student enrolment is closed in the countries listed in `RESTRICTED_COUNTRIES` (`src/lib/plans.ts`, currently `EG`). The web edge resolves the visitor's country from the hosting geo header, mirrors it to the `academy-country` cookie, and overwrites `x-registration-country` on `/api/auth/register` and `/api/auth/otp/verify` so the value the API reads is edge-derived rather than client-supplied. `POST /api/auth/register` returns `403 { message }` when that header names a restricted country. `POST /api/auth/otp/verify` applies the same check only in the branch that creates an account, so an account that already exists keeps signing in from anywhere — the gate closes new places, not sessions. When `phone` is present on register it is normalized to E.164 and stored with `PhoneNumberConfirmed=false`; an invalid or already-used number returns a `phone` validation error, so a student who registers by email can still be reachable by mobile.

On the web the same gate hides the surfaces: the proxy redirects an anonymous restricted visitor from `/plans`, `/signup`, and `/register` to `/not-available` (a noindex page that points at `/teach` and WhatsApp), every marketing page renders its sign-up CTA through `EnrolCta`, which returns nothing for a restricted visitor, and the navbar and menu drop the "Start a free trial" link from the `academy-country` cookie. A signed-in account is never redirected, so an enrolled student keeps their plan pages. `/teach` stays open: recruiting teachers in these countries is the reason the gate exists.

`fullName` must be a person's name: anywhere a name is accepted from a non-staff caller (register, OTP signup, `PATCH /api/profile`, `POST /api/teacher-applications`) it is rejected with a `fullName` validation error when it contains `@`, so an email address cannot end up as the name every other participant sees.

That guard only covers writes, so accounts created before it can still hold an address in the name column. Reads answer for them in two ways, by who is looking:

- **To staff and to the person themselves** (`/api/auth/me`, `/api/admin/*` listings): `fullName`, `full_name`, and `name` are `null`, so the existing `?? email` fallbacks identify the account.
- **To the other side of a lesson** (teacher directory and profile entries, `/api/teachers/public*`, lesson, series, request, report, review, and attendance payloads): the name is the role word instead — `"Teacher"` or `"Student"`, because that caller has no address to fall back to.

Treat a name as absent, never as a string to re-check: no client should test for `@`, and `??` (not `||`) is the right operator, since `null` is what arrives.

Mobile has no IP geolocation in front of the API, so app traffic carries no `x-registration-country` header and the API treats a missing header as unrestricted: the gate is enforced on web today, and the app's signup stays open until the app is given a country signal of its own.

Prices are part of the same gate: `restrictedVisitor()` (`src/lib/pricing-visibility.ts`) reads the geo header, and both `/` and `/plans` call it. For the countries in `RESTRICTED_COUNTRIES` the homepage renders no plans strip at all, `/plans` renders no plan tiers, and neither page carries the figures in its copy, metadata or `Offer` structured data. Everyone else sees the plans with prices. Both pages are therefore server-rendered per request, not prerendered. This is a deterrent, not a control: the signal is the visitor's IP as the edge sees it, so a VPN, a private-relay exit abroad, or a rewritten cookie gets around it. No browser-side check can beat a VPN — the only signals that survive one are things the visitor hands over later (the dial code of a phone that actually receives the OTP, the payment rail), and those belong to signup, not to an anonymous marketing page.

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

Each directory item is `{ "teacher": { ...UserDto }, "slots": [ ...WeeklyRuleDto ], "averageRating": 4.8, "reviewCount": 12 }`. On every student-facing teacher endpoint (`/teachers/directory`, `/teachers/weekly-directory`, `/teachers/{id}/weekly-availability`, `/teachers/{id}/profile`, `/student/teacher/availability`) the `UserDto` is name-only: `email` is `""` and `phoneNumber` is `null`, because students see who teaches them, not how to reach them. Contact details appear only in staff responses and in each user's own `/api/profile`. The same rule runs the other way: `/api/students` and `/api/students/{id}` return contact fields to admins and to the student themself, but a teacher receives names only. A `WeeklyRuleDto` is:

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
      "status": "booked",
      "nextStartsAt": "2026-11-14T13:00:00Z"
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
  "hasLessons": false,
  "timeChangeLeadMinutes": 60
}
```

`nextStartsAt` is the instant this recurring time happens next in its own time zone (`null` when the teacher's time gives no occurrence in the next two weeks). `timeChangeLeadMinutes` is the academy-wide notice a student must leave a teacher when moving onto a weekly time; `/student/change-time/[seriesId]` hides any rule whose `nextStartsAt` lands inside that window, and the server refuses such a move with `409` if a client offers it anyway.

`hasLessons` is `false` until the student has ever had a lesson; the frontend uses it to show that the first booking will be a trial. When the student has no assigned teacher, `/api/student/teacher/weekly-availability` returns `{ "teacher": null, "slots": [], "series": [] }`.

`POST /api/student/bookings` takes `{ "ruleIds": ["uuid", "uuid"] }` with any number of rules (at least one, all from the same teacher) and returns `201` with `{ "series": [...], "lessons": [...] }`. Booking the same teacher again simply adds series; booking a different teacher deactivates the previous active assignment in the same transaction. The API rejects with `409` when a rule was just taken by someone else, overlaps a lesson the student already has, or conflicts with either calendar, and `400` when `ruleIds` is empty.

## Core account and assignment endpoints

| Method | Endpoint                                | Purpose                                               |
| ------ | --------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/students`                         | Admin list; teacher-scoped list if policy permits     |
| GET    | `/api/students/{id}`                    | One student: admins and the student themself get contact fields, an assigned teacher gets names only |
| POST   | `/api/students`                         | Admin creates a student account                       |
| GET    | `/api/teachers`                         | Admin list                                            |
| GET    | `/api/teacher-student-assignments`      | List assignments                                      |
| POST   | `/api/teacher-student-assignments`      | Assign `{ "teacherId": "uuid", "studentId": "uuid" }` |
| DELETE | `/api/teacher-student-assignments/{id}` | Deactivate assignment                                 |
| GET    | `/api/admin/students/pending`           | Every active student with their onboarding answers    |
| GET    | `/api/student/onboarding`               | The student's setup answers; an empty body when they have none |
| PUT    | `/api/student/onboarding`               | Save the wizard: the four levels, `daysPerWeek`, `weeklySlots`, `completed` |
| PATCH  | `/api/student/plan`                     | Record `{ "daysPerWeek": 2 }` — one of `2`, `3`, `4`, `5` |
| POST   | `/api/admin/students/{id}/weekly-lessons` | Book `{ "ruleIds": ["uuid"] }` and assign that teacher |

`GET /api/admin/students/pending` is the assignment desk's whole input. It returns one row per active student — including students who already have a teacher, so the desk can sort them — shaped `{ studentId, studentName, email, registeredAt, onboarding, hasTeacher, teacherName, weeklyLessons }`. `onboarding` is the same `StudentOnboardingDto` the student reads back from `GET /api/student/onboarding`, or `null` when they never opened setup; its `weeklySlots` are the student's own preferences in the student's zone, never bookings. `weeklyLessons` lists the student's active weekly series (`{ id, dayOfWeek, startsAtTime, endsAtTime, timeZoneId }`) on their teacher's clock — the desk re-reads each one on the student's clock to mark which offered windows already have a lesson. Rows come back longest-waiting first.

`StudentOnboardingDto` also carries `planDaysPerWeek`: the tier the student asked for, or `0` when they never chose. The wizard asks for it as its own step and sends it with the rest of the application — `PUT /api/student/onboarding` takes `daysPerWeek` (`2 | 3 | 4 | 5`, or `null` mid-wizard) — while `PATCH /api/student/plan` (`StudentOnly`) with `{ "daysPerWeek": 2 | 3 | 4 | 5 }` changes it later from `/plans`. Both reject anything else with `400 { "errors": { "daysPerWeek": [...] } }`, and both refuse a tier the offered week cannot hold: a finished application must cover at least `planDaysPerWeek` different weekdays, and a `PATCH` from a student who has already offered times must not outgrow them (`"A 4-day plan needs at least 4 different days."`). Mid-wizard partial saves are exempt, so the desk can see an application still being filled in. It is a wish, not a subscription — no card is ever charged for it — but it is what the month is billed at: the invoice price comes from the `PlanPrices` row for this tier, so a student with `planDaysPerWeek = 0` has nothing to pay yet and `/student/payments` says so. A save never clears it, so a student can choose a tier before or after finishing their answers. The desk shows it as a `Plan: N days a week` chip, with `M booked · K to place` once the student has lessons, and a line under the confirm button saying whether the rules just chosen fill that plan.

A student has at most one active teacher at a time; the API enforces this and reassignment replaces the previous active assignment.

`GET /api/teachers` and `GET /api/students` accept `?includeInactive=true` for admins so deactivated accounts stay visible for reactivation. Non-admin callers always get active accounts only.

### Admin account management

| Method | Endpoint                | Purpose                                                      |
| ------ | ----------------------- | ------------------------------------------------------------ |
| POST   | `/api/admin/users`      | Create a `teacher` (or `student`) account                    |
| GET    | `/api/teachers/{id}`    | Teacher detail (used by the admin weekly-times screen)       |
| PATCH  | `/api/admin/users/{id}` | Update `{ "fullName"?, "email"?, "password"?, "isActive"? }` |
| DELETE | `/api/admin/users/{id}` | Delete a teacher/student/support account and release bookings |

`PATCH`/`DELETE` apply only to teacher, student and support accounts. `PATCH` returns `409` for a duplicate email.

**Deactivate is a pause.** `PATCH { "isActive": false }` blocks sign-in and kills every existing session (security stamp rotation), but lessons, weekly series and assignments stay booked. `DeletedAt` stays `null`.

**Delete is a release.** `DELETE` works even when the account has booked lessons. It is still soft — lesson history keeps its owners — but it sets `isActive=false` plus a `deletedAt` timestamp, rotates the security stamp, and cascades:

- every active weekly series touching the account is ended;
- future scheduled lessons are cancelled with `cancellationOutcome = "series_ended"` (series lessons) or `"admin_cancelled"` (one-offs); no credit rows or teacher pay move, mirroring the series-end flow;
- pending reschedule requests on those lessons are cancelled and pending lesson requests are rejected, releasing their slots;
- active assignments are closed, so a deleted teacher's students reappear on `GET /api/admin/students/pending` with `hasTeacher=false`, their weekly preferences intact;
- a deleted teacher's future *available* one-off slots are removed; their weekly rules read as `available` again because rule status derives from active series;
- the other side of each released booking gets a notification + email from the academy ("Your teacher was removed" / "Student removed").

`PATCH { "isActive": true }` restores a deleted account (`deletedAt` back to `null`); released bookings stay released. The user DTO now carries `deletedAt`, and the admin screens show three states: Active, Deactivated, Deleted (deleted rows offer only Restore).

### Admin availability management

| Method | Endpoint                                                              | Purpose                                                  |
| ------ | --------------------------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/api/admin/teachers/availability-rules`                              | Every active teacher's weekly rules in one list          |
| GET    | `/api/admin/teachers/{teacherId}/availability-rules`                  | List that teacher's weekly rules                         |
| POST   | `/api/admin/teachers/{teacherId}/availability-rules`                  | Publish weekly rules on the teacher's behalf             |
| POST   | `/api/admin/teachers/{teacherId}/availability-rules/{ruleId}/release` | End every active series booked on this rule              |
| DELETE | `/api/admin/teachers/{teacherId}/availability-rules/{ruleId}`         | Delete a weekly rule that no longer has an active series |

The admin body is the same as the teacher's own publish call: `{ "daysOfWeek": [6, 0, 1], "startsAtTime": "15:00:00", "endsAtTime": "16:00:00", "timeZoneId": "Africa/Cairo" }`. Every rule must be 30, 45, or 60 minutes long; rules that overlap the teacher's existing rules or lessons are rejected with `400`. A rule that still backs an active series cannot be deleted — the response is `409` — because deleting it would silently cancel a booked weekly time. `…/{ruleId}/release` is the admin override for exactly that case: it deactivates each active series on the rule, cancels their future scheduled lessons with `cancellationOutcome = "series_ended"` (no credit moves and no reliability strike, because those rows were never charged), drops the teacher assignment when the pair has no other active series, and notifies both sides from the academy. It answers `200 { "released": 2, "lessonsCancelled": 11 }`, `404` for an unknown rule, and the `DELETE` then returns `204`. The web and mobile admin screens run the two calls in sequence behind one confirmation.

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

`grade` is optional and must be one of the fixed dropdown values (`Kindergarten`, `Grade 1` … `Grade 12`, see `src/lib/grades.ts`). The API persists it and returns it on every student `UserDto`. The API must ignore any role in the body and always create `student`. Return the created student as `{ "id": "uuid", "name": "Amina Hassan", "fullName": "Amina Hassan", "email": "...", "grade": "Grade 4" }`.

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

Approving an application is a status change only — **no account is created**. The teacher account is created later, when an admin finishes onboarding after the intro meeting (see below). Approval still returns `409` when the email already belongs to an account. An approved application can be rejected (with a 3–500 character reason) right up until the account exists; after that the review is final. The review response is `{ application }`. The application DTO carries `teacherId` (null until onboarding finishes), `meetingSlots`, `meetingStartsAt`, `meetingEndsAt`, and `onboardedAt`.

## Teacher onboarding (intro meeting)

| Method | Endpoint                                                        | Purpose                                                          |
| ------ | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| POST   | `/api/admin/teacher-applications/{id}/meeting-slots`             | Propose 1–3 future UTC ISO slots `{ "slots": ["..."] }` → `{ application, emailed, pickerUrl }` |
| POST   | `/api/admin/teacher-applications/{id}/finish-onboarding`         | After the meeting: creates + links the teacher account → `{ application, inviteEmailed, inviteCode }` |
| GET    | `/api/onboarding/{token}`                                        | Public invite: `{ fullName, slots[], meetingStartsAt, meetingEndsAt, picked, expiresAt }` |
| POST   | `/api/onboarding/{token}/pick`                                   | Public pick `{ "slot": "..." }` → `{ meetingStartsAt, meetingEndsAt, joinUrl }` |
| GET    | `/api/onboarding/meeting`                                        | Caller's booked meeting; staff pass `?applicationId={id}` → `{ applicationId, room, startsAt, endsAt, counterpartName, onboardedAt }` |

Pipeline: approve → admin proposes up to 3 slots (distinct, at least 5 minutes in the future) → the API emails a single-use picker link (`/onboarding/{token}`, 256-bit token stored as a SHA-256 hash, valid 7 days, cleared on pick) → the applicant picks one slot without signing in → a fixed 30-minute meeting is booked in the Jitsi room `anaquran-onboarding-{applicationId}`. The applicant has **no account yet**: their confirmation email and the pick response carry a direct Jitsi room URL built from the API's `Jitsi:Domain` config (compose `JITSI_DOMAIN`, default `meet.jit.si`; must match the FE's `NEXT_PUBLIC_JITSI_DOMAIN`). Staff join through the signed-in web page `/onboarding/meeting?applicationId=`. The reviewing admin gets a notification and email; the applicant gets email only.

Finish onboarding requires a booked meeting (`409` otherwise) and creates the teacher account in a transaction: random internal password, `teacher` role, `teacherId` + `onboardedAt` on the application, a 15-minute set-password code emailed with `SendTeacherInviteCodeAsync` (or returned as `inviteCode` when SMTP is unset), and a welcome notification. Only then does the teacher appear in directories and become assignable. The teacher signs the academy agreement at first sign-in like any teacher (the usual `428` gate). When SMTP is unset at the propose step, `pickerUrl` is returned for manual delivery. The public endpoints are anonymous and rate-limited with the shared `otp` policy; an unknown or expired token is `404`, a slot outside the offered set is `400` (`slot` validation error), and an already-picked link or a slot in the past is `409`.

## Signed agreements

| Method | Endpoint                | Purpose                                                    |
| ------ | ----------------------- | ---------------------------------------------------------- |
| GET    | `/api/policy/{key}`     | Public document text: `{ key, version, language, title, summary, clauses[] }` |
| GET    | `/api/policy/state`     | `{ required, accepted, document, acceptedAt }` for the caller's role |
| POST   | `/api/policy/accept`    | `{ policyKey, version, clauseIds[] }` → `{ policyKey, version, acceptedAt, clauseIds }` |

`key` is `teacher` (Arabic, 9 clauses) or `parent` (English, 9 clauses, signed on the student account). `language` decides text direction: render `document` right-to-left when it is `ar`. Admin and support get `required: false` and the FE page says there is nothing to sign.

The clause bodies arrive **already filled**. The templates in `PolicyCatalog.cs` hold `{freeCancelHours}`, `{teacherNoticeHours}` and `{noShowGraceMinutes}` tokens, which the API replaces with the live `AcademyPolicy` row on every read, and `version` is a SHA-256 fingerprint of that filled text rather than a hand-maintained counter. Clients must render what they are given and send back exactly the `version` they were served — never cache a document across a policy change, and never compare a version to a constant. Editing a cancellation window on `/admin/lesson-ops` therefore changes the agreement wording and invalidates every stored signature at once.

The FE sends exactly the clause ids it rendered. `404` unknown key, `409` with `currentVersion` when the page held an older version (re-fetch state and start again), `422` when a clause is unticked (`missing[]`) or an id is not in the document, `403` when the document belongs to another role. Re-accepting the same version is idempotent and returns the original `acceptedAt`.

Until the current version is on file, the API refuses the account's first real action with `428` — announcing availability, finishing student onboarding, or joining a lesson room. `backendFetch` turns that into the message "Accept the academy agreement before continuing.", and `PolicyPrompt` puts a "Review and accept" card to `/policy` on both dashboards and in the onboarding wizard.

## Weekly scheduling workflow

- Lessons are **individual**: one teacher and one student.
- A teacher announces **weekly rules** — a weekday, one of the three lesson lengths (30, 45, or 60 minutes), and an IANA time zone. Announcing a rule is the teacher's consent to be booked.
- A student selects **any number** of the teacher's open rules in one action and is booked instantly. There is no teacher confirmation and no admin approval.
- Every booking creates a permanent `LessonSeries`, and the API materializes the next 8 weeks of lessons from it, rolling forward on every schedule read.
- A rule can back only one active series, so a booked rule is no longer offered to other students.
- The student's **first-ever lesson** is flagged `isTrial: true` automatically.
- To move a weekly time, the student picks another open rule of the **same teacher** and the change applies immediately to that one series: every future week moves, while the student's other series keep their times. The teacher and admins are notified; there is no approval step.
- Moving a single dated lesson is a different flow (reschedule request, below): it needs the other side's acceptance and never changes the series.

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

`GET /api/admin/teachers/availability-rules` is the bulk form for the assignment desk: one flat `WeeklyRuleDto[]` covering every **active** teacher, each row carrying its `teacherId`, with `status` limited to `available` or `booked` (no student is in scope, so `yours` never appears). Teachers who publish nothing simply have no rows. The desk groups the list by `teacherId`, takes the first rule's `timeZoneId` as that teacher's clock, and counts how many of the waiting student's offered windows overlap at least one `available` rule — the overlap is tested in the teacher's zone, never the admin's.

### Open student offers (first teacher books)

A student **without an active teacher** can offer one-off times instead of booking a weekly rule. Every active teacher receives a notification; the first teacher who accepts books a one-off `Lesson` on their schedule instantly, and the offer closes for everyone else.

> **Not used by the web client.** Since the academy assigns every student, the web app neither publishes offers nor shows the teacher inbox; it kept these endpoints for the mobile app until that flow is retired with it.

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

A change request moves the series and rebuilds its future lessons in one transaction. Scheduled future lessons become `cancelled` with `cancellationOutcome = "series_rescheduled"`; they and their dependent history are never deleted. Their pending reschedule requests close in the same transaction. No credit moves or strikes are recorded. Both clients label this outcome "Weekly time changed". Existing individual cancellations remain untouched; only superseded weekly occurrences are excluded from deduplication, so moving away and back works without resurrecting ordinary cancellations. Original dates in a one-off reschedule's history also prevent duplicate materialization. A displaced future trial keeps its trial status on the earliest rebuilt lesson.

The startup schema replaces the unique series/start index with `IX_Lessons_SeriesId_StartsAt_Current`, excluding only `series_rescheduled` records. Ordinary cancellations and active occurrences still reserve their series/date. Apply the updated backend schema before using these changes.

Known target conflicts reject the weekly move with `409`. The rule's `nextStartsAt` must also respect `Scheduling__TimeChangeLeadMinutes` (`0` disables this notice window). A conflict discovered while extending the rolling calendar skips that occurrence and records `Weekly lesson not booked` notices, deduped per series/date: participants receive `kind = booking`, `link = /schedule`; admins receive `/admin/lesson-ops` to arrange an alternative.

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

The change applies as it is requested — there is no approval call. The target rule must belong to the same teacher (`404`), differ from the current rule, still be open, and not overlap another of the student's series or an existing lesson in the materialized window; a clash returns `409` and the student picks again, including when another student took the slot first. The series is retargeted and its future lessons are rebuilt in the same serializable transaction, then the student and teacher get a `Weekly time changed` notification naming the new time and every admin gets an informational one. Rows already stored with status `pending`, `approved` or `rejected` come from the removed approval queue and stay readable so old records keep rendering; `adminNote` is only set on those legacy rows.

`DELETE /api/student/series/{seriesId}` ends the student's own weekly series. It deactivates the series, cancels its future scheduled lessons with `cancellationOutcome = "series_ended"`, closes their pending reschedule requests, and deactivates the teacher assignment when no other active series with that teacher remains. The teacher receives a notification; the response is `204`. The slot becomes bookable again immediately.

### Booking consistency requirements

These are backend responsibilities, not frontend checks:

1. Validate that the chosen rules still exist, all belong to one teacher, and that teacher is active.
2. Enforce one active series per rule with a database uniqueness constraint, and answer `409` when two students race for the same slot.
3. Reassign the student's active teacher (and add the series, lessons, and trial flag) inside one transaction.
4. Reject a booking that overlaps another of the student's series, the teacher's calendar, or the student's calendar for the next 8 weeks.
5. Materialize 8 weeks of lessons per series and roll the window forward whenever lessons are read.
6. Store instants as UTC (`timestamp with time zone`), weekly times as `time`, and zones as IANA ids; resolve daylight-saving transitions when materializing.
7. Apply a weekly time change to the one `seriesId` it names, inside a serializable transaction; cancel (never delete) that series' future scheduled lessons with `series_rescheduled`, rebuild them at the new time, and leave the student's other series untouched.
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

One `AcademyPolicies` row (id `1`) drives every decision. Defaults: student/teacher free-cancel window 12 hours, no-show grace 10 minutes, reschedule reply deadline 12 hours, one student grace cancellation per Cairo month, student warning at 3 strikes, student admin review at 4, teacher admin review at 2, trial no-show threshold 2, and `payScheduledDurationWhenAttended = true`.

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

Rules: one `pending` request per lesson; the default reply deadline is the policy's `rescheduleResponseHours`; pending requests expire in the background monitor, which writes the requester a `Reschedule request expired` notification (and `Make-up proposal expired` on a cancelled lesson) with `link = /lesson/{id}` so they learn nothing moved instead of waiting. A request only stores a proposed time — nothing moves until the other side replies. Accepting on a scheduled lesson moves its `startsAt`/`endsAt` and never creates a duplicate; when the lesson belongs to a weekly series the notification adds "Only this lesson changed — your weekly time stays as booked", because rescheduling never touches the series. A reschedule does not cancel the lesson, so no cancellation outcome or credit movement is recorded. Normal proposals and acceptance require the original lesson not to have started. An admin-created normal proposal is answered by the teacher; make-up proposals are answered by the student (admins retain override authority). Expiry from a new request or late reply uses the same atomic notification path as the monitor. Both clients label the operation "Reschedule this lesson" and link students to "Change weekly time instead" for recurring changes.

A cancelled lesson is rebooked through the same routes: the teacher (or an admin) posts a reschedule request against it and the student's accept creates the make-up row. Both clients expose these controls on cancelled lesson pages, with status guidance while a student awaits a proposal. `series_ended` and `series_rescheduled` occurrences are ineligible and return `409`, including from the admin direct-booking route. A make-up lesson has `isMakeup = true`, `originalLessonId`, the original duration, and exactly one active replacement per original; it adds no credit and no charge. The original and replacement link to each other through `/api/lessons/{id}/operations`. `POST /api/lessons/{id}/replacement` stays as the staff override for times agreed outside the app.

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

| Method | Endpoint                            | Role            | Purpose                                             |
| ------ | ----------------------------------- | --------------- | --------------------------------------------------- |
| GET    | `/api/student/credits`              | student         | Balance plus append-only ledger                     |
| GET    | `/api/student/reliability`          | student         | Own reliability events                              |
| GET    | `/api/teacher/reliability`          | teacher         | Own reliability events                              |
| GET    | `/api/teacher/hours?month=&status=` | teacher         | Per-lesson hours                                    |
| GET    | `/api/teacher/salary-periods`       | teacher         | Monthly salary periods                              |
| POST   | `/api/devices/register`             | any             | `{ token, platform }` Expo push token               |
| POST   | `/api/devices/unregister`           | any             | `{ token, platform? }` — call on sign-out           |
| GET    | `/api/web-push/key`                 | any             | `{ key }` VAPID public key; `503` when unconfigured |
| POST   | `/api/web-push/subscribe`           | any             | `{ endpoint, p256dh, auth }` browser subscription   |
| POST   | `/api/web-push/unsubscribe`         | any             | `{ endpoint }` — call on sign-out                   |
| GET    | `/api/lessons/{id}/excuse`          | student         | Existing excuse request                             |
| POST   | `/api/lessons/{id}/excuse`          | student         | `{ category, explanation }` (late/no-show lessons)  |
| POST   | `/api/lessons/{id}/incident`        | teacher/student | `{ type, detail }` attendance dispute or no-show    |

`GET /api/lessons/{id}/operations` returns every incident on the lesson in
`incidents` (newest first), each carrying `reportedBy` — the account that filed
it, or `null` when `LessonOpsMonitor` opened it. A type can be filed once per
lesson, so a repeat `POST` answers `409`; clients drop the types already on the
lesson from the picker instead of letting the submit fail. The endpoint accepts
all three types from either participant, but each client offers only
`attendance_dispute` plus the *other* side's no-show, because "teacher did not
attend" is not something the teacher can report about themselves. Existing
reports are labelled "Your report", "Filed by {name}", or "Recorded
automatically", and the form stays beside them rather than replacing it.

`conduct_concern` is a fourth, confidential type, accepted only while
`LessonRoom__ReportConcern` is on (otherwise `404`) and only from the lesson's
actual student (a caller who also holds a teacher, admin or support role gets
`403`). Detail is 5–1000 characters, once per lesson (`409` on repeat). The
concern and its resolution are hidden from the lesson's teacher and from every
teacher-role account, in `operations` and in the admin queue. Admin
notifications name the reporter but never copy the concern text into the
notice, push, email or audit log. Resolving accepts only `resolved` or
`dismissed` with an optional note; it never creates penalties, attendance
outcomes, compensation or participant notices.

### Browser push subscriptions

Web Push is what lets a lesson call reach a laptop with no tab open. The client
registers `/sw.js`, subscribes through `pushManager` with the key from
`GET /api/web-push/key`, and posts the resulting `{ endpoint, p256dh, auth }`
triple. Permission is only ever asked for inside a click, so nothing here
prompts on its own.

The server checks the `endpoint` against the push services browsers actually
use (`fcm.googleapis.com`, `web.push.apple.com`,
`updates.push.services.mozilla.com`) and answers `400` for anything else — it
POSTs to that URL with its VAPID signature attached, so an unvalidated endpoint
would turn the API into a relay. A subscription is per browser profile, not per
account: registering the same endpoint under a different signed-in account moves
the row instead of creating a second one, and `pushsubscriptionchange` in the
worker re-registers silently when the push service rotates it. Expired
subscriptions are deleted by the sender when the push service answers 404/410.

Three independent teacher-hour values are stored per lesson: `actualAttendanceMinutes` from intervals, `proposedPayableMinutes` (actual, or the full scheduled time when the policy pays scheduled duration and both sides attended), and admin `approvedPayableMinutes`. Approval status is `pending`, `approved`, `adjusted`, `rejected`, or `not_applicable`, with the auditor and adjustment reason recorded.

The student credit ledger (`LessonCreditTransactions`) is append-only and idempotent per lesson/outcome; it is an audit trail, not a second wallet, and no billing rail reads it. Render `creditEffect` as whether the lesson counts against the student's record — never as a credit the family holds, spends, or loses. `GET /api/student/credits` exists but no client shows a family balance; the admin ledger and `credits/adjust` are the only views of it. Monthly USD/EGP billing remains the existing claims/rates system. Reliability events feed warning/review thresholds and an admin queue. Salary periods aggregate minutes, penalties, cancellations, and no-shows per teacher and month; the final EGP amount stays manual (no automatic transfer), and `status` moves `open` → `reviewed` → `paid`.

### Admin operations

| Method | Endpoint                                     | Purpose                                                       |
| ------ | -------------------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/admin/lesson-ops?date=YYYY-MM-DD`      | Day monitor: summary counters plus every lesson and its state |
| GET    | `/api/admin/lesson-ops/{lessonId}`           | Full detail with intervals, cancellations, requests, hours    |
| GET    | `/api/admin/excuse-requests?status=`         | Excuse queue                                                  |
| POST   | `/api/admin/excuse-requests/{id}/approve`    | Approve (restores the lesson credit)                          |
| POST   | `/api/admin/excuse-requests/{id}/reject`     | Reject                                                        |
| GET    | `/api/admin/lesson-incidents?status=`        | Incident queue                                                |
| POST   | `/api/admin/lesson-incidents/{id}/resolve`   | `{ action, note?, teacherPayableMinutes? }` (see below)       |
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

A completed student setup is the one non-lesson event that rings staff. `PUT /api/student/onboarding` with `completed: true` writes `Student waiting for a teacher` (`kind = request`, `link = /people/assign`) to every admin while that student has no active assignment. Every later save by the same unassigned student writes `Student updated their application`, so the desk is told about the new answers instead of working from the first submission. The dedupe key is per save (`student-waiting:{studentId}:{savedAt}:admin:{adminId}`), never per student. The body carries the application itself: the four levels and the earliest weekly window they offered, named in the student's own zone, so an admin reading the bell already knows who this is and what they can take. On web the link resolves to `/admin/assignments`; on mobile it opens the assign screen.

A notification row is stored once and read by both clients, so `link` always uses the mobile app's flat routes (`/schedule`, `/book`, `/people`, `/people/assign`, `/payments`, `/earnings`, `/lesson/{id}`, `/admin/lesson-ops`) — never a role-prefixed web path. The web app nests the same screens per role and translates the flat paths in `resolveNotificationHref` (`src/services/notification.service.ts`); add an entry there whenever a notice starts pointing at a new screen. Teachers have no lesson-request screen on either client, so request notices send them to `/schedule`.

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

`/lesson/{id}` loads the lesson through `GET /api/lessons/{id}` (which already enforces ownership) and embeds Jitsi Meet through the official External API (`https://{domain}/external_api.js`) inside our own page. The room name is derived from the lesson id and the Jitsi domain is configurable with `NEXT_PUBLIC_JITSI_DOMAIN` (defaults to `meet.jit.si`). Before joining, the page asks for camera/microphone access and offers three modes: camera + mic, mic only, or watch/listen only. Devices are enumerated first; when none are present (or permission is blocked) the page explains why and keeps a working "Join without camera & mic" path instead of dead-ending. Screen sharing is part of the standard Jitsi toolbar; the app-level lock described below decides who may use it.

The mobile app embeds the same room with the native `@jitsi/react-native-sdk` (not a WebView) and must point at the same self-hosted Jitsi host as the web build (the domain is baked into the app bundle). The room header exposes a native share sheet with the room URL so a participant can invite someone they trust; the room stays unlisted.

After `endsAt` the page closes the room and switches to the lesson recap: teachers submit or edit the class report, students read the report and rate the lesson, and admins see both.

Either participant can open the room; there is no presence check that blocks the other side. Web and mobile send attendance beacons (`join`/`leave`) from real Jitsi conference events, so participation is recorded without gating the room. The page registers the room on load and the "Show lesson room" button re-opens it after navigation, so nobody waits for the other side to arrive.

Admins and super admins can open any confirmed lesson room as academy support: `/admin/lessons` lists live, upcoming, and past lessons with a link to `/lesson/{id}`. The API already authorizes admins on the lesson, report, and review reads; the room adds "(Academy support)" to the admin's Jitsi display name so the teacher and student know why a third person joined. The start-time gate still applies to admins, and the room allows three participants (there is no participant cap on the Jitsi deployment).

The room is unlisted, not access-controlled. The Jitsi room itself is unlisted rather than locked: anyone who knows the room name can join directly on the Jitsi deployment, and display names are not verified. Real enforcement requires a JWT-enabled Jitsi (JaaS or self-hosted) where only the teacher receives a moderator token and the room is protected by lobby or required moderator.

### Live room feature flags

`GET /api/config/lesson-room` is anonymous, sent with `Cache-Control: no-store`, and answers `{ "whiteboard": false, "chat": false, "cameraBackground": false, "pen": false, "performanceSettings": false, "transcription": false, "reportConcern": false }`, read from `LessonRoom__Whiteboard`, `LessonRoom__Chat`, `LessonRoom__CameraBackground`, `LessonRoom__Pen`, `LessonRoom__PerformanceSettings`, `LessonRoom__Transcription` and `LessonRoom__ReportConcern` (all off when unset). Both clients refetch it every 30 seconds through TanStack Query, and the room only mounts once the first answer has arrived. Jitsi fixes its toolbar buttons and background switches when the conference is created, so those five flags only reach rooms opened afterwards. `transcription` and `reportConcern` are app-level controls and follow a refresh inside an open room; both fail closed when the request errors, and the web stops capture when its last successful answer is older than 45 seconds. A suspended or offline client cannot receive a remote switch-off instantly. Deploy the API before any client that reads it — while the route is unmapped it answers `401` under the fail-closed policy, and a client treats that as every flag off.

`performanceSettings` is read by the web app only. It adds `"videoquality"` to `toolbarButtons`, which is the button that opens Jitsi's "Performance settings" dialog (best performance ↔ highest quality). The mobile SDK builds a fixed native toolbar that has no such button, so the field arrives in the payload and no mobile control.

### Screen marking (lesson pen)

Jitsi cannot annotate a live screen share, so marks travel over the existing realtime hub as a lesson-scoped ink layer. Clients draw on a transparent canvas/SVG over the Jitsi view; points are normalized to that overlay (`0..1`) and the REST layer is not involved.

| Hub method                                               | Purpose                                                                                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `JoinLessonPen(lessonId)`                                | Participant-only. Adds the connection to `lesson-pen:{lessonId}` and returns `{ strokes: [{ id, color, width, points }], frame }` |
| `StartPenStroke(lessonId, strokeId, color, width, x, y)` | Drawer-only. Broadcasts `PenStrokeStarted { id, color, width, x, y }` to the other participants                                   |
| `AppendPenStroke(lessonId, strokeId, points)`            | Drawer-only. `points` is `[x, y, ...]` (at most 256 doubles per call); broadcasts `PenStrokeAppended`                             |
| `EndPenStroke(lessonId, strokeId)`                       | Drawer-only. Broadcasts `PenStrokeEnded`                                                                                          |
| `ClearLessonPen(lessonId)`                               | Drawer-only. Broadcasts `PenCleared`                                                                                              |
| `SetPenFrame(lessonId, aspect)`                          | Drawer-only. Fits the annotation box to the shared picture; broadcasts `PenFrameChanged { frame }` and returns the clamped ratio  |

`strokeId` is an opaque client string of 1–64 letters, digits or dashes — not a GUID. Both apps generate their own shape, and the hub only uses it to match appends and ends to a stroke.

Only the lesson's teacher, an admin, or a super admin may draw; support staff and students receive the marks read-only. Ink is ephemeral in-memory state (newest 400 strokes, dropped after 6 idle hours) and is never persisted.

**Where a point lands.** Coordinates are normalized inside the lesson's annotation frame, not inside each viewer's call view. The frame is the largest centered box of the shared picture's ratio that fits the stage, so a mark at `0.5, 0.5` is the middle of the shared page on every screen — a desktop and a portrait phone agree. `frame` is that box's width-to-height ratio and defaults to 16:9, which matches a laptop display and most cameras. Whoever marks can correct it by dragging the corner grip (or arrow keys) until the box lines up with the picture they see; only the ratio travels, because each screen recentres the box in its own layout. Clearing ink does not reset the frame, and changing the frame re-places existing marks, which is the point: marks stick to the page. Residual error remains where Jitsi's own filmstrip or toolbars push the picture off centre, since the app cannot measure inside the video surface.

### One screen share at a time

A lesson allows only one shared screen. Jitsi has no server or config setting for this, so the rule lives on our hub: a first-come lock per lesson, held by the SignalR connection that claimed it and freed automatically when that connection drops.

| Hub method                     | Purpose                                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JoinLessonShare(lessonId)`    | Participant-only. Subscribes to `lesson-share:{lessonId}` and returns the current `{ on, holder }` so someone joining mid-lesson learns it is taken            |
| `ClaimLessonShare(lessonId)`   | Fires when the local client starts sharing. Returns `{ accepted, holder }`; the winner is broadcast to the others as `LessonShareChanged { on: true, holder }` |
| `ReleaseLessonShare(lessonId)` | Called when the local share stops or the client leaves the room. Broadcasts `LessonShareChanged { on: false, holder: null }`                                   |
| `LeaveLessonShare(lessonId)`   | Unsubscribes on hang-up or unmount                                                                                                                             |

`holder` is always labelled from the other participant's point of view ("Your teacher", "Your student", "An admin", or a scrubbed display name), never from the sharer's. A participant who loses a race re-claims harmlessly, so the holder never blocks themselves.

Behaviour differs by platform because the Jitsi surfaces differ:

- **Web** (External API): on a rejected claim the provider force-stops the violator with `toggleShareScreen` and shows a bottom banner naming the current holder.
- **Mobile** (React Native SDK): `onScreenShareToggled` only reports the local share and the SDK exposes no way to stop it, so the app cannot be force-stopped. It shows the same banner with "please stop yours" instead. Both sides then stay in sync through the hub.

Known gap, accepted deliberately: an iOS app suspended mid-share stops JavaScript, and the socket close frees the lock — so the other participant can start a share briefly before the first resumes. Fail-open applies throughout: if the realtime socket is unavailable, the rule cannot be checked and screen sharing keeps working normally.

## Lesson transcripts and off-platform flags

The call runs in a cross-origin iframe, so the web page cannot read remote audio. While `LessonRoom__Transcription` is on, each consenting participant on a desktop browser transcribes **only their own microphone** with the browser's English speech recognition and uploads text through the authenticated self-ingest route. Consent is optional and unchecked by default; capture pauses while Jitsi reports the mic muted and stops on leave, consent withdrawal, flag off or provider failure. The browser's speech provider may process the audio; the academy stores text only. Native mobile cannot transcribe: it sends one `unsupported` status and shows that limitation. Client text and statuses are untrusted signals.

| Method | Endpoint                             | Purpose                                                                                                  |
| ------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| POST   | `/api/lessons/{id}/transcript/self`  | Participant self-ingest; `{ segments: [{ id, text, atSeconds? }], status }`                              |
| POST   | `/api/lessons/{id}/transcript`       | Trusted server relay ingest; `{ segments: [{ speaker?, text, atSeconds? }] }`                            |
| GET    | `/api/admin/transcripts`             | Flagged lessons and capture coverage gaps (max 200), flagged first (ReviewerOnly)                        |
| GET    | `/api/admin/lessons/{id}/transcript` | Full ordered transcript for one lesson (ReviewerOnly)                                                    |
| GET    | `/api/admin/review-queue`            | Review queue: `status=all\|unreviewed\|draft\|submitted\|flagged`, optional `flagged=true`, `from`, `to` |
| GET    | `/api/admin/lessons/{id}/review`     | Lesson, metrics, existing review and ordered segments                                                    |
| PUT    | `/api/admin/lessons/{id}/review`     | Upsert the rubric review (draft or submitted)                                                            |
| GET    | `/api/admin/review-digest`           | Weekly per-teacher rollup: `weekStart=yyyy-MM-dd` (defaults to this Monday, UTC)                         |

Self-ingest rules: the caller must be the lesson's actual teacher or student with the matching role; speaker and `source: "client"` are derived server-side. `404` while `LessonRoom__Transcription` is off; `409` for cancelled lessons or outside `startsAt − 15 min` to `endsAt + 15 min`. `status` is `started`, `muted`, `unsupported`, `denied`, `stopped` or `error`; `unsupported`/`denied` must carry no segments. 0–50 segments per request, each with a nonempty UUID `id` (deduplicated per lesson and user), 1–1000 trimmed characters, and an optional finite `atSeconds` between 0 and lesson duration + 30 minutes. Limits: 30 requests per minute per user, 256 KB body. The web batches at most 20 segments / 48 KB, retries with backoff, and sends a best-effort keepalive flush on leave; an abrupt disconnect can lose text.

Relay ingest rules: anonymous but requires the `X-Transcript-Key` header to equal `Transcripts:IngestKey`; the route returns `404` while no key is configured, which keeps it off, and `401` for a wrong key. The key is server-only and never ships in a client. Each request carries 1–200 segments; empty text is skipped, text is capped at 4000 characters, and the speaker defaults to `Unknown`. `AtSeconds` is the offset from the start of the recording.

Both routes share a 5000-segment cap per lesson (`409` when exceeded) and reject lessons that ended more than 30 days ago (`409`).

Coverage gaps: set `Transcripts__LightCaptureSince` to the approved UTC activation instant. Joins and self-uploads observed while capture is on, in lessons starting at or after that instant, record a capture expectation per participant (`LessonTranscriptCaptures`); a missing or invalid cutoff records none. After `endsAt + 15 min`, an expected teacher capture with zero segments and at least 10 minutes of teacher attendance appears in `/api/admin/transcripts` with reason `unsupported_device` or `no_transcript` and `flaggedSegments: 0`. These are informational, never evidence of poaching: muting, silence, declined consent and device limits are legitimate.

The API scans segments for six heuristic review codes: `phone` (phone numbers), `email` (email addresses), `platform` (external platforms, including chat apps, sites and video apps), `offplatform` (off-platform contact or lesson arrangements), `payment` (payment discussion) and `secrecy` (secrecy language). Detection can use request-local same-speaker context to recognize phrases split across segments; context is not shared between speakers or carried across ingest requests. These flags are review signals, not proof of misconduct. Matches are stored as comma-separated flags on the segment. The admin list groups flagged segments per lesson and merges the reasons; the detail view returns every segment with `flags` as an array so the UI can highlight lines for review.

Transcript text belongs in this API and Postgres only. Never enable Jitsi's `/transcripts` static route: it publishes files at a guessable public URL, which is unacceptable for lessons involving minors. The infrastructure privacy overlay answers `404` for `/transcripts` and everything under it.

Retention is fixed at 30 days for every transcript, flagged or not. EF query filters immediately hide segments stored more than 30 days ago and capture rows first seen more than 30 days ago, and the `TranscriptRetention` hosted service deletes them at startup and hourly. Reviews and incidents are kept, so a reviewer's verdict and notes outlive the text; copy anything needed as evidence into the review notes within 30 days. Reviewer responses are sent with `Cache-Control: no-store`.

### Support review workflow

The `support` role is read-only outside reviews: it can open the transcript endpoints above, save a rubric review, and read the weekly digest. It cannot change lessons, students, teachers, or assignments. Admins and super admins share the same review access through the `ReviewerOnly` policy (`admin`, `super_admin`, `support`); `AdminOnly` still guards everything else under `/api/admin`.

- **Automated metrics** in the workspace: segment counts by speaker, estimated talk-time balance (~150 words per minute; a signal, not a clock), recorded length from `atSeconds`, and flagged segments/reasons. The text comes from ASR, so the API never scores recitation or tajweed automatically.
- **Rubric**: four 1–5 scores (`teachingClarity`, `studentPractice`, `correctionQuality`, `engagement`) plus `strengths`, `gaps`, `teacherAction`, `studentAction`. Drafts can be incomplete and can be saved without transcript text (for missing-capture follow-up notes); submitting requires retained transcript text, all four scores and a gap of at least 3 characters. Do not score unavailable capture as poor teaching.
- **Workspace capture fields**: `captures` (`role`, `lastStatus`, `firstSeenAt`, `lastSeenAt`, `lastSegmentAt`, `segmentCount`, `expected` per participant), `coverageReasons` (`unsupported_device` / `no_transcript`), `retentionDays: 30`, and each segment's `source` (`client` for self-ingest, `server` for the relay).
- **Audit**: every workspace or transcript read writes a `TranscriptAccessLogs` row (`lessonId`, `userId`, `accessedAt`). There is no UI for the log yet; query it directly when an access audit is needed.
- **Weekly digest**: groups submitted reviews by teacher for the week, with rubric averages, follow-up actions, and the lessons still unreviewed or only drafted. This is the artifact the support lead reviews at the end of the week.
- **Accounts**: admins create support reviewers from `/admin/support` (`POST /api/admin/users` with `role: "support"`), list them with `GET /api/admin/support-users`, and deactivate/reactivate them through `PATCH /api/admin/users/{id}` (`isActive`).

The frontend mirrors the API: `/support/transcripts` is the queue, `/support/transcripts/{id}` is the transcript plus rubric, and `/support/weekly` is the digest. Admins reach the same pages from the navigation.

Both capture and concern reporting stay off until the owner approves the consent wording (including that the browser's speech provider may process audio), guardian consent for minors, and the activation cutoff. Transcripts remain reviewer-only; teachers and students never read them.

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
- `canClaim` on the student response is the single source of truth for showing the "I've sent the payment" action. It is false for a month already settled by card, which the response also reports as `cardPaid`.
- Teacher and student responses are role-scoped: the API derives the user id from the session, never from a query parameter.

The web pages are `/student/payments`, `/teacher/payments`, and `/admin/payments`; the mobile app mirrors the first two as `/payments` and `/earnings`.

## Card checkout (web only)

A month is billed at the flat plan price, held entirely server-side. The frontend never computes, edits, or confirms an amount.

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/api/pricing?currency=&country=` | public | `{ currency, currencies[], plans[{ daysPerWeek, classesPerMonth, monthlyAmount }], cardCheckout, freeCancelHours, teacherNoticeHours, noShowGraceMinutes }` |
| GET | `/api/student/payments/invoice?month=&currency=` | student | `{ month, daysPerWeek, currency, amount, invoice? }` — the last month that has ended, or its bill |
| POST | `/api/student/payments/invoice` | student | `{ currency? }` only. Returns the same view with `invoice` filled in |
| POST | `/api/student/payments/invoice/{invoiceId}/checkout` | student | `{ invoiceId, transactionId, clientSecret, publishableKey, providerReference, currency, amount, expiresAt }` |
| GET | `/api/student/payments/attempt/{transactionId}/status` | student | `{ invoiceId, invoiceStatus, paid, providerStatus, providerReached }` |

`src/lib/pricing.ts` (server side, used by `/` and `/plans`) and `src/services/pricing.service.ts` + `src/services/payment.service.ts` (client side) are the only places these are called; `src/components/CardCheckout.tsx` mounts the Stripe frame and `src/components/student/PlanPayCard.tsx` owns the month.

- **`cardCheckout` decides whether a Pay button exists.** It is false until the host has Stripe keys *and* a complete price set in that currency, so a page never advertises a payment it cannot take. Render no card affordance when it is false — the transfer-and-claim path below stays the way that month is paid.
- **No page holds a price of its own.** `/plans` and the landing page render `plans[].monthlyAmount` through `money()`; a tier with no row in the resolved currency is simply absent from the list.
- **The rule numbers are public too.** `freeCancelHours`, `teacherNoticeHours` and `noShowGraceMinutes` are the same `AcademyPolicy` values the signed agreements are filled from, and `/api/pricing` returns them even when the visitor's prices are hidden — the rules still bind them. `getLessonRules()` in `src/lib/pricing.ts` reads them for the public FAQ, which must interpolate them instead of typing a window into copy; the shipped defaults apply only when the API cannot be reached.
- **The month is the one that has ended.** `view.month` is the last closed month in Cairo time and the screen labels it, never "this month". Asking for the ongoing month answers `400`, and a month whose classes were all cancelled quotes `amount: 0` — `PlanPayCard` reads `daysPerWeek === 0` as "no plan on record" and `amount === 0` as "nothing is due for {month} yet".
- **One rail per month.** The billing view carries `cardPaid`; when it is true the transfer panel says the month is settled by card instead of inviting a transfer, because `canClaim` is false and the claim route would refuse. The reverse holds server-side too: a month with a transfer pending or confirmed cannot open a card checkout.
- **Currency is chosen by the server.** The student's `?currency=` pick wins, then the country from the geo header or the `academy-country` cookie, then the academy default. An incomplete pick is ignored, not guessed at — a stale switcher link quietly shows USD rather than a number the API would refuse to bill.
- **A redirect back from Stripe is not payment.** `?session_id=` in the URL only makes the screen poll the status endpoint sooner. `paid` comes from that endpoint (which re-reads the provider) or the webhook, and `invoice.status === "paid"` is the only thing that may change the UI.
- **Poll, don't hope.** Ask `/attempt/{id}/status` every 5 seconds while a checkout is open, and stop when the invoice is paid. The tracked attempt is the ticket just returned, or else the `pending` attempt already on the invoice — that is how a tab closed mid-payment resumes.
- **One checkout per month.** Re-opening checkout for a live attempt returns the same `transactionId`; the amount on the returned ticket is the invoice's, so display it rather than a locally remembered figure.
- **Sessions expire; the form must not.** `expiresAt` is Stripe's own deadline for the session (30 minutes by default). `PlanPayCard` re-calls the checkout endpoint a minute before it, and again when a backgrounded tab wakes up past it; the server retires an expired attempt and issues a fresh session, so a student who left the form open never meets Stripe's `checkout_not_active_session` refusal. A `409` on that refresh (paid, or claimed by transfer) drops the form and lets the invoice query show the truth.
- Amounts are decimal major units in JSON (`44.00`), never cents; `money()` in `src/lib/plans.ts` is the only formatter.
- Failures need no extra handling in the components: `backendFetch` already raises a toast for a 4xx product message (`"This month is already paid."`), and `PlanPayCard` deliberately adds its own generic line only when the failure is *not* an `ApiError`, so a student never sees the same sentence twice and never sees infrastructure wording.
- Prices stay hidden from visitors geolocated to Egypt on both public pages, exactly as before; that check gates the price list, so no card button appears either.

The admin routes behind this are on `/admin/payments`: the plan prices have a desk panel (`src/components/admin/PlanPricesDesk.tsx`, through `getPlanPrices`/`savePlanPrice` in `src/services/payment.service.ts`). `GET /api/admin/payments/prices` answers `{ tiers[], currencies[], prices[] }` so the panel can only offer what the server can honour, and a `PUT` returns `openInvoicesUsingOldPrice` — bills already out keep the figure they were issued at. The invoices, transactions, refunds and callback log still have no screen.

## Error contract

Prefer RFC 7807 Problem Details. Common status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` missing resource, `409` slot/assignment/scheduling conflict, `429` rate limit or sign-in lockout. The frontend displays `title`, `detail`, or `message` when available.

`428` is the unsigned-agreement refusal and carries its own JSON body, not Problem Details: `{"code":"policy_acceptance_required","policyKey":"teacher","version":1693859204,"message":"Accept the teacher agreement before continuing.","link":"/policy"}`. `version` is an opaque fingerprint of the rendered text, not a counter — send it back unchanged and never compare it to a constant. Both clients map it to a generic line through `statusMessage`; the prompt card is what routes the user, not the error.

Sign-in failures put the sentence in `detail`, never in `title` — `backend-client.ts` and the mobile `api/client.ts` both treat `detail`/`message` as product copy and treat `title` as infrastructure wording, so a message that belongs in `title` is silently replaced by the client's generic line.

Two different `429`s exist and neither client has to guess which one it got:

| Cause                                 | Body                                                                                                                                     | Header                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Five wrong passwords on one account   | `{"title":"Sign in locked","status":429,"detail":"Too many failed attempts. Sign in is locked for about 3 minutes."}`                    | `Retry-After: <seconds left>` |
| Too many requests from one connection | `{"title":"Too Many Requests","status":429,"detail":"Too many attempts from your connection. Please wait a few minutes and try again."}` | none                          |

The account lock lasts three minutes and lifts by itself; a correct password during the window is still refused with the same body, and the failed-attempt count resets on the next successful sign-in. No client change is needed to show either message: `/login` on web and the mobile login screen already surface the incoming `ApiError` message.

## App Router route map

- `/` — public landing page (includes the latest student reviews)
- `/contact`, `/login`, `/signup` — public contact and authentication (email/password or phone OTP)
- `/teach` — public teacher application form (details plus CV and recording uploads)
- `/teachers`, `/teachers/{id}` — authenticated students only; anonymous visitors are redirected to `/login`, other roles to their dashboard
- `/profile` — student/teacher/admin profile: name, email, mobile, photo, and class-report history
- `/notifications` — in-app notification feed (bookings, reminders, requests, payments, system)
- `/policy` — the agreement the signed-in role must tick and accept; open to every role, and the document is whichever one the API assigns to it
- `/student/dashboard`, `/student/availability`, `/student/teachers/{id}`, `/student/change-time/{seriesId}`, `/student/payments`, `/schedule`, `/lesson/{id}` — student overview, teacher directory with unlimited weekly multi-select, self-service weekly time change, this month's card bill plus the monthly payment statement, recurring schedule, and post-lesson recap/review
- `/teacher/dashboard`, `/teacher/availability`, `/teacher/schedule`, `/teacher/payments` — teacher tools: announce weekly rules, see the weekly bookings, submit reports, and review monthly EGP earnings with payout details. Teachers have no lesson-request or approval screens.
- `/admin/dashboard`, `/admin/change-requests`, `/admin/students`, `/admin/teachers`, `/admin/teachers/{id}/availability`, `/admin/teacher-applications`, `/admin/assignments`, `/admin/lessons`, `/admin/lesson-ops`, `/admin/payments`, `/admin/transcripts`, `/admin/support` — admin tools; `/admin/change-requests` is the read-only history of the weekly times students moved, `/admin/lesson-ops` is the live day monitor plus review queues, salary review, and the lesson policy, and `/admin/payments` holds the USD account, the plan prices per currency, per-teacher rates, and student claim reviews
- `/support/transcripts`, `/support/transcripts/{id}`, `/support/weekly` — support reviewers (also reachable by admins): queue, transcript plus rubric review, and the weekly per-teacher digest

The landing page is implemented in `src/app/page.tsx`. Feature screens are App Router `page.tsx` files; do not add a `pages/` directory.
