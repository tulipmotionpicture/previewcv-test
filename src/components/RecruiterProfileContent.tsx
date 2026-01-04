"use client";

import { useState } from "react";
import Image from "next/image";
import JobList from "./JobList";
import ImageGalleryModal from "./ImageGalleryModal";
import { Job } from "@/types/api";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date?: string;
  images?: { image_url: string }[];
}

interface RecruiterContentProps {
  jobs: Job[];
  events: Event[];
}

type TabType = "jobs" | "events";

// Consistent date formatting to avoid hydration errors
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function RecruiterProfileContent({
  jobs,
  events,
}: RecruiterContentProps) {
  // Set default tab based on what's available (prioritize jobs)
  const hasJobs = Array.isArray(jobs) && jobs.length > 0;
  const hasEvents = Array.isArray(events) && events.length > 0;
  const defaultTab = hasJobs ? "jobs" : "events";
  
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const openGallery = (images: string[], startIndex: number = 0) => {
    setGalleryImages(images);
    setGalleryStartIndex(startIndex);
    setIsGalleryOpen(true);
  };

  // If neither jobs nor events exist, don't render anything
  if (!hasJobs && !hasEvents) {
    return null;
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 mb-2">
            {hasJobs && hasEvents ? "Opportunities & Events" : hasJobs ? "Open Positions" : "Company Events"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            {hasJobs && hasEvents 
              ? "Explore our latest job openings and upcoming events"
              : hasJobs 
              ? "Join our team and grow your career"
              : "Stay updated with our latest activities"}
          </p>
        </div>

        {/* Tab Switcher - Only show if both exist */}
        {hasJobs && hasEvents && (
          <div className="mb-8 flex justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-1.5 inline-flex gap-1 shadow-lg border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`relative px-6 md:px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
                  activeTab === "jobs"
                    ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Job Openings
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === "jobs" 
                      ? "bg-white/20" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {jobs.length}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`relative px-6 md:px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
                  activeTab === "events"
                    ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Events
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === "events" 
                      ? "bg-white/20" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {events.length}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "jobs" && hasJobs && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JobList jobs={jobs} />
          </div>
        )}

        {activeTab === "events" && hasEvents && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event: Event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
                >
                  {/* Event Images */}
                  {Array.isArray(event.images) && event.images.length > 0 && (
                    <button
                      onClick={() => openGallery(event.images!.map(img => img.image_url), 0)}
                      className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden w-full cursor-pointer group/gallery"
                    >
                      <div className="flex gap-1 h-full">
                        {event.images.slice(0, 3).map((data, idx: number) => (
                          <div key={idx} className="flex-1 relative">
                            <Image
                              src={data.image_url}
                              alt={`${event.title} - Image ${idx + 1}`}
                              fill
                              className="object-cover group-hover/gallery:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover/gallery:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          View {event.images.length} {event.images.length === 1 ? 'image' : 'images'}
                        </div>
                      </div>
                      
                      {event.images.length > 3 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                          +{event.images.length - 3} more
                        </div>
                      )}
                    </button>
                  )}

                  <div className="p-6">
                    {/* Event Date Badge */}
                    {event.event_date && (
                      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(event.event_date)}
                      </div>
                    )}

                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>

                    {/* Event Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={galleryStartIndex}
      />
    </div>
  );
}
