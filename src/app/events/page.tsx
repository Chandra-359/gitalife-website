import Link from "next/link";

export const metadata = {
  title: "Events — Gita Life NYC",
  description:
    "Explore upcoming Gita Life NYC events — kirtans, retreats, study groups, and more. Find the perfect program and register today.",
};

const events = [
  {
    title: "Monday Youth Forum (MYF)",
    description:
      "Our flagship weekly gathering for young professionals. Dive into Gita philosophy, enjoy kirtan, and connect with like-minded seekers.",
    schedule: "Every Monday, 7:00 PM",
    location: "NYC",
    tag: "Weekly",
  },
  {
    title: "University Bhagavad Gita Study",
    description:
      "Weekly study groups at NYU, Columbia, Rutgers, and more. Perfect for students looking for deeper meaning beyond textbooks.",
    schedule: "Various days — check with your campus group",
    location: "NYC Campuses",
    tag: "Weekly",
  },
  {
    title: "Girls' Circle",
    description:
      "A dedicated space for women to explore spirituality, share experiences, and grow together in a supportive environment.",
    schedule: "Weekly",
    location: "NYC",
    tag: "Weekly",
  },
  {
    title: "Weekend Retreat",
    description:
      "Step away from the city noise. Meditation, philosophy workshops, nature walks, and soul-nourishing prasadam.",
    schedule: "Monthly — dates announced soon",
    location: "Upstate NY",
    tag: "Monthly",
  },
  {
    title: "Festival Celebrations",
    description:
      "Experience the joy of Janmashtami, Gaura Purnima, Ratha Yatra, and other vibrant Vedic festivals with hundreds of enthusiastic participants.",
    schedule: "Throughout the year",
    location: "NYC",
    tag: "Seasonal",
  },
  {
    title: "Home Programs / Bhakti Houses",
    description:
      "Intimate gatherings in devotee homes across NYC. Home-cooked prasadam, small group discussions, and lasting friendships.",
    schedule: "Various days",
    location: "Various NYC locations",
    tag: "Weekly",
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-teal text-white py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl font-bold">
            Gita Life NYC
          </Link>
          <Link
            href="/get-connected"
            className="bg-saffron px-4 py-2 rounded-lg text-sm font-semibold hover:bg-saffron-light transition"
          >
            Get Connected
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-teal text-white pb-12 pt-6 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Upcoming Events
          </h1>
          <p className="text-white/80 text-lg">
            Find the right program for you — from weekly study groups to
            unforgettable retreats. Everyone is welcome.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event.title}
              className="bg-white rounded-xl shadow-sm border border-cream-dark p-6 hover:shadow-md transition"
            >
              <span className="inline-block bg-saffron/10 text-saffron text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {event.tag}
              </span>
              <h2 className="font-heading text-xl font-bold text-teal mb-2">
                {event.title}
              </h2>
              <p className="text-warm-gray text-sm mb-4">
                {event.description}
              </p>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-semibold">When:</span>{" "}
                  {event.schedule}
                </p>
                <p>
                  <span className="font-semibold">Where:</span>{" "}
                  {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 bg-cream-dark rounded-xl">
          <h2 className="font-heading text-2xl font-bold text-teal mb-2">
            Not sure which program is right for you?
          </h2>
          <p className="text-warm-gray mb-6">
            Answer a few quick questions and we&apos;ll recommend the perfect
            fit.
          </p>
          <Link
            href="/get-connected"
            className="inline-block bg-saffron text-white font-semibold px-8 py-3 rounded-lg hover:bg-saffron-light transition"
          >
            Get Connected
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal text-white/70 text-center py-6 text-sm">
        <p>Gita Life NYC — A community initiative under ISKCON</p>
      </footer>
    </main>
  );
}
