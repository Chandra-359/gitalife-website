/**
 * NextAuth.js v5 (Auth.js) configuration
 *
 * Uses a simple Credentials provider with a single admin account.
 * The admin email and password are read from environment variables:
 *   ADMIN_EMAIL    — the login email (e.g. admin@gitalife.nyc)
 *   ADMIN_PASSWORD — the login password
 *
 * For production, consider switching to Google OAuth or another provider.
 * See: https://authjs.dev/getting-started/providers
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
        }

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: "admin",
            name: "Admin",
            email: adminEmail,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (isLoginPage) {
        // Already logged in → redirect to admin dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isAdminRoute && !isLoggedIn) {
        // Not logged in → redirect to login
        return false;
      }

      return true;
    },
  },
});
