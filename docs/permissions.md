# Permissions

Frontend visibility hints only. **ASP.NET Core enforces every permission** against
the authenticated server-side identity; hiding a control is never the protection.
For the rules behind each capability, see
[`../../docs/business-requirements/README.md`](../../docs/business-requirements/README.md).

Server-side policies: `AdminOnly` (`admin`, `super_admin`), `ReviewerOnly`
(`admin`, `super_admin`, `support`), `TeacherOnly`, `StudentOnly`, and plain
`RequireAuthorization()` where the endpoint applies its own ownership checks.

| Capability                                               |          Student          |            Teacher            |            Support             |            Admin            |
| -------------------------------------------------------- | :-----------------------: | :---------------------------: | :----------------------------: | :-------------------------: |
| View own profile                                         |            Yes            |              Yes              |              Yes               |             Yes             |
| View assigned teacher / students                         |        Own teacher        |       Assigned students       |               No               |             All             |
| View lessons                                             |        Own lessons        |          Own lessons          | All (API only — no support UI) |             All             |
| Book a weekly time from a published rule                 |            Yes            |              No               |               No               |             Yes             |
| Publish/remove weekly availability rules                 |            No             |           Yes (own)           |               No               | Yes (on a teacher's behalf) |
| End own weekly series                                    |            Yes            |              No               |               No               |             Yes             |
| Move a weekly time to another open rule                  |            Yes            |              No               |               No               |             Yes             |
| Read the weekly time-change history                      |            No             |              No               |               No               |             Yes             |
| Cancel / reschedule a lesson                             |  Own lesson, per policy   |    Own lesson, per policy     |               No               |         Any lesson          |
| Attendance beacons, excuse, incident report              |        Own lesson         |          Own lesson           |               No               |          Own view           |
| Write a lesson report                                    |            No             |   Own lesson, after it ends   |               No               |             No              |
| Write a lesson review                                    | Own lesson, after it ends |              No               |               No               |             No              |
| Review transcripts / quality rubric                      |            No             |              No               |              Yes               |             Yes             |
| Read a transcript                                        |            No             |              No               |         Yes (audited)          |        Yes (audited)        |
| Manage teacher/student/support accounts                  |            No             |              No               |               No               |             Yes             |
| Manage teacher/student assignments                       |            No             |              No               |               No               |             Yes             |
| Set lesson policy                                        |            No             |              No               |               No               |             Yes             |
| Confirm/reject payment claims, set rates, payout account |      Claims own USD       | Sees own EGP + payout details |               No               |             Yes             |
| Approve teacher applications                             |            No             |              No               |               No               |             Yes             |

Public registration creates students only. Teacher, admin, and support accounts
come from an admin operation or an approved `/teach` application.

The browser `user-role` cookie, React `RoleGuard`, `hasPermission`, and Next.js
middleware are hints, not security boundaries. The API must return `401` for
unauthenticated requests and `403` for forbidden actions, and must scope records
by the current user.
