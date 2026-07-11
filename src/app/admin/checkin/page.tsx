/**
 * /admin/checkin — door check-in dashboard for Bhajan Clubbing
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckinBoard from "@/components/admin/CheckinBoard";

export default async function CheckinPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return <CheckinBoard userEmail={session.user.email ?? "Admin"} />;
}
