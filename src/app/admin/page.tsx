import { redirect } from "next/navigation";

// Legacy admin screen replaced by the role-scoped dashboard and the student /
// teacher management pages.
export default function AdminPage() {
  redirect("/admin/dashboard");
}
