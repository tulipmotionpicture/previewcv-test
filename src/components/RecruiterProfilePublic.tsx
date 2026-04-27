"use client";

import { useState } from "react";
import {
  Building2,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Github,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Tag,
  Image as ImageIcon,
  Save,
  Lock,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  LayoutDashboard,
  Camera,
  ShieldCheck,
  User,
} from "lucide-react";
import { RecruiterProfile, CompanyEvent } from "@/types";
import { Job } from "@/types/api";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

type TabType = "profile" | "culture" | "events" | "security";
type ViewType = "admin" | "public";

interface RecruiterProfilePublicProps {
  profile: RecruiterProfile;
  onBack?: () => void;
}

export default function RecruiterProfilePublic({
  profile,
  onBack,
}: RecruiterProfilePublicProps) {
  // Guard against undefined profile
  const [activeTab, setActiveTab] = useState("about");
  if (!profile) {
    return <div className="text-center py-12">No profile data available</div>;
  }

  const tabs = [
    { id: "about", label: "About" },
    { id: "positions", label: "Open Positions" },
    { id: "events", label: "Events & Happenis" },
  ];

  return (
    <div className="min-h-screen mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-8">
              {profile.company_logo_url && (
                <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                  <img
                    src={profile.company_logo_url}
                    className="w-full h-full object-contain rounded-xl"
                    alt="Company Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                      {profile.company_name ||
                        profile.display_name ||
                        profile.full_name ||
                        "Recruiter Profile"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                      {profile.specialization ||
                        `${profile.years_experience || 0}+ years experience`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Industry
                  </p>
                  <p className="text-sm font-bold">
                    {profile.industry || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Company Size
                  </p>
                  <p className="text-sm font-bold">
                    {profile.company_size || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </p>
                  <p className="text-sm font-bold">
                    {profile.location || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Website
                  </p>
                  {profile.company_website ? (
                    <a
                      href={profile.company_website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      Visit Site
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-slate-400">
                      Not available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "about" && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  About{" "}
                  {profile.company_name || profile.display_name || "Recruiter"}
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  {profile.bio ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: profile.bio }}
                      className="[&_p]:mb-4 [&_p]:text-slate-600 [&_strong]:font-bold [&_em]:italic"
                    />
                  ) : (
                    <p>No description provided</p>
                  )}
                </div>

                {profile.specialization && (
                  <div className="mt-12">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                      Specialization
                    </h3>
                    <span className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium border border-slate-100 inline-block">
                      {profile.specialization}
                    </span>
                  </div>
                )}

                {profile.years_experience && (
                  <div className="mt-12">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                      Experience
                    </h3>
                    <p className="text-slate-700 font-medium">
                      {profile.years_experience}+ years in recruitment
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "positions" && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Open Positions
                </h2>
                {profile.recent_jobs && profile.recent_jobs.length > 0 ? (
                  <div className="space-y-4">
                    {profile.recent_jobs.map((job) => (
                      <article
                        key={job.id}
                        className="group p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                      >
                        <header className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.is_remote
                                  ? "Remote"
                                  : job.location || "Location TBA"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {job.job_type
                                  .split("_")
                                  .map(
                                    (w: string) =>
                                      w.charAt(0).toUpperCase() + w.slice(1),
                                  )
                                  .join(" ")}
                              </span>
                              {job.experience_level && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {job.experience_level
                                    .charAt(0)
                                    .toUpperCase() +
                                    job.experience_level.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <a
                            href={`/jobs/${job.slug}`}
                            className="text-blue-600 font-bold text-sm hover:underline whitespace-nowrap ml-4"
                          >
                            View Details
                          </a>
                        </header>

                        {job.description && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        <footer className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4 text-xs">
                            {job.salary_min && job.salary_max && (
                              <span className="font-bold text-slate-700">
                                ${job.salary_min.toLocaleString()} - $
                                {job.salary_max.toLocaleString()}
                                {job.salary_currency
                                  ? ` ${job.salary_currency}`
                                  : ""}
                              </span>
                            )}
                            {job.required_skills &&
                              job.required_skills.length > 0 && (
                                <span className="font-bold text-slate-400">
                                  {job.required_skills.length} skills required
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <span>{job.application_count} applications</span>
                            <span>{job.view_count} views</span>
                            <time dateTime={job.posted_date}>
                              Posted{" "}
                              {new Date(job.posted_date).toLocaleDateString()}
                            </time>
                          </div>
                        </footer>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No open positions at this time.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Upcoming Events
                </h2>
                {profile.events && profile.events.length > 0 ? (
                  <div className="space-y-6">
                    {profile.events.map((event) => {
                      const eventDate = event.event_date || event.date;
                      const dateObj = eventDate ? new Date(eventDate) : null;
                      return (
                        <article
                          key={event.id}
                          className="flex gap-6 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all"
                        >
                          {dateObj && (
                            <time
                              dateTime={eventDate}
                              className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm"
                            >
                              <span className="text-[10px] font-bold uppercase opacity-70">
                                {dateObj.toLocaleString("default", {
                                  month: "short",
                                })}
                              </span>
                              <span className="text-2xl font-bold">
                                {dateObj.getDate()}
                              </span>
                            </time>
                          )}
                          <div className="flex-1 min-w-0">
                            {event.type && (
                              <span className="inline-block mb-2 bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {event.type}
                              </span>
                            )}
                            <h4 className="text-lg font-bold text-slate-900 mb-2">
                              {event.title}
                            </h4>
                            {event.description && (
                              <div
                                className="text-sm text-slate-600 mb-4 leading-relaxed [&_p]:mb-2 [&_p]:text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: event.description,
                                }}
                              />
                            )}
                            {event.images && event.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {event.images.map((img) => (
                                  <div
                                    key={img.id}
                                    className="relative rounded-lg overflow-hidden"
                                  >
                                    <img
                                      src={img.image_url}
                                      alt={img.caption || "Event image"}
                                      className="w-full h-32 object-cover rounded-lg"
                                      referrerPolicy="no-referrer"
                                    />
                                    {img.caption && (
                                      <p className="text-[10px] font-bold text-slate-500 mt-1">
                                        {img.caption}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <footer className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                              {dateObj && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {dateObj.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </footer>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No upcoming events scheduled.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Company Gallery
                </h2>
                {profile.gallery?.images &&
                profile.gallery.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.gallery.images.map((img, i) => (
                      <div
                        key={i}
                        className="group relative aspect-video rounded-2xl overflow-hidden shadow-sm"
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={`Gallery image ${i + 1}`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No gallery images available.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-8">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                Recruiter Info
              </h3>
              <div className="space-y-6">
                {profile.created_at && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      Founded
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      Headquarter
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {profile.location}
                    </p>
                  </div>
                )}

                {profile.industry && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      Industry
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {profile.industry}
                    </p>
                  </div>
                )}
                {profile.is_verified && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700">
                      Verified Recruiter
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Online Presence */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                Online Presence
              </h3>
              <div className="flex flex-col gap-4">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
