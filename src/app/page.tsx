import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TextReveal from "@/components/TextReveal";
import Stats from "@/components/Stats";
import Programs from "@/components/Programs";
import Testimonials from "@/components/Testimonials";
import Team from "@/components/Team";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <TextReveal />
      <Stats />
      <Programs />
      <Testimonials />
      <Team />
      <FinalCTA />
      <Footer />
    </main>
  );
}
