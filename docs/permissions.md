# Permissions

This file describes frontend visibility hints only. ASP.NET Core must enforce all permissions using the authenticated server-side identity.

| Capability | Student | Teacher | Admin |
|---|:---:|:---:|:---:|
| View own profile | Yes | Yes | Yes |
| View assigned teacher / students | Own teacher | Assigned students | All |
| View lessons | Own lessons | Own lessons | All |
| Manage teacher/student assignments | No | No | Yes |
| Create/reschedule/cancel lessons | No | Pending decision | Yes |
| Manage teacher/student accounts | No | No | Yes |

Public registration creates Students only. Admin/Teacher accounts must be provisioned through an Admin-authorized API operation.

The browser `user-role` cookie, React `RoleGuard`, `hasPermission`, and Next.js middleware are not security boundaries. The .NET API must return `401` for unauthenticated requests and `403` for forbidden actions, and must scope records by the current user.
