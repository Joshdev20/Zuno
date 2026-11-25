import { useEffect } from 'react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { Hero } from '../components/marketing/Hero';
import { TracksSection } from '../components/marketing/TracksSection';
import { MethodSection } from '../components/marketing/MethodSection';
import { FeaturesSection } from '../components/marketing/FeaturesSection';
import { PricingSection } from '../components/marketing/PricingSection';
import { FaqSection, ClosingCta, SiteFooter } from '../components/marketing/SiteFooter';

export function Landing() {
  useEffect(() => {
    document.title = 'Zuno — Learn the web by building it';
  }, []);

  return (
    <div className="marketing">
      <MarketingNav />
      <main>
        <Hero />
        <TracksSection />
        <MethodSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
