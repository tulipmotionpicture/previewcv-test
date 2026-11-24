"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MOBILE_APPS, MobileAppId } from "@/lib/mobileApps";
import AppQr from "./AppQr";
import StoreBadges from "./StoreBadges";

const TEXT: Record<MobileAppId, string> = {
  previewcv: "Screen applicants, search CVs and hire with your team, from your phone.",
  letsmakecv: "Find jobs, apply and follow your applications. Same login as PreviewCV.",
};

interface AppPromoCardProps {
  app: MobileAppId;
  from: string;
  className?: string;
}

/** Dashboard card. Closing it is remembered on this browser. */
export default function AppPromoCard({ app, from, className = "" }: AppPromoCardProps) {
  const key = `app-promo-closed:${app}`;
  // Hidden until the browser says it wasn't closed, so a closed card never flashes.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(key) === null);
    } catch {
      setOpen(true);
    }
  }, [key]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: closed for this visit only.
    }
  };

  return (
    <div className={`relative flex items-center gap-4 rounded-xl border border-[#E1E8F1] bg-white p-4 dark:border-gray-700 dark:bg-[#282727] ${className}`}>
      <AppQr app={app} from={from} size={96} className="border border-gray-200 dark:border-transparent" />
      <div className="min-w-0 pr-6">
        <div className="mb-1 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOBILE_APPS[app].icon} alt="" width={24} height={24} className="rounded-md" />
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {MOBILE_APPS[app].name} app
          </p>
        </div>
        <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          {TEXT[app]} <span className="hidden md:inline">Scan to install on iPhone or Android.</span>
        </p>
        <StoreBadges app={app} from={from} />
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute right-2 top-2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
