"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Job } from "@/types/api";
import { useToast } from "@/context/ToastContext";
import {
  X,
  Share2,
  Briefcase,
  MapPin,
  BadgeCheck,
  ExternalLink,
  Pencil,
  FileText,
  Mail,
  Link as LinkIcon,
  Copy,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Brand glyphs (SVG only — no emojis). White glyph on a colored disc. */
/* ------------------------------------------------------------------ */
const LinkedInGlyph = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5" aria-hidden>
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
  </svg>
);
const FacebookGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
  </svg>
);
const WhatsAppGlyph = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5" aria-hidden>
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.245.08.38-.058 1.17-.48 1.337-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
  </svg>
);
const TelegramGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
  </svg>
);
const XGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933zm-1.291 19.493h2.039L6.486 3.24H4.298l13.312 17.406z" />
  </svg>
);

type Platform = {
  key: string;
  label: string;
  bg: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export default function ShareJobModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const toast = useToast();

  const jobUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/job/${job.slug}`
      : `/job/${job.slug}`;

  const jobTypeLabel = (job.job_type || "")
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const locationLabel = job.is_remote
    ? "Remote"
    : job.location || "Location TBA";

  const buildDefaultCaption = () => {
    const where = job.is_remote
      ? " (remote-friendly)"
      : job.location
        ? ` in ${job.location}`
        : "";
    return [
      "We're hiring!",
      `${job.company_name} is looking for a ${job.title} to join our team${where}.`,
      "If you're driven and ready to grow your career, we'd love to hear from you.",
      "Apply now and be part of our success.",
      "View Job: {job_link}",
    ].join("\n");
  };

  const [caption, setCaption] = useState(buildDefaultCaption);
  const [editing, setEditing] = useState(false);

  // {job_link} is shown literally in the editor but resolved on share/copy.
  const resolvedCaption = caption.split("{job_link}").join(jobUrl);

  const popup = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer,width=820,height=720");
  const enc = encodeURIComponent;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error("Couldn't copy — please try again.");
    }
  };

  const platforms: Platform[] = [
    {
      key: "linkedin",
      label: "LinkedIn",
      bg: "#0A66C2",
      icon: <LinkedInGlyph />,
      onClick: () =>
        popup(
          `https://www.linkedin.com/sharing/share-offsite/?url=${enc(jobUrl)}`,
        ),
    },
    {
      key: "facebook",
      label: "Facebook",
      bg: "#1877F2",
      icon: <FacebookGlyph />,
      onClick: () =>
        popup(
          `https://www.facebook.com/sharer/sharer.php?u=${enc(jobUrl)}&quote=${enc(resolvedCaption)}`,
        ),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      bg: "#25D366",
      icon: <WhatsAppGlyph />,
      onClick: () => popup(`https://wa.me/?text=${enc(resolvedCaption)}`),
    },
    {
      key: "telegram",
      label: "Telegram",
      bg: "#229ED9",
      icon: <TelegramGlyph />,
      onClick: () =>
        popup(
          `https://t.me/share/url?url=${enc(jobUrl)}&text=${enc(resolvedCaption)}`,
        ),
    },
    {
      key: "x",
      label: "X (Twitter)",
      bg: "#000000",
      icon: <XGlyph />,
      onClick: () =>
        popup(`https://twitter.com/intent/tweet?text=${enc(resolvedCaption)}`),
    },
    {
      key: "email",
      label: "Email",
      bg: "#7C3AED",
      icon: <Mail className="w-5 h-5" />,
      onClick: () => {
        window.location.href = `mailto:?subject=${enc(
          `${job.title} at ${job.company_name}`,
        )}&body=${enc(resolvedCaption)}`;
      },
    },
    {
      key: "copy",
      label: "Copy Link",
      bg: "#6B7280",
      icon: <LinkIcon className="w-5 h-5" />,
      onClick: () => copy(jobUrl, "Job link"),
    },
  ];

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl relative flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Share This Job
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reach more candidates by sharing on your favorite platforms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Job card */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#1A1A1A] p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {job.title}
              </h4>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-blue dark:text-blue-400">
                <span className="truncate">{job.company_name}</span>
                <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {locationLabel}
                </span>
                {jobTypeLabel && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {jobTypeLabel}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => popup(jobUrl)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-blue dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors shrink-0"
            >
              View Job <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Social platforms */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-base font-bold text-gray-900 dark:text-white">
                Share on Social Media
              </h5>
              <span className="text-xs text-gray-400">
                Share across your network
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={p.onClick}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
                >
                  <span
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: p.bg }}
                  >
                    {p.icon}
                  </span>
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 text-center">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content to share */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Content to Share
              </h5>
              <button
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-blue dark:text-blue-400 hover:underline"
              >
                {editing ? "Done editing" : "Customize your message (optional)"}
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            {editing ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {caption}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => copy(resolvedCaption, "Caption")}
            className="flex flex-1 items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-[#282727] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy Caption
          </button>
          <button
            onClick={() => copy(jobUrl, "Job link")}
            className="flex flex-1 items-center justify-center gap-2 px-5 py-3 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-xl transition-all font-semibold text-sm shadow-sm"
          >
            <LinkIcon className="w-4 h-4" />
            Copy Job Link
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
