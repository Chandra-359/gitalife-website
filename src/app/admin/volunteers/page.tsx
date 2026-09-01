/**
 * /admin/volunteers — volunteer drive signups console.
 *
 * Shift-fill board + full registration list per drive (drives are
 * defined in src/data/volunteer.ts). Read-heavy sibling of /admin/rsvps.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import VolunteersConsole from "@/components/admin/VolunteersConsole";

export const dynamic = "force-dynamic";

export default async function AdminVolunteersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return <VolunteersConsole userEmail={session.user.email ?? "Admin"} />;
}
