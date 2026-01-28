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
    <div className="w-full min-h-screen flex justify-center px-2 md:px-4 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 pb-8">
        {/* Filters */}
        <aside className="md:col-span-1 lg:col-span-3 order-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-4 sticky top-24 border border-gray-100 dark:border-gray-800 max-h-[calc(100vh-7rem)] overflow-y-auto">
            {filters}
          </div>
        </aside>

        {/* Job Listings */}
        <main className="md:col-span-2 lg:col-span-6 order-3 md:order-2">
          {jobs}
        </main>

        {/* Sidebar */}
        <aside className="md:col-span-1 lg:col-span-3 order-2 md:order-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 sticky top-24 border border-gray-100 dark:border-gray-800">
            {sidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}
