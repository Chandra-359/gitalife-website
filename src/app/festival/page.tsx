import ComingSoonPage from "@/components/home/ComingSoonPage";
import { FEATURED_EVENT } from "@/data/home";

export const metadata = {
  title: "Youth Festival — Gita Life NYC",
  description:
    "Our monthly Youth Festival — kirtan, talks, prasadam, and community at ISKCON Brooklyn.",
};

export default function FestivalPage() {
  return (
    <ComingSoonPage
      eyebrow="Monthly Youth Festival"
      heading={FEATURED_EVENT.title}
      description={`${FEATURED_EVENT.description} ${FEATURED_EVENT.dateLabel}, ${FEATURED_EVENT.timeLabel} at ${FEATURED_EVENT.location}.`}
      homeBlurb="Registration (via Luma) and full festival page coming in Phase 2."
    />
  );
}
