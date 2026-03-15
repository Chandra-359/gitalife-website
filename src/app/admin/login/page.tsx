/**
 * /admin/login — Admin sign-in page
 *
 * Simple credentials form. On success, redirects to /admin.
 * Styled to match the dark glassmorphism theme.
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0c0c20]/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <h1 className="mb-1 text-2xl font-bold text-white">Admin Login</h1>
        <p className="mb-6 text-sm text-white/50">Gita Life NYC Dashboard</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/40">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none focus:ring-1 focus:ring-[#E8751A]/30"
          placeholder="admin@gitalife.nyc"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/40">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E8751A]/50 focus:outline-none focus:ring-1 focus:ring-[#E8751A]/30"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#E8751A] py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(232,117,26,0.25)] transition-all hover:bg-[#d4680f] hover:shadow-[0_0_24px_rgba(232,117,26,0.35)] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
