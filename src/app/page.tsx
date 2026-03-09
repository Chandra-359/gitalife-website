import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-teal mb-4">
        Gita Life NYC
      </h1>
      <p className="text-warm-gray text-lg max-w-xl mb-8">
        Discover the timeless wisdom of the Bhagavad Gita — right here in NYC.
        Weekly programs, retreats, and a community that feels like family.
      </p>
      <div className="flex gap-4">
        <Link
          href="/events"
          className="bg-saffron text-white font-semibold px-6 py-3 rounded-lg hover:bg-saffron-light transition"
        >
          View Events
        </Link>
        <Link
          href="/get-connected"
          className="border-2 border-teal text-teal font-semibold px-6 py-3 rounded-lg hover:bg-teal hover:text-white transition"
        >
          Get Connected
        </Link>
      </div>
    </main>
  );
}
