"use client";

import PricingPage from "@/components/Pricing";
import React from "react";
import { useRouter } from "next/navigation";
import type { JobPlan, CvPlan } from "@/types/api";

interface PricingContentProps {
  // Passed straight through from the server component so the cards render in the HTML.
  initialJobPlans?: JobPlan[];
  initialCvPlans?: CvPlan[];
}

function Page({ initialJobPlans, initialCvPlans }: PricingContentProps) {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    // Add leading slash if not present
    const path = page.startsWith("/") ? page : `/${page}`;
    router.push(path);
  };

  return (
    <PricingPage
      onNavigate={handleNavigate}
      initialJobPlans={initialJobPlans}
      initialCvPlans={initialCvPlans}
    />
  );
}

export default Page;
