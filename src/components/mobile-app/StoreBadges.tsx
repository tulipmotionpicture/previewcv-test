"use client";

import { useEffect, useState } from "react";
import { MOBILE_APPS, MobileAppId, Store, phoneStore, storeUrl } from "@/lib/mobileApps";

const BADGES: { store: Store; src: string; width: number; label: string }[] = [
  {
    store: "appstore",
    src: "/images/mobile-app/app-store-badge.svg",
    width: 120,
    label: "Download on the App Store",
  },
  {
    store: "play",
    src: "/images/mobile-app/google-play-badge.png",
    width: 134,
    label: "Get it on Google Play",
  },
];

interface StoreBadgesProps {
  app: MobileAppId;
  /** Where on the site, for install and click reports. */
  from: string;
  className?: string;
}

/** Official store badges (unaltered, 40px as Apple requires). On a phone only its own
 *  store is shown. */
export default function StoreBadges({ app, from, className = "" }: StoreBadgesProps) {
  const [phone, setPhone] = useState<Store | null>(null);
  useEffect(() => setPhone(phoneStore(navigator.userAgent)), []);

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {BADGES.filter((badge) => !phone || badge.store === phone).map((badge) => (
        <a
          key={badge.store}
          href={storeUrl(app, badge.store, from)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${MOBILE_APPS[app].name}: ${badge.label}`}
          className="shrink-0"
          onClick={() =>
            (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.(
              "event",
              "app_store_click",
              { app, store: badge.store, placement: from },
            )
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={badge.src} alt={badge.label} width={badge.width} height={40} loading="lazy" className="h-10 w-auto max-w-none" />
        </a>
      ))}
    </div>
  );
}
