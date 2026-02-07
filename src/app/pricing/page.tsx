"use client";

import PricingPage from "@/components/Pricing";
import React from "react";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    // Add leading slash if not present
    const path = page.startsWith("/") ? page : `/${page}`;
    router.push(path);
  };

  return <PricingPage onNavigate={handleNavigate} />;
}

export default Page;
