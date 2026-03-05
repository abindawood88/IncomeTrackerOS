import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HeroSection from "@/components/landing/HeroSection";
import LandingNav from "@/components/landing/LandingNav";
import PricingCards from "@/components/landing/PricingCards";
import SocialProof from "@/components/landing/SocialProof";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-textBright">
      <LandingNav />
      <HeroSection />
      <FeaturesGrid />
      <PricingCards />
      <SocialProof />
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 text-sm text-textDim md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-textBright">IncomeTrackerOS</div>
            <div>The Operating System for Dividend Investors</div>
          </div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
