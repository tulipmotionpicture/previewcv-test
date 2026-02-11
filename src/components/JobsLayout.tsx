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
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-3 pb-8">
      {/* Filters */}
      <aside className="md:col-span-1 lg:col-span-3 order-1 h-full">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          {filters}
        </div>
      </aside>

      {/* Job Listings */}
      <main className="md:col-span-2 lg:col-span-6 order-3 md:order-2">
        {jobs}
      </main>

      {/* Sidebar */}
      <aside className="md:col-span-1 lg:col-span-3 order-2 md:order-3 h-full">
        <div className="sticky top-24">
          {sidebar}
        </div>
      </aside>
    </div>
  );
}
