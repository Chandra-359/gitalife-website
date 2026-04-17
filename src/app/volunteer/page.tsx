import ComingSoonPage from "@/components/home/ComingSoonPage";

export const metadata = {
  title: "Volunteer — Gita Life NYC",
  description: "Seva opportunities at ISKCON Brooklyn temple.",
};

export default function VolunteerPage() {
  return (
    <ComingSoonPage
      eyebrow="Seva Opportunities"
      heading="Volunteer at ISKCON Brooklyn"
      description="From helping in Govinda's kitchen to joining Sunday Harinam, there are many ways to serve. An engagement ladder — from 1-hour drop-ins to long-term seva — is coming soon."
    />
  );
}
