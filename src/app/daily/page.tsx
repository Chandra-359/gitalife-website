import ComingSoonPage from "@/components/home/ComingSoonPage";

export const metadata = {
  title: "Daily Practice — Gita Life NYC",
  description:
    "Daily verse, japa tracker, and guided reading from the Bhagavad Gita.",
};

export default function DailyPage() {
  return (
    <ComingSoonPage
      eyebrow="Daily Practice"
      heading="Verse of the day, japa, and reading"
      description="A daily rhythm of Bhagavad Gita practice — today's verse with a memorization tool, 16-round japa guidance, and a guided scripture passage. Coming soon."
      homeBlurb="Today's verse is already live on the homepage."
    />
  );
}
