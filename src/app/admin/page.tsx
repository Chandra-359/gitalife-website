/**
 * /admin — Protected admin dashboard
 *
 * Contains the "Add Program" form. Only accessible to authenticated users.
 * The middleware in middleware.ts redirects unauthenticated users to /admin/login.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return <AdminDashboard userEmail={session.user.email ?? "Admin"} />;
}
