"use client";

import PricingPage from "@/components/Pricing";
import React from "react";

function page() {
  const handleNavigate = (page: string) => {
    // Handle navigation logic here
    console.log(`Navigating to: ${page}`);
  };

  return <PricingPage onNavigate={handleNavigate} />;
}

export default page;
