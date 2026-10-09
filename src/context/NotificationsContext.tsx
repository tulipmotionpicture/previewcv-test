"use client";

// Notification bell state for whoever is signed in (candidate or recruiter), plus the
// browser push lifecycle:
//   - unread count on sign-in, on tab focus and every minute while the tab is visible
//   - re-registers this browser's push token after sign-in when permission was granted
//     earlier (tokens can rotate; the backend upserts)
//   - pushes arriving while a tab is visible come from the service worker as a message
//     (push-sw.js) and show as a toast + refresh the bell, instead of a system popup

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { enablePush, pushPermission, registerPushDevice, type PushPermission } from "@/lib/push/push";
import type { NotificationAccount, NotificationItem } from "@/types/api";
import { useAuth } from "./AuthContext";
import { useRecruiterAuth } from "./RecruiterAuthContext";
import { useToast } from "./ToastContext";

const POLL_MS = 60_000;
const PAGE_SIZE = 15;

interface NotificationsContextValue {
  account: NotificationAccount | null;
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  permission: PushPermission;
  loadList: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  enable: () => Promise<PushPermission>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: candidateSignedIn } = useAuth();
  const { isAuthenticated: recruiterSignedIn } = useRecruiterAuth();
  const pathname = usePathname();
  const { info } = useToast();

  // Normally only one account is signed in. If both are, the recruiter area shows the
  // recruiter's notifications and everywhere else the candidate's.
  const account: NotificationAccount | null =
    recruiterSignedIn && (!candidateSignedIn || pathname?.startsWith("/recruiter"))
      ? "recruiter"
      : candidateSignedIn
        ? "candidate"
        : null;

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // "unsupported" until mounted: Notification doesn't exist during server render.
  const [permission, setPermission] = useState<PushPermission>("unsupported");

  // Guards against a response for a previous account landing after a switch.
  const accountRef = useRef(account);
  accountRef.current = account;
  const listLoadedRef = useRef(false);

  const refreshCount = useCallback(async () => {
    if (!account) return;
    try {
      const { unread_count } = await api.getUnreadNotificationCount(account);
      if (accountRef.current === account) setUnreadCount(unread_count);
    } catch {
      /* signed out or offline; the next tick retries */
    }
  }, [account]);

  const loadList = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const page = await api.getNotifications(account, { limit: PAGE_SIZE });
      if (accountRef.current !== account) return;
      setItems(page.notifications);
      setUnreadCount(page.unread_count);
      setNextBeforeId(page.next_before_id);
      listLoadedRef.current = true;
    } catch {
      /* keep what we have */
    } finally {
      setLoading(false);
    }
  }, [account]);

  const loadMore = useCallback(async () => {
    if (!account || !nextBeforeId) return;
    setLoading(true);
    try {
      const page = await api.getNotifications(account, { limit: PAGE_SIZE, before_id: nextBeforeId });
      if (accountRef.current !== account) return;
      setItems((prev) => [...prev, ...page.notifications]);
      setNextBeforeId(page.next_before_id);
    } catch {
      /* the button stays, so it can be retried */
    } finally {
      setLoading(false);
    }
  }, [account, nextBeforeId]);

  const markRead = useCallback(
    async (id: number) => {
      if (!account) return;
      const target = items.find((n) => n.id === id);
      if (!target || target.read) return;
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.markNotificationRead(account, id);
      } catch {
        refreshCount();
      }
    },
    [account, items, refreshCount],
  );

  const markAllRead = useCallback(async () => {
    if (!account) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead(account);
    } catch {
      refreshCount();
    }
  }, [account, refreshCount]);

  const enable = useCallback(async () => {
    if (!account) return pushPermission();
    let result: PushPermission;
    try {
      result = await enablePush(account);
    } catch {
      result = pushPermission();
    }
    setPermission(result);
    return result;
  }, [account]);

  // Sign-in / sign-out / account switch: start fresh.
  useEffect(() => {
    setPermission(pushPermission());
    setItems([]);
    setNextBeforeId(null);
    setUnreadCount(0);
    listLoadedRef.current = false;
    if (!account) return;
    refreshCount();
    if (pushPermission() === "granted") {
      registerPushDevice(account).catch(() => {
        /* push stays off for this session; the bell still works */
      });
    }
  }, [account, refreshCount]);

  // Keep the count current without push: on focus, and every minute while visible.
  useEffect(() => {
    if (!account) return;
    const tick = () => {
      if (document.visibilityState === "visible") refreshCount();
    };
    const timer = window.setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [account, refreshCount]);

  // Pushes received while a tab is visible (forwarded by push-sw.js).
  useEffect(() => {
    if (!account || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "push-notification") return;
      const { title, body } = event.data as { title?: string; body?: string };
      info(title ? (body ? `${title}: ${body}` : title) : "You have a new notification");
      refreshCount();
      if (listLoadedRef.current) loadList();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [account, info, refreshCount, loadList]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      account,
      items,
      unreadCount,
      loading,
      hasMore: nextBeforeId !== null,
      permission,
      loadList,
      loadMore,
      markRead,
      markAllRead,
      enable,
    }),
    [account, items, unreadCount, loading, nextBeforeId, permission, loadList, loadMore, markRead, markAllRead, enable],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue | null {
  return useContext(NotificationsContext);
}
