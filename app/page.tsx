import CTASection from '@/components/landing/cta-section';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import PartnersSection from '@/components/landing/partners-section';
import Footer from '@/components/landing/footer';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-white">
      <div className="fixed right-4 top-4 z-50">
        <ThemeSwitcher />
      </div>
      <CTASection />
      <HeroSection />
      <FeaturesSection />
      <PartnersSection />
      <Footer />
    </main>
  );
}
