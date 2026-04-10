/**
 * /admin/programs/[id]/edit — Edit an existing program
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProgramForm from "@/components/admin/ProgramForm";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

interface EditProgramPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;

  if (!prisma) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] text-white">
        <p>Database not configured</p>
      </div>
    );
  }

  const program = await prisma.program.findUnique({ where: { id } });

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a1a] text-white gap-4">
        <p className="text-white/50">Program not found</p>
        <Link href="/admin" className="text-[#E8751A] hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Serialize for client component — arrays stay as arrays
  const initialData = {
    title: program.title,
    category: program.category,
    type: program.type,
    description: program.description,
    dayOfWeek: program.dayOfWeek,
    time: program.time ?? "",
    latitude: program.latitude.toString(),
    longitude: program.longitude.toString(),
    capacity: program.capacity?.toString() ?? "",
    status: program.status,
    featured: program.featured,
    imageUrl: program.imageUrl ?? "",
    videoUrl: program.videoUrl ?? "",
    subtitle: program.subtitle ?? "",
    address: program.address ?? "",
    venueName: program.venueName ?? "",
    duration: program.duration ?? "",
    level: program.level ?? "",
    whyAttend: program.whyAttend ?? "",
    whatToBring: program.whatToBring ?? "",
    whatToExpect: program.whatToExpect,   // string[] — ProgramForm joins with \n
    whatYouGet: program.whatYouGet,       // string[] — ProgramForm joins with \n
    lectureTopic: program.lectureTopic ?? "",
    gitaReference: program.gitaReference ?? "",
    speakerName: program.speakerName ?? "",
    speakerTitle: program.speakerTitle ?? "",
    speakerBio: program.speakerBio ?? "",
    speakerImageUrl: program.speakerImageUrl ?? "",
    testimonial: program.testimonial ?? "",
    testimonialAuthor: program.testimonialAuthor ?? "",
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Toaster position="top-right" />

      <header className="border-b border-white/[0.06] bg-[#0c0c20]/60 px-6 py-4 backdrop-blur-xl">
        <h1 className="text-lg font-bold">
          Gita Life <span className="text-[#E8751A]">NYC</span>{" "}
          <span className="text-white/40">/ Admin / Edit Program</span>
        </h1>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="mb-1 text-xl font-bold">Edit: {program.title}</h2>
        <p className="mb-8 text-sm text-white/50">
          Update the program details. Changes take effect immediately.
        </p>
        <ProgramForm mode="edit" programId={id} initialData={initialData} />
      </main>
    </div>
  );
}
