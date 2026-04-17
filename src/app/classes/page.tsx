import ComingSoonPage from "@/components/home/ComingSoonPage";

export const metadata = {
  title: "Weekly Classes — Gita Life NYC",
  description:
    "Three weekly Bhagavad Gita classes across Newport, Jersey City, and ISKCON Brooklyn.",
};

export default function ClassesPage() {
  return (
    <ComingSoonPage
      eyebrow="Weekly Classes"
      heading="Join a Bhagavad Gita class this week"
      description="We host three weekly classes: Friday in Newport, Saturday in Jersey City, and Sunday at ISKCON Brooklyn. A full schedule with maps, directions, and what-to-expect for each location is coming soon."
      homeBlurb="Meanwhile, the homepage 'This Week' section has the next upcoming class."
    />
  );
}
