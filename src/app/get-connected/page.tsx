"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type FormData = {
  name: string;
  age: string;
  gender: string;
  location: string;
  interests: string[];
  experience: string;
};

const initialForm: FormData = {
  name: "",
  age: "",
  gender: "",
  location: "",
  interests: [],
  experience: "",
};

const ageOptions = [
  { value: "16-18", label: "16–18", sub: "High School" },
  { value: "18-22", label: "18–22", sub: "College" },
  { value: "23-30", label: "23–30", sub: "Young Professional" },
  { value: "30+", label: "30+", sub: "Professional" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer-not", label: "Prefer not to say" },
];

const locationOptions = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
  "New Jersey",
  "Other",
];

const interestOptions = [
  { value: "philosophy", label: "Philosophy & Wisdom", icon: "📖" },
  { value: "meditation", label: "Meditation & Inner Peace", icon: "🧘" },
  { value: "community", label: "Community & Friendships", icon: "🤝" },
  { value: "kirtan", label: "Music & Kirtan", icon: "🎵" },
  { value: "cooking", label: "Vegetarian Cooking", icon: "🍲" },
  { value: "retreats", label: "Retreats & Getaways", icon: "🏕️" },
  { value: "curious", label: "Just Curious!", icon: "✨" },
];

const experienceOptions = [
  { value: "new", label: "Completely new to this" },
  { value: "explored", label: "I've explored a bit" },
  { value: "familiar", label: "Familiar with ISKCON / Vedic philosophy" },
  { value: "practicing", label: "I'm a practicing devotee" },
];

function getRecommendation(data: FormData) {
  const { age, gender, interests, experience } = data;

  // Priority-based recommendation
  if (experience === "practicing") {
    return {
      program: "Advanced Study & Seva",
      description:
        "Join our deeper study groups and seva opportunities. Your experience and dedication can inspire others on the path.",
      when: "Various times",
      where: "Multiple NYC locations",
      whatsapp: "Hi! I'm a practicing devotee interested in deeper study and seva opportunities.",
    };
  }

  if (age === "18-22") {
    return {
      program: "University Programs",
      description:
        "Perfect for college students! Weekly Bhagavad Gita study groups at campuses across NYC. Meet fellow students exploring life's biggest questions.",
      when: "Various days, check your campus",
      where: "NYU, Columbia, Rutgers & more",
      whatsapp: "Hi! I'm a college student interested in your University Programs.",
    };
  }

  if (gender === "female") {
    return {
      program: "Girls' Preaching + MYF",
      description:
        "We recommend our dedicated women's program for a supportive, understanding environment — plus Monday Youth Forum for the full community experience.",
      when: "Weekly + Mondays 7 PM",
      where: "NYC locations",
      whatsapp: "Hi! I'm interested in the Girls' Preaching program and MYF.",
    };
  }

  if (interests.includes("retreats")) {
    return {
      program: "Weekend Retreats",
      description:
        "Step away from the city noise. Our retreats combine meditation, philosophy, nature, and soul-nourishing prasadam. The perfect way to start.",
      when: "Monthly / Seasonal",
      where: "Various retreat centers",
      whatsapp: "Hi! I'm interested in your upcoming retreats.",
    };
  }

  if (interests.includes("kirtan")) {
    return {
      program: "Kirtan Nights & MYF",
      description:
        "If music speaks to your soul, our kirtan sessions and Monday Youth Forum are the perfect entry point. Experience the joy of devotional music.",
      when: "Mondays 7 PM + special events",
      where: "NYC locations",
      whatsapp: "Hi! I'm interested in kirtan and the Monday Youth Forum.",
    };
  }

  // Default: MYF
  return {
    program: "Monday Youth Forum (MYF)",
    description:
      "Our flagship weekly gathering is the best place to start. Dive into Gita philosophy, enjoy kirtan, connect with like-minded seekers, and enjoy delicious prasadam.",
    when: "Every Monday, 7:00 PM",
    where: "NYC — exact location shared on WhatsApp",
    whatsapp: "Hi! I'm interested in joining the Monday Youth Forum.",
  };
}

const slideVariants = {
  enter: { x: 80, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
};

export default function GetConnected() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const totalSteps = 7; // 0=welcome, 1=name, 2=age, 3=gender, 4=location, 5=interests, 6=experience, then result

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const toggleInterest = (value: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
  };

  const progress = Math.min((step / totalSteps) * 100, 100);
  const recommendation = getRecommendation(form);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Back to home */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="text-sm text-white/40 transition-colors hover:text-white"
        >
          ← Back
        </Link>
      </div>

      {/* Progress bar */}
      {step > 0 && step <= totalSteps && (
        <div className="fixed top-0 left-0 z-50 h-1 w-full bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-saffron to-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      <div className="flex min-h-screen items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Let&apos;s Find the Right
                <br />
                <span className="text-gradient-saffron">Program for You</span>
              </h1>
              <p className="mx-auto mt-6 max-w-md text-lg text-white/50">
                Answer a few quick questions and we&apos;ll suggest the best way
                to get started. Takes less than a minute.
              </p>
              <button
                onClick={next}
                className="mt-10 rounded-full bg-saffron px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-saffron-light"
              >
                Let&apos;s Go
              </button>
            </motion.div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div
              key="name"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                What&apos;s your name?
              </h2>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name"
                className="mt-8 w-full border-b-2 border-white/20 bg-transparent px-2 py-4 text-center text-2xl text-white outline-none transition-colors focus:border-saffron"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && form.name && next()}
              />
              <div className="mt-10 flex justify-center gap-4">
                <button
                  onClick={back}
                  className="rounded-full border border-white/20 px-6 py-3 text-white/60 transition hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={!form.name}
                  className="rounded-full bg-saffron px-8 py-3 font-semibold text-white transition-all hover:bg-saffron-light disabled:opacity-30"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <motion.div
              key="age"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                How old are you, {form.name}?
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {ageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, age: opt.value }));
                      setTimeout(next, 300);
                    }}
                    className={`rounded-xl border-2 p-6 text-left transition-all duration-300 ${
                      form.age === opt.value
                        ? "scale-[1.02] border-saffron bg-saffron/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {opt.label}
                    </span>
                    <span className="mt-1 block text-sm text-white/40">
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={back}
                className="mt-8 text-sm text-white/40 transition hover:text-white"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* Step 3: Gender */}
          {step === 3 && (
            <motion.div
              key="gender"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Just so we can share the most relevant programs:
              </h2>
              <div className="mt-8 flex flex-col gap-3">
                {genderOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, gender: opt.value }));
                      setTimeout(next, 300);
                    }}
                    className={`rounded-xl border-2 p-5 text-lg transition-all duration-300 ${
                      form.gender === opt.value
                        ? "scale-[1.02] border-saffron bg-saffron/10 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={back}
                className="mt-8 text-sm text-white/40 transition hover:text-white"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <motion.div
              key="location"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Where in NYC are you based?
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {locationOptions.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, location: loc }));
                      setTimeout(next, 300);
                    }}
                    className={`rounded-xl border-2 p-4 text-base transition-all duration-300 ${
                      form.location === loc
                        ? "scale-[1.02] border-saffron bg-saffron/10 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <button
                onClick={back}
                className="mt-8 text-sm text-white/40 transition hover:text-white"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* Step 5: Interests */}
          {step === 5 && (
            <motion.div
              key="interests"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                What draws you to Gita Life?
              </h2>
              <p className="mt-2 text-white/40">Select all that apply</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {interestOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleInterest(opt.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                      form.interests.includes(opt.value)
                        ? "scale-[1.02] border-saffron bg-saffron/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="mt-1 block text-sm text-white">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={back}
                  className="rounded-full border border-white/20 px-6 py-3 text-white/60 transition hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={form.interests.length === 0}
                  className="rounded-full bg-saffron px-8 py-3 font-semibold text-white transition-all hover:bg-saffron-light disabled:opacity-30"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Experience */}
          {step === 6 && (
            <motion.div
              key="experience"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center"
            >
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Have you attended any spiritual programs before?
              </h2>
              <div className="mt-8 flex flex-col gap-3">
                {experienceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, experience: opt.value }));
                      setTimeout(next, 300);
                    }}
                    className={`rounded-xl border-2 p-5 text-lg transition-all duration-300 ${
                      form.experience === opt.value
                        ? "scale-[1.02] border-saffron bg-saffron/10 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={back}
                className="mt-8 text-sm text-white/40 transition hover:text-white"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* Step 7: Result */}
          {step === 7 && (
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-lg text-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <p className="text-lg text-white/60">
                  Hey {form.name}, here&apos;s what we think is perfect for you:
                </p>

                <div className="mt-8 rounded-2xl border border-saffron/30 bg-gradient-to-br from-saffron/10 to-transparent p-8 text-left">
                  <h3 className="font-serif text-3xl font-bold text-gradient-saffron">
                    {recommendation.program}
                  </h3>
                  <p className="mt-4 leading-relaxed text-white/70">
                    {recommendation.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-white/60">
                      <svg className="h-5 w-5 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{recommendation.when}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <svg className="h-5 w-5 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{recommendation.where}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex flex-col gap-4">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      recommendation.whatsapp + ` I'm ${form.name} from ${form.location}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-green-500"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Join WhatsApp Group
                  </a>

                  <Link
                    href="/#programs"
                    className="rounded-full border border-white/20 px-8 py-4 text-base text-white/60 transition-all hover:border-white/40 hover:text-white"
                  >
                    Explore Other Programs
                  </Link>
                </div>

                <p className="mt-8 text-sm text-white/30">
                  Questions? Reach out at contact@gitalifenyc.com
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
