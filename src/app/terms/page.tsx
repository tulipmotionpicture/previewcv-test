import FloatingHeader from "@/components/FloatingHeader";
import React from "react";

function page() {
  return (
    <>
      <FloatingHeader
        links={[{ label: "Candidate Login", href: "/candidate/login" }]}
        cta={{
          label: "Recruiter Access",
          href: "/recruiter/login",
          variant: "dark",
        }}
        showAuthButtons={true}
        hideOnScroll={true}
      />
      <h1>Data not available</h1>
    </>
  );
}

export default page;
