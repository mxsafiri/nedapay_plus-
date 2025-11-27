import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import PartnersSection from '@/components/landing/partners-section';
import CTASection from '@/components/landing/cta-section';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <FeaturesSection />
      <PartnersSection />
      <CTASection />
      <Footer />
    </main>
  );
}
