import React from "react";

export default function JobsLayout({
  filters,
  jobs,
  sidebar,
}: {
  filters: React.ReactNode;
  jobs: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  // Tablet (md) is two columns — filters and jobs — with the right sidebar joining at lg.
  // It used to be three at md (1/4 · 2/4 · 1/4), which on an ~800px screen left each side
  // column ~168px: filter labels truncated to "Manufa…", Top Hiring Partners tiles were cut
  // off, and the job list was squeezed to ~350px. Below md both side columns are hidden.
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 pb-8">
      {/* Filters */}
      <aside className="hidden md:block md:col-span-1 lg:col-span-3 order-1 h-full">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          {filters}
        </div>
      </aside>

      {/* Job Listings */}
      <main className="md:col-span-2 lg:col-span-6 order-2 md:order-2">
        {jobs}
      </main>

      {/* Sidebar */}
      <aside className="hidden lg:block lg:col-span-3 order-3 h-full">
        <div className="sticky top-24">
          {sidebar}
        </div>
      </aside>
    </div>
  );
}
