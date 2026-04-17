import ComingSoonPage from "@/components/home/ComingSoonPage";

export const metadata = {
  title: "Gallery — Gita Life NYC",
  description: "Photo gallery from our community on Instagram @gitalifenyc.",
};

export default function GalleryPage() {
  return (
    <ComingSoonPage
      eyebrow="Photo Gallery"
      heading="Moments from our community"
      description="A masonry wall pulling directly from @gitalifenyc — festivals, classes, Harinam, retreats, and Govinda's kitchen. Coming once the Instagram feed integration is wired up."
      homeBlurb="Until then, the homepage has a live link to @gitalifenyc."
    />
  );
}
