import ComingSoonPage from "@/components/home/ComingSoonPage";

export const metadata = {
  title: "Retreats — Gita Life NYC",
  description: "Quarterly weekend retreats in upstate New York.",
};

export default function RetreatsPage() {
  return (
    <ComingSoonPage
      eyebrow="Quarterly Retreats"
      heading="Weekend retreats in upstate New York"
      description="A few times a year we head upstate for a full weekend of kirtan, scripture study, meditation, nature, and prasadam. Past retreat photos and upcoming dates land here soon."
    />
  );
}
