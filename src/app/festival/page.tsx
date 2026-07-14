import FestivalPageContent from "@/components/home/FestivalPageContent";
import { FEATURED_EVENT } from "@/data/home";

export const metadata = {
  title: `${FEATURED_EVENT.title} — Gita Life NYC`,
  description:
    "Our monthly Youth Festival — kirtan, a fireside talk, packed prasadam, and community at ISKCON Brooklyn. Free and open to all.",
};

export default function FestivalPage() {
  return <FestivalPageContent />;
}
