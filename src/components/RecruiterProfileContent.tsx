"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import JobList from "./JobList";
import ImageGalleryModal from "./ImageGalleryModal";
import MaximizableModal from "./common/MaximizableModal";
import { Job } from "@/types/api";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date?: string | null;
  is_featured?: boolean;
  images?: {
    image_url: string;
    caption?: string | null;
    display_order?: number;
  }[];
}

interface RecruiterContentProps {
  jobs: Job[];
  events: Event[];
}

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
  onReadMore,
}: {
  event: Event;
  onOpenGallery: (images: string[], index: number) => void;
  onReadMore: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = event.images?.map((img) => img.image_url) || [];
  const hasMultipleImages = images.length > 1;

  // Basic HTML stripping for card preview snippet
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
      onClick={onReadMore}
    >
      {event.is_featured && (
        <div className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-md z-20" title="Featured Event">
          <Star className="w-4 h-4 fill-yellow-900" />
        </div>
      )}

      {/* Image Carousel */}
      {images.length > 0 ? (
        <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 group/image">
          <Image
            src={images[currentImageIndex]}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover/image:scale-105"
          />

          {/* Carousel Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 w-full px-4 overflow-x-auto no-scrollbar">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`flex-shrink-0 rounded-full transition-all shadow-sm ${idx === currentImageIndex
                    ? "bg-primary-blue w-4 h-2"
                    : "bg-white/80 hover:bg-white w-2 h-2"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 mb-4 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
          <span className="text-gray-400 font-medium text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> No Image
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-primary-blue transition-colors line-clamp-2 mb-2">
          {event.title}
        </h3>

        {event.event_date && (
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.event_date)}
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {stripHtml(event.description)}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800/50">
          <span className="text-sm font-semibold text-primary-blue hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
            Read more &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

function EventDetailModal({
  event,
  isOpen,
  onClose,
}: {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setIsMaximized(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const images = event.images?.map((img) => img.image_url) || [];
  const hasMultipleImages = images.length > 1;

  return (
    <MaximizableModal
      isOpen={isOpen}
      onClose={onClose}
      isMaximized={isMaximized}
      setIsMaximized={setIsMaximized}
      maxWidthClass="max-w-7xl"
      title={<span className="line-clamp-1">{event.title}</span>}
    >
      <div className="flex flex-col h-full space-y-6 pt-2">


        {images.length > 0 && (
          <div className={`relative w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group shrink-0 transition-all duration-300 h-62`}>
            <Image
              src={images[currentImageIndex]}
              alt={`${event.title} image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % images.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 w-full px-4 overflow-x-auto no-scrollbar">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`flex-shrink-0 rounded-full transition-all shadow-sm ${idx === currentImageIndex
                        ? "bg-primary-blue w-6 h-2"
                        : "bg-white/80 hover:bg-white w-2 h-2"
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div
          className="prose dark:prose-invert max-w-none prose-sm sm:prose-base focus:outline-none 
                     prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      </div>
    </MaximizableModal>
  );
}

export default function RecruiterProfileContent({
  jobs,
  events,
}: RecruiterContentProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
                  Events
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
                    onReadMore={() => setSelectedEvent(event)}
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
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                <JobList jobs={jobs} />
              </div>
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

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
