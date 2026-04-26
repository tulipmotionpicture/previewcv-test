"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Job } from "@/types/api";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date?: string;
  images?: { image_url: string }[];
}

interface RecruiterProfilePublicProps {
  jobs?: Job[];
  events?: Event[];
}

export default function RecruiterProfilePublic({
  jobs = [],
  events = [],
}: RecruiterProfilePublicProps) {
  const [activeTab, setActiveTab] = useState<"jobs" | "events">("jobs");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const hasJobs = Array.isArray(jobs) && jobs.length > 0;
  const hasEvents = Array.isArray(events) && events.length > 0;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-4 px-1 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "jobs"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Open Positions ({jobs.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-4 px-1 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "events"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events & Happenings ({events.length})
            </div>
          </button>
        </div>

        {/* Jobs Tab Content */}
        {activeTab === "jobs" && (
          <>
            {hasJobs ? (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h3>
                        {job.company_name && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {job.company_name}
                          </p>
                        )}
                      </div>
                      {job.salary_min && job.salary_max && (
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            ${job.salary_min.toLocaleString()} - $
                            {job.salary_max.toLocaleString()}
                          </p>
                          {job.salary_currency && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {job.salary_currency}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                      )}
                      {job.job_type && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.job_type.replace("_", " ")}
                        </div>
                      )}
                      {job.posted_date && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(job.posted_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.required_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                            +{job.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No open positions at the moment
                </p>
              </div>
            )}
          </>
        )}

        {/* Events Tab Content - Timeline Grid */}
        {activeTab === "events" && (
          <>
            {hasEvents ? (
              <div>
                {/* Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events
                    .sort((a, b) => {
                      if (!a.event_date || !b.event_date) return 0;
                      return (
                        new Date(a.event_date).getTime() -
                        new Date(b.event_date).getTime()
                      );
                    })
                    .map((event, index) => {
                      const eventDate = event.event_date
                        ? new Date(event.event_date)
                        : null;
                      const isUpcoming = eventDate && eventDate > new Date();

                      return (
                        <div
                          key={event.id}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 h-full"
                        >
                          {/* Featured Image */}
                          {event.images && event.images.length > 0 ? (
                            <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                              <img
                                src={event.images[0].image_url}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                              {/* Date Badge - Top Right */}
                              {eventDate && (
                                <div className="absolute top-3 right-3">
                                  <div className="flex flex-col items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20">
                                    <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                      {eventDate.toLocaleDateString("en-US", {
                                        month: "short",
                                      })}
                                    </span>
                                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                                      {eventDate.getDate()}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Upcoming Badge */}
                              {isUpcoming && (
                                <div className="absolute top-3 left-3">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    Upcoming
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                              <Calendar className="w-12 h-12 text-blue-400 dark:text-blue-500" />

                              {/* Date Badge */}
                              {eventDate && (
                                <div className="absolute top-3 right-3">
                                  <div className="flex flex-col items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20">
                                    <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                      {eventDate.toLocaleDateString("en-US", {
                                        month: "short",
                                      })}
                                    </span>
                                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                                      {eventDate.getDate()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex flex-col flex-grow p-5">
                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {event.title}
                            </h3>

                            {/* Date Display (text format) */}
                            {eventDate && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  {eventDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {event.description && (
                              <div
                                className="prose dark:prose-invert prose-sm prose-compact max-w-none text-gray-600 dark:text-gray-400 line-clamp-3 text-xs sm:text-sm flex-grow mb-4
                                           prose-p:m-0 prose-p:mb-1 prose-headings:text-sm prose-headings:mb-1 prose-headings:mt-0
                                           prose-ul:my-1 prose-ol:my-1 prose-li:m-0 prose-a:text-blue-600 dark:prose-a:text-blue-400"
                                dangerouslySetInnerHTML={{
                                  __html: event.description,
                                }}
                              />
                            )}

                            {/* Additional Images Indicator */}
                            {event.images && event.images.length > 1 && (
                              <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm14-2H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
                                </svg>
                                <span>
                                  {event.images.length} photo
                                  {event.images.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Hover Action Indicator */}
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setImageIndex(0);
                            }}
                            className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span>View Event Details</span>
                            <svg
                              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  No upcoming events at the moment
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Check back soon for exciting opportunities!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Details Modal - Full Screen */}
      {selectedEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <div className="relative w-full max-w-7xl  flex flex-col rounded-2xl overflow-hidden  max-h-[90vh] bg-white dark:bg-gray-900">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 md:p-8 lg:p-10 space-y-8">
                {/* Image Section */}
                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                      <img
                        src={selectedEvent.images[imageIndex].image_url}
                        alt=""
                        className="w-full h-64 md:h-96 object-contain group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Navigation Buttons */}
                      {selectedEvent.images &&
                        selectedEvent.images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setImageIndex((prev) => Math.max(prev - 1, 0))
                              }
                              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black backdrop-blur-sm border border-gray-300 dark:border-gray-700 transition-all hover:scale-110 text-gray-900 dark:text-white font-bold text-lg shadow-lg"
                            >
                              ‹
                            </button>

                            <button
                              onClick={() =>
                                setImageIndex((prev) =>
                                  Math.min(
                                    prev + 1,
                                    (selectedEvent.images?.length ?? 1) - 1,
                                  ),
                                )
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black backdrop-blur-sm border border-gray-300 dark:border-gray-700 transition-all hover:scale-110 text-gray-900 dark:text-white font-bold text-lg shadow-lg"
                            >
                              ›
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 dark:bg-white/10 backdrop-blur-sm rounded-full text-white dark:text-gray-200 text-xs font-bold border border-white/20">
                              {imageIndex + 1} / {selectedEvent.images?.length}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {selectedEvent.images &&
                      selectedEvent.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {selectedEvent.images?.map(
                            (img: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setImageIndex(idx)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  imageIndex === idx
                                    ? "border-blue-500 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50"
                                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                                }`}
                              >
                                <img
                                  src={img.image_url}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                              </button>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* Info Section */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                      {selectedEvent.title}
                    </h1>

                    {/* Date Badge */}
                    {selectedEvent.event_date && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/50 rounded-lg w-fit">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wide font-semibold">
                            Event Date
                          </p>
                          <p className="text-sm text-blue-900 dark:text-blue-100 font-bold">
                            {new Date(
                              selectedEvent.event_date,
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedEvent.description && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400 mb-4">
                        About Event
                      </h2>
                      <div
                        className="prose dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed
                                   prose-p:mb-3 prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                                   prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:text-gray-700 dark:prose-li:text-gray-300
                                   prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline prose-a:font-semibold
                                   prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                                   prose-em:text-gray-600 dark:prose-em:text-gray-200"
                        dangerouslySetInnerHTML={{
                          __html: selectedEvent.description,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
