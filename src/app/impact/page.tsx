import ComingSoonPage from "@/components/home/ComingSoonPage";

export const metadata = {
  title: "Our Impact — Gita Life NYC",
  description:
    "The book distribution marathon, Govinda's kitchen, and our community milestones.",
};

export default function ImpactPage() {
  return (
    <ComingSoonPage
      eyebrow="Our Impact"
      heading="The full story behind the numbers"
      description="A scrolling narrative of the book distribution marathon, Govinda's kitchen, weekly classes, and retreats — told through photos, quotes, and real milestones. Coming soon."
      homeBlurb="The homepage Impact section has the headline numbers."
    />
  );
}
