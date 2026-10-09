// Browser push (Firebase Cloud Messaging) for candidates and recruiters.
//
// The Firebase SDK is imported lazily, only when push is actually used, so pages that
// never touch notifications (most public/SEO pages) don't download it.

import { api } from "@/lib/api";
import type { NotificationAccount } from "@/types/api";
import {
  FIREBASE_VAPID_KEY,
  FIREBASE_WEB_CONFIG,
  PUSH_DEVICE_CLIENT,
  PUSH_SW_PATH,
  PUSH_SW_SCOPE,
} from "./config";

export type PushPermission = "unsupported" | NotificationPermission;

// The token this browser registered for each account, so logout can unregister it.
const tokenKey = (account: NotificationAccount) => `push_device_token_${account}`;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked: unregister on logout simply won't happen */
  }
}

/** "unsupported" when the browser can't do web push (e.g. iOS Safari outside a Home Screen app). */
export function pushPermission(): PushPermission {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return "unsupported";
  }
  return Notification.permission;
}

async function activeRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(PUSH_SW_PATH, {
    scope: PUSH_SW_SCOPE,
  });
  // navigator.serviceWorker.ready would never resolve here (the worker's scope doesn't
  // cover the page), so wait for this registration's own worker to activate.
  const worker = registration.installing || registration.waiting;
  if (!registration.active && worker) {
    await new Promise<void>((resolve) => {
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") resolve();
      });
    });
  }
  return registration;
}

async function fcmToken(): Promise<string | null> {
  const [{ getApp, getApps, initializeApp }, messagingModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ]);
  if (!(await messagingModule.isSupported())) return null;
  const app = getApps().length ? getApp() : initializeApp(FIREBASE_WEB_CONFIG);
  return messagingModule.getToken(messagingModule.getMessaging(app), {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: await activeRegistration(),
  });
}

/**
 * Register this browser for the account's pushes. Only when permission is already
 * granted; never prompts. Safe to call on every sign-in: FCM returns the same token
 * until it rotates, and the backend upserts it.
 */
export async function registerPushDevice(account: NotificationAccount): Promise<boolean> {
  if (pushPermission() !== "granted") return false;
  const token = await fcmToken();
  if (!token) return false;
  await api.registerPushDevice(account, { token, client: PUSH_DEVICE_CLIENT, platform: "web" });
  writeStorage(tokenKey(account), token);
  return true;
}

/** Ask for permission (call from a click) and register when granted. */
export async function enablePush(account: NotificationAccount): Promise<PushPermission> {
  if (pushPermission() === "unsupported") return "unsupported";
  const result = await Notification.requestPermission();
  if (result === "granted") await registerPushDevice(account);
  return result;
}

/**
 * Stop this browser receiving the account's pushes. Call while still signed in (it
 * needs the access token), before clearing it. Best-effort and bounded, so a slow or
 * failing request never holds up logout.
 */
export async function unregisterPushDevice(account: NotificationAccount): Promise<void> {
  const token = readStorage(tokenKey(account));
  if (!token) return;
  writeStorage(tokenKey(account), null);
  try {
    await Promise.race([
      api.unregisterPushDevice(account, token),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch {
    /* already gone, or offline: the backend drops dead tokens on its own */
  }
}
