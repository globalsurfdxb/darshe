import { Enquire } from "@/components/landing/Enquire";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Included } from "@/components/landing/Included";
import { OurStory } from "@/components/landing/OurStory";
import { Pillars } from "@/components/landing/Pillars";
import { SheIsDarShe } from "@/components/landing/SheIsDarShe";
import { Spaces } from "@/components/landing/Spaces";

// Re-render daily so the footer year never goes stale.
export const revalidate = 86400;

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <OurStory />
        <Pillars />
        <Spaces />
        <Included />
        <SheIsDarShe />
        <Enquire />
      </main>
      <Footer />
    </>
  );
}
