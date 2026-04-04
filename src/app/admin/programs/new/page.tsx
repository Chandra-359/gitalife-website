/**
 * /admin/programs/new — Create a new program
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProgramForm from "@/components/admin/ProgramForm";
import { Toaster } from "react-hot-toast";

export default async function NewProgramPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />

      <header className="border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <h1 className="text-lg font-bold">
          Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
          <span className="text-white/40">/ Admin / New Program</span>
        </h1>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="mb-1 text-xl font-bold">Create New Program</h2>
        <p className="mb-8 text-sm text-white/50">
          Fill in the details below. Published programs appear on the map immediately.
        </p>
        <ProgramForm mode="create" />
      </main>
    </div>
  );
}
