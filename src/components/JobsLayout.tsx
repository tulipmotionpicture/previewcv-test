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
    <div className="w-full min-h-screen bg-gray-50 flex justify-center px-2 md:px-4 lg:px-8 py-6">
      <div
        className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-2"
        style={{ height: "80vh" }}
      >
        {/* Filters */}
        <aside className="md:col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-md p-6 h-fit order-1 sticky top-24 self-start">
          {filters}
        </aside>
        {/* Job Listings (scrollable) */}
        <main
          className="md:col-span-2 lg:col-span-6 order-3 md:order-2  no-scrollbar"
          style={{ maxHeight: "76vh" }}
        >
          {jobs}
        </main>
        {/* Sidebar */}
        <aside className="md:col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-md p-6 h-fit order-2 md:order-3 sticky top-24 self-start">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
