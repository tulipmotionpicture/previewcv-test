"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { MOBILE_APPS, MobileAppId, Store, phoneStore, storeUrl } from "@/lib/mobileApps";

/** Days the bar stays away after it is closed; 0 = for the rest of this visit only.
 *  Agreed with the owner: becomes 30 from 5 December 2026. */
const CLOSED_DAYS = 0;
const INSTALL_TAPPED_DAYS = 90;
const KEY = "app-bar-hidden";

const TEXT: Record<MobileAppId, { name: string; text: string }> = {
  letsmakecv: { name: "LetsMakeCV app", text: "Find & apply to jobs" },
  previewcv: { name: "PreviewCV app", text: "Screen applicants anywhere" },
};

// What follows /recruiter/ when it isn't a company's public page.
const NOT_A_COMPANY =
  /^\/recruiter\/(login|signup|dashboard|auth|billing|team|confirm-password|password-reset)$/;

const isJobPage = (path: string) => /^\/job\/[^/]+$/.test(path);

/** The app a page is about. None: no bar there (sign-in, sign-up, shared resumes, ...). */
function pageApp(path: string): MobileAppId | null {
  if (/^\/(recruiter|pricing|recruiter\/dashboard)$/.test(path)) return "previewcv";
  if (/^\/recruiter\/[^/]+$/.test(path)) return NOT_A_COMPANY.test(path) ? null : "letsmakecv";
  if (/^\/($|jobs(\/|$)|blog(\/|$)|candidate$|candidate\/dashboard$)/.test(path) || isJobPage(path))
    return "letsmakecv";
  return null;
}

/** Whoever is signed in decides which app; the page decides for everyone else. The recruiter
 *  app needs an approved company (KYC). */
function barApp(path: string, recruiterKyc: string | null, isCandidate: boolean): MobileAppId | null {
  const forPage = pageApp(path);
  if (!forPage) return null;
  if (recruiterKyc !== null) return recruiterKyc === "approved" ? "previewcv" : null;
  if (isCandidate) return "letsmakecv";
  return path === "/recruiter/dashboard" ? null : forPage;
}

/** Safari shows Apple's own app bar (the meta tag below) instead of ours. */
const isIosSafari = (ua: string) =>
  /version\/[\d.]+.*safari\//i.test(ua) &&
  !/crios|fxios|edgios|gsa\/|opt\/|opios|duckduckgo|ddg\/|yabrowser|ucbrowser|instagram|fban|fbav|line\//i.test(ua);

function barStore(): Store | null {
  const ua = navigator.userAgent;
  const store = phoneStore(ua);
  if (store === "appstore" && isIosSafari(ua)) return null;
  if (store === "play" && !/mobile/i.test(ua)) return null; // tablets
  return store;
}

function isHidden(): boolean {
  try {
    return (
      sessionStorage.getItem(KEY) !== null ||
      Number(localStorage.getItem(KEY)) > Date.now()
    );
  } catch {
    return false;
  }
}

function hideFor(days: number) {
  try {
    sessionStorage.setItem(KEY, "1");
    if (days > 0) localStorage.setItem(KEY, String(Date.now() + days * 86_400_000));
  } catch {
    // Storage blocked: hidden until the page is reloaded.
  }
}

const track = (event: string, params: Record<string, string>) =>
  (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.("event", event, {
    placement: "bar",
    ...params,
  });

/** Small "get the app" bar at the bottom of the screen, on phones only. A bar rather than a
 *  pop-up: Google ranks pages lower on phones when a pop-up covers them. Dialogs cover it;
 *  globals.css hides it while the visitor is typing or on a form (data-hides-app-bar). */
export default function AppInstallBar() {
  const pathname = usePathname() || "/";
  const { isAuthenticated: isCandidate, loading: candidateLoading } = useAuth();
  const { recruiter, loading: recruiterLoading } = useRecruiterAuth();
  const [store, setStore] = useState<Store | null>(null);
  // Pages the bar may show on by now: any page after a few seconds or a little scrolling,
  // a job page only once half of it has been read (applying comes first there).
  const [ready, setReady] = useState(false);
  const [readJob, setReadJob] = useState("");

  useEffect(() => {
    if (window.self === window.top && !isHidden()) setStore(barStore());
  }, []);

  const jobPage = isJobPage(pathname);
  useEffect(() => {
    if (!store || (!jobPage && ready)) return;
    const onScroll = () => {
      if (window.scrollY < 300) return;
      if (!jobPage) setReady(true);
      else if (window.scrollY + window.innerHeight > document.documentElement.scrollHeight / 2)
        setReadJob(pathname);
    };
    const timer = jobPage ? undefined : setTimeout(() => setReady(true), 4000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [store, jobPage, ready, pathname]);

  const forPage = pageApp(pathname);
  const app = barApp(pathname, recruiter?.kyc_status ?? null, isCandidate);

  const visible =
    store !== null &&
    app !== null &&
    !candidateLoading &&
    !recruiterLoading &&
    (jobPage ? readJob === pathname : ready);

  const [viewed, setViewed] = useState<MobileAppId | null>(null);
  useEffect(() => {
    if (!visible || !app || viewed === app) return;
    setViewed(app);
    track("app_bar_view", { app, store });
  }, [visible, app, viewed, store]);

  const hide = (event: string, days: number) => {
    if (app && store) track(event, { app, store });
    hideFor(days);
    setStore(null);
  };

  return (
    <>
      {/* Apple's app bar in Safari on iPhone ("Open" when installed). In the page's HTML, so it
          goes by the page, not by who is signed in. */}
      {forPage && pathname !== "/recruiter/dashboard" && (
        <meta name="apple-itunes-app" content={`app-id=${MOBILE_APPS[forPage].appStoreId}`} />
      )}
      {visible && app && store && (
        <>
          {/* Room at the end of the page, so the bar never covers the last lines. */}
          <div className="h-16 bg-gray-100 dark:bg-gray-900 md:hidden" />
          <div
            role="region"
            aria-label={TEXT[app].name}
            className="app-install-bar fixed inset-x-0 bottom-0 z-[35] border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex h-16 items-center gap-3 pl-3 pr-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MOBILE_APPS[app].icon} alt="" width={40} height={40} className="shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {TEXT[app].name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{TEXT[app].text}</p>
              </div>
              <a
                href={storeUrl(app, store, "bar")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => hide("app_store_click", INSTALL_TAPPED_DAYS)}
                className="shrink-0 rounded-full bg-primary-blue px-4 py-2 text-sm font-semibold text-white"
              >
                Install
              </a>
              <button
                type="button"
                onClick={() => hide("app_bar_close", CLOSED_DAYS)}
                aria-label="Close"
                className="flex h-11 w-9 shrink-0 items-center justify-center text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
