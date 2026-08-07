/**
 * /admin/promocodes — Promo code management for the Bhajan Clubbing checkout
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PromoCodesConsole from "@/components/admin/PromoCodesConsole";

export default async function PromoCodesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return <PromoCodesConsole userEmail={session.user.email ?? "Admin"} />;
}
