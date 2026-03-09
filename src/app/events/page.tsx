"use client";

import { useState } from "react";

// ─── Event Data ────────────────────────────────────────────────────────────────

const EVENTS = [
  {
    id: "myf",
    emoji: "🌟",
    name: "MYF — Monday Youth Forum",
    tagline: "Our flagship weekly gathering",
    day: "Every Monday",
    time: "7:00 PM",
    location: "NYC (address shared on RSVP)",
    category: "Weekly",
    categoryColor: "bg-saffron text-white",
    description:
      "Dive into Gita philosophy, enjoy kirtan, and connect with like-minded seekers. Open to all young professionals and students. No experience needed — just come curious.",
    whatsapp:
      "https://wa.me/?text=Hi!%20I%27m%20interested%20in%20the%20Monday%20Youth%20Forum%20(MYF)%20by%20Gita%20Life%20NYC.%20Could%20you%20share%20details%3F",
    highlight: true,
  },
  {
    id: "university",
    emoji: "🎓",
    name: "University Programs",
    tagline: "On-campus Bhagavad Gita study groups",
    day: "Various days",
    time: "Check your campus schedule",
    location: "NYU · Columbia · Rutgers · and more",
    category: "Weekly",
    categoryColor: "bg-teal text-white",
    description:
      "Weekly Gita study groups tailored for college students. Perfect for anyone looking for deeper meaning beyond textbooks. Community, philosophy, and great prasadam included.",
    whatsapp:
      "https://wa.me/?text=Hi!%20I%27m%20a%20college%20student%20interested%20in%20the%20University%20Program%20by%20Gita%20Life%20NYC.%20Could%20you%20share%20details%3F",
    highlight: false,
  },
  {
    id: "girls",
    emoji: "🌸",
    name: "Girls' Preaching Circle",
    tagline: "A dedicated space for women",
    day: "Weekly",
    time: "TBD — contact us",
    location: "NYC (address shared on RSVP)",
    category: "Weekly",
    categoryColor: "bg-saffron text-white",
    description:
      "A supportive, women-only environment to explore spirituality, share experiences, and grow together. Come as you are — all backgrounds welcome.",
    whatsapp:
      "https://wa.me/?text=Hi!%20I%27m%20interested%20in%20the%20Girls%27%20Preaching%20Circle%20by%20Gita%20Life%20NYC.%20Could%20you%20share%20details%3F",
    highlight: false,
  },
  {
    id: "retreat",
    emoji: "🏕️",
    name: "Weekend Retreats",
    tagline: "Step away from the city noise",
    day: "Monthly / Seasonal",
    time: "Full weekend",
    location: "Upstate NY & surrounding areas",
    category: "Retreat",
    categoryColor: "bg-gold text-charcoal",
    description:
      "Our weekend retreats combine meditation, Gita workshops, nature walks, kirtan, and home-cooked prasadam. A complete reset for your mind and spirit — many call it the highlight of their year.",
    whatsapp:
      "https://wa.me/?text=Hi!%20I%27m%20interested%20in%20the%20next%20Weekend%20Retreat%20by%20Gita%20Life%20NYC.%20Could%20you%20share%20dates%20and%20details%3F",
    highlight: true,
  },
  {
    id: "festival",
    emoji: "🎉",
    name: "Festival Celebrations",
    tagline: "Janmashtami · Gaura Purnima · Ratha Yatra",
    day: "Throughout the year",
    time: "Varies by event",
    location: "NYC venues",
    category: "Festival",
    categoryColor: "bg-gold text-charcoal",
    description:
      "Experience the joy and color of Vedic festivals — kirtan, dancing, feasting, and hundreds of enthusiastic participants. These are unforgettable celebrations you won't find anywhere else in NYC.",
    whatsapp:
      "https://wa.me/?text=Hi!%20I%27m%20interested%20in%20upcoming%20Festival%20events%20by%20Gita%20Life%20NYC.%20Could%20you%20keep%20me%20updated%3F",
    highlight: false,
  },
  {
    id: "home",
    emoji: "🏠",
    name: "Home Programs & Bhakti Houses",
    tagline: "Intimate gatherings across NYC",
    day: "Various — weekly",
    time: "Evening sessions",
    location: "Devotee homes across all boroughs",
    category: "Weekly",
    categoryColor: "bg-teal text-white",
    description:
      "Small, intimate gatherings in devotee homes. Home-cooked prasadam, heartfelt discussions, and lasting friendships. The perfect starting point for newcomers who prefer a low-key setting.",
    whatsapp:
      "https://wa.me/?text=Hi!%20I%27m%20interested%20in%20Home%20Programs%20%2F%20Bhakti%20Houses%20by%20Gita%20Life%20NYC.%20Could%20you%20share%20details%3F",
    highlight: false,
  },
];

// ─── Registration Modal ────────────────────────────────────────────────────────

function RegisterModal({
  event,
  onClose,
}: {
  event: (typeof EVENTS)[0];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build a pre-filled WhatsApp message
    const msg = encodeURIComponent(
      `Hi! I'm ${name} and I just registered for "${event.name}" via the Gita Life NYC website. Looking forward to joining! My number: ${phone}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-warmgray hover:text-charcoal text-2xl leading-none"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🙏</div>
            <h3 className="text-2xl font-bold text-teal mb-2">
              See you there!
            </h3>
            <p className="text-warmgray">
              Your WhatsApp message has been opened. Our team will confirm your
              spot shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-saffron px-8 py-3 font-bold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-3xl">{event.emoji}</span>
              <h3 className="mt-2 text-xl font-bold text-charcoal">
                Register for {event.name}
              </h3>
              <p className="text-sm text-warmgray mt-1">
                {event.day} · {event.time}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full rounded-xl border border-gray-200 bg-cream px-4 py-3 text-charcoal focus:border-saffron focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (646) 000-0000"
                  className="w-full rounded-xl border border-gray-200 bg-cream px-4 py-3 text-charcoal focus:border-saffron focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-saffron py-3 font-bold text-white text-lg hover:bg-orange-600 transition-colors"
              >
                Register via WhatsApp →
              </button>
              <p className="text-center text-xs text-warmgray">
                Clicking above will open WhatsApp with a pre-filled message to
                our team.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  onRegister,
}: {
  event: (typeof EVENTS)[0];
  onRegister: (event: (typeof EVENTS)[0]) => void;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        event.highlight ? "border-saffron/40" : "border-gray-100"
      }`}
    >
      {event.highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-saffron" />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-3xl">{event.emoji}</span>
            <h3 className="mt-2 text-xl font-bold text-charcoal leading-snug">
              {event.name}
            </h3>
            <p className="text-sm text-warmgray italic">{event.tagline}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${event.categoryColor}`}
          >
            {event.category}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2 text-teal font-semibold">
            <span>📅</span>
            <span>
              {event.day} · {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-warmgray">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-warmgray leading-relaxed flex-1">
          {event.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => onRegister(event)}
            className="w-full rounded-full bg-saffron py-3 font-bold text-white text-sm hover:bg-orange-600 transition-colors"
          >
            Register / RSVP
          </button>
          <a
            href={event.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full border border-teal py-3 font-semibold text-teal text-sm text-center hover:bg-teal/5 transition-colors"
          >
            💬 Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [activeModal, setActiveModal] = useState<(typeof EVENTS)[0] | null>(
    null
  );
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", "Weekly", "Retreat", "Festival"];

  const filtered =
    filter === "All"
      ? EVENTS
      : EVENTS.filter((e) => e.category === filter);

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Header ── */}
      <header className="bg-teal text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-gold font-semibold tracking-wider uppercase text-sm mb-2">
            Gita Life NYC
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            All Events & Programs
          </h1>
          <p className="mt-3 text-lg text-white/80 max-w-xl mx-auto">
            Weekly gatherings, retreats, and festivals across New York City.
            Find your fit — and register in seconds.
          </p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {[
              { label: "Programs", value: "6+" },
              { label: "NYC Locations", value: "5+" },
              { label: "Students Reached", value: "500+" },
              { label: "Retreats Hosted", value: "20+" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-gold">{s.value}</p>
                <p className="text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Filter Bar ── */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-warmgray font-semibold shrink-0">
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === cat
                  ? "bg-saffron text-white"
                  : "bg-gray-100 text-charcoal hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Event Grid ── */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={(e) => setActiveModal(e)}
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-16 rounded-2xl bg-teal p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Not sure where to start?</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Answer a few quick questions and we&apos;ll recommend the perfect
            program for you.
          </p>
          <a
            href="/get-connected"
            className="inline-block rounded-full bg-saffron px-8 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Find My Program →
          </a>
        </div>

        {/* ── WhatsApp CTA ── */}
        <div className="mt-6 text-center">
          <p className="text-warmgray text-sm mb-2">
            Have questions? Reach out directly:
          </p>
          <a
            href="https://wa.me/?text=Hi!%20I%20scanned%20the%20Gita%20Life%20NYC%20QR%20code%20and%20I%27d%20like%20to%20learn%20more%20about%20your%20programs."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-teal px-6 py-2 font-semibold text-teal hover:bg-teal/5 transition-colors"
          >
            <span>💬</span> WhatsApp Us
          </a>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t border-gray-200 py-6 text-center text-sm text-warmgray">
        <p className="font-semibold text-charcoal">Gita Life NYC</p>
        <p>A community initiative under ISKCON</p>
        <p className="mt-1">© {new Date().getFullYear()} Gita Life NYC. All rights reserved.</p>
      </footer>

      {/* ── Modal ── */}
      {activeModal && (
        <RegisterModal
          event={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
