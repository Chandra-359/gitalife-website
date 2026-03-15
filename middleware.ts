/**
 * Next.js middleware — delegates to NextAuth for route protection.
 *
 * Only runs on /admin routes (see matcher below).
 * The actual authorization logic lives in src/lib/auth.ts → callbacks.authorized
 */

export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};
