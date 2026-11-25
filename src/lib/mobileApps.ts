// The two mobile apps and how the website links to them: LetsMakeCV (candidates) and
// PreviewCV (recruiters). QR codes are static files made by scripts/app-qr.mjs.

export type MobileAppId = "letsmakecv" | "previewcv";
export type Store = "appstore" | "play";

interface MobileApp {
  name: string;
  /** Short link in the QR codes: phones go to their own store, others see the app's page. */
  link: string;
  play: string;
  appStoreId: string;
  icon: string;
  screenshots: { src: string; alt: string }[];
}

const IMAGES = "/images/mobile-app";

export const MOBILE_APPS: Record<MobileAppId, MobileApp> = {
  letsmakecv: {
    name: "LetsMakeCV",
    link: "https://letsmakecv.com/app",
    play: "https://play.google.com/store/apps/details?id=com.letsmakecv.app",
    appStoreId: "6821516054",
    icon: `${IMAGES}/letsmakecv-icon.webp`,
    screenshots: [
      { src: `${IMAGES}/letsmakecv-1.webp`, alt: "LetsMakeCV app: your job search at a glance" },
      { src: `${IMAGES}/letsmakecv-2.webp`, alt: "LetsMakeCV app: professional resume templates" },
    ],
  },
  previewcv: {
    name: "PreviewCV for Recruiters",
    link: "https://previewcv.com/app",
    play: "https://play.google.com/store/apps/details?id=com.previewcv.app",
    appStoreId: "6824173660",
    icon: `${IMAGES}/previewcv-icon.webp`,
    screenshots: [
      { src: `${IMAGES}/previewcv-1.webp`, alt: "PreviewCV app: screen applicants with a swipe" },
      { src: `${IMAGES}/previewcv-2.webp`, alt: "PreviewCV app: search the talent pool" },
    ],
  },
};

export const qrSrc = (app: MobileAppId, from: string) => `${IMAGES}/${app}-qr-${from}.svg`;

export const appLink = (app: MobileAppId, from: string) =>
  `${MOBILE_APPS[app].link}?from=${from}`;

/** Store link. Google Play reports `from` (where on the site) with the install; the App Store
 *  has no equivalent without a provider token from App Store Connect. */
export function storeUrl(app: MobileAppId, store: Store, from: string): string {
  if (store === "appstore") return `https://apps.apple.com/app/id${MOBILE_APPS[app].appStoreId}`;
  const referrer = `utm_source=website&utm_campaign=${from}`;
  return `${MOBILE_APPS[app].play}&referrer=${encodeURIComponent(referrer)}`;
}

// Search engines, link previews and testing tools must get the page, not a redirect. They
// often claim to be a phone.
const ROBOT =
  /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|whatsapp\/|preview|lighthouse|pagespeed|inspectiontool|headless|embedly|curl|wget/i;

/** Which store a phone uses, or null for anything that isn't clearly a phone with a store
 *  (computers, iPads, Amazon and Huawei devices without Google Play, robots). */
export function phoneStore(userAgent: string | null | undefined): Store | null {
  // Cubot is an Android phone brand, not a robot. (No regex lookbehind: older iPhones
  // can't parse it.)
  const ua = (userAgent || "").replace(/cubot/gi, "");
  if (ROBOT.test(ua)) return null;
  if (/windows phone/i.test(ua)) return null;
  if (/iphone|ipod/i.test(ua)) return "appstore";
  if (/android/i.test(ua) && !/silk|hmscore|harmonyos|android tv|googletv/i.test(ua)) return "play";
  return null;
}

/** `from` as written in our own links; anything else is dropped. */
export const cleanFrom = (value: unknown): string =>
  typeof value === "string" && /^[a-z0-9-]{1,40}$/.test(value) ? value : "link";
