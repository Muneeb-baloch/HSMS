"use client";

import {
  CrisisSolversSection,
  FeaturesComparisonSection,
  Hero,
  LandingCTASection,
  LandingFooter,
  LandingNavbar,
  PricingSection,
  SecurityTrustSection,
  StickyDemoBar,
  TestimonialsSection,
} from "@/components/landing";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const visitorType = useMemo(() => {
    const ref = searchParams.get("ref");
    if (ref === "admin") return "admin" as const;
    if (ref === "member") return "member" as const;
    return "general" as const;
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <LandingNavbar />
      <main>
        <Hero visitorType={visitorType} />
        <CrisisSolversSection />
        <FeaturesComparisonSection />
        <SecurityTrustSection />
        <TestimonialsSection />
        <PricingSection />
        <LandingCTASection />
      </main>
      <LandingFooter />
      <StickyDemoBar />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
