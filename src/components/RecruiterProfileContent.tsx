"use client";

import { useState } from "react";
import Image from "next/image";
import JobList from "./JobList";
import ImageGalleryModal from "./ImageGalleryModal";
import { Job } from "@/types/api";
import { Heart } from "lucide-react";

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

function EventCard({
  event,
  onOpenGallery,
}: {
  event: Event;
  onOpenGallery: (images: string[], index: number) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = event.images?.map((img) => img.image_url) || [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 hover:shadow-md transition-shadow duration-300 group">
      {/* Image Carousel */}
      {images.length > 0 ? (
        <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2.5 group/image">
          <Image
            src={images[currentImageIndex]}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover/image:scale-105 cursor-pointer"
            onClick={() => onOpenGallery(images, currentImageIndex)}
          />

          {/* Favorite Button Overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400"}`}
            />

          </button>

          {/* Carousel Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentImageIndex
                    ? "bg-primary-blue w-4"
                    : "bg-white/80 hover:bg-white"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 flex items-center justify-center">
          <span className="text-gray-400 font-medium">No Image</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-primary-blue transition-colors line-clamp-1">
          {event.title}
        </h3>

        {event.event_date && (
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {formatDate(event.event_date)}
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
          {event.description}
        </p>
      </div>
    </div>
  );
}

export default function RecruiterProfileContent({
  jobs,
  events,
}: RecruiterContentProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const hasJobs = Array.isArray(jobs) && jobs.length > 0;
  const hasEvents = Array.isArray(events) && events.length > 0;

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
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
            Opportunities & Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Explore our latest job openings and upcoming events
          </p>
        </div>

        <div className={`grid grid-cols-1 ${hasJobs && hasEvents ? 'lg:grid-cols-2' : ''} gap-6 items-start`}>
          {/* Events Column */}
          {hasEvents && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Upcoming Events
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {events.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map((event: Event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onOpenGallery={openGallery}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Jobs Column */}
          {hasJobs && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Job Openings
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              </div>
              <JobList jobs={jobs} />
            </div>
          )}
        </div>
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
