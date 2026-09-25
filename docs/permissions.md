# Permission Matrix

Roles are defined by `profiles.role` (`super_admin`, `admin`, `teacher`,
`student`). Application-level permissions live in `src/lib/permissions.ts`;
data-level enforcement lives in the Supabase RLS policies
(`BE/supabase/schema.sql`).

## Application permissions (`hasPermission`)

| Permission            | super_admin | admin | teacher | student |
| --------------------- | :---------: | :---: | :-----: | :-----: |
| `*` (all)             |      ✅      |   —   |    —    |    —    |
| `manage_students`     |      ✅      |  ✅   |    —    |    —    |
| `manage_teachers`     |      ✅      |  ✅   |    —    |    —    |
| `manage_courses`      |      ✅      |  ✅   |    —    |    —    |
| `view_reports`        |      ✅      |  ✅   |    —    |    —    |
| `view_students`       |      ✅      |  ✅   |    ✅    |    —    |
| `mark_attendance`     |      ✅      |  ✅   |    ✅    |    —    |
| `create_assignments`  |      ✅      |  ✅   |    ✅    |    —    |
| `view_courses`        |      ✅      |  ✅   |    ✅    |    ✅    |
| `submit_homework`     |      ✅      |  —   |    —    |    ✅    |

`super_admin` holds the wildcard `*`, which satisfies every permission check.

## Data access (Row Level Security)

| Table             | student                | teacher                     | admin                | super_admin          |
| ----------------- | ---------------------- | --------------------------- | -------------------- | -------------------- |
| profiles          | own row                | own row                     | read all; edit non-admins | full            |
| courses           | enrolled only          | own courses                 | full                 | full                 |
| sessions          | enrolled course only   | own courses                 | full                 | full                 |
| attendance        | own                    | own courses (read/write)    | read/write           | full                 |
| assignments       | enrolled course only   | own courses                 | full                 | full                 |
| submissions       | own (read/write)       | read for own courses        | read                 | full                 |
| invoices          | own                    | —                           | read/write           | full                 |
| notifications     | own                    | own                         | read/write           | full                 |
| audit_logs        | —                      | —                           | —                    | read; insert for authenticated |
| contact_messages  | insert (public)        | insert (public)             | read all             | read all             |

## Post-login routing

Handled by `redirectAfterLogin` (`src/components/AutoRedirect.tsx`) using the
`ROLE_DASHBOARDS` map (`src/constants/role-routes.ts`) and enforced server-side
by `middleware.ts`:

| Role          | Dashboard                 |
| ------------- | ------------------------- |
| super_admin   | `/super-admin/dashboard`  |
| admin         | `/admin/dashboard`        |
| teacher       | `/teacher/dashboard`      |
| student       | `/student/dashboard`      |
