import { NextResponse } from "next/server";
import { put, BlobError } from "@vercel/blob";
import { auth } from "@/lib/auth";

/**
 * /api/admin/upload — media uploads for program posters, photos & videos.
 *
 * POST multipart/form-data with a single `file` field (and an optional
 * `prefix`, e.g. the program id). Stores the file in Vercel Blob and
 * returns { url } for use in imageUrl / galleryUrls / videoUrl.
 *
 * Requires BLOB_READ_WRITE_TOKEN (Vercel dashboard → Storage → Blob).
 * Without it the endpoint answers 503 and the admin UI falls back to
 * paste-a-URL.
 */

export const maxDuration = 60;

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB — enough for short videos
const ALLOWED_PREFIXES = ["image/", "video/"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "File storage isn't configured (BLOB_READ_WRITE_TOKEN) — paste a URL instead" },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is too large (100 MB max)" }, { status: 400 });
    }
    if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
      return NextResponse.json({ error: "Only images and videos can be uploaded" }, { status: 400 });
    }

    const prefix = String(form.get("prefix") ?? "programs")
      .replace(/[^a-zA-Z0-9/_-]/g, "")
      .slice(0, 80) || "programs";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);

    const blob = await put(`${prefix}/${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload failed:", error);
    // Surface the Blob service's own reason to the (admin-only) UI — e.g. a
    // private-mode store rejecting public uploads, or a bad token — instead
    // of a generic message nobody can act on.
    if (error instanceof BlobError) {
      return NextResponse.json({ error: `Vercel Blob: ${error.message}` }, { status: 502 });
    }
    return NextResponse.json({ error: "Upload failed — please try again" }, { status: 500 });
  }
}
