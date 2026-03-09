import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      {/* Logo / Name */}
      <p className="text-gold font-semibold tracking-wider uppercase text-sm mb-3">
        Welcome to
      </p>
      <h1 className="text-5xl md:text-6xl font-bold text-teal leading-tight">
        Gita Life NYC
      </h1>
      <p className="mt-4 text-lg text-warmgray max-w-lg">
        A community of young seekers exploring the Bhagavad Gita&apos;s timeless
        wisdom — through weekly programs, retreats, and deep friendships.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/events"
          className="rounded-full bg-saffron px-8 py-4 font-bold text-white text-lg hover:bg-orange-600 transition-colors shadow-lg"
        >
          View All Events →
        </Link>
        <Link
          href="/get-connected"
          className="rounded-full border-2 border-teal px-8 py-4 font-bold text-teal text-lg hover:bg-teal/5 transition-colors"
        >
          Get Connected
        </Link>
      </div>

      <p className="mt-8 text-xs text-warmgray">
        Under the guidance of ISKCON · New York City
      </p>
    </main>
  );
}
