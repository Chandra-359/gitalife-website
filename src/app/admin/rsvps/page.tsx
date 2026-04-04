/**
 * /admin/rsvps — RSVP management dashboard
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RsvpTable from "@/components/admin/RsvpTable";

export default async function RsvpsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return <RsvpTable userEmail={session.user.email ?? "Admin"} />;
}
