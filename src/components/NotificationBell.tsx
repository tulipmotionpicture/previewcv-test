"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";
import { useToast } from "@/context/ToastContext";
import { parseApiDate } from "@/lib/postedDate";
import type { NotificationItem } from "@/types/api";

type Placement = "header" | "sidebar" | "floating";

const PANEL_WIDTH = 320;
const PANEL_GAP = 8;
const VIEWPORT_EDGE = 12;

const BUTTON_STYLE: Record<Placement, string> = {
  header:
    "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  sidebar:
    "p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  // Mirrors the dashboard's mobile menu button (top-left), on the right.
  floating:
    "p-2 rounded-lg bg-[#2F4269] dark:bg-[#1E293B] text-white shadow-lg",
};

function timeAgo(value: string | null): string {
  const date = parseApiDate(value);
  if (!date) return "";
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Bell with unread badge and a dropdown inbox. Renders nothing when signed out. */
export default function NotificationBell({
  placement = "header",
  className = "",
}: {
  placement?: Placement;
  className?: string;
}) {
  const ctx = useNotifications();
  const router = useRouter();
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [ringing, setRinging] = useState(false);
  const arrivals = ctx?.arrivals ?? 0;

  // Ring the bell (and pulse the badge) briefly whenever new notifications arrive.
  useEffect(() => {
    if (!arrivals) return;
    setRinging(true);
    const timer = window.setTimeout(() => setRinging(false), 1000);
    return () => window.clearTimeout(timer);
  }, [arrivals]);

  // The dropdown is portalled to <body> and positioned from the bell's on-screen rect.
  // Inside the dashboard sidebar (sticky, transformed: its own stacking context) an
  // absolutely positioned panel was painted under the main content and cut off at the
  // sidebar's edge. Sidebar bells open rightwards from the bell; header bells line up
  // with its right edge. Always kept inside the viewport.
  const placePanel = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_EDGE * 2);
    const preferred = placement === "sidebar" ? rect.left : rect.right - width;
    const left = Math.max(
      VIEWPORT_EDGE,
      Math.min(preferred, window.innerWidth - width - VIEWPORT_EDGE),
    );
    setPanelPos({ top: rect.bottom + PANEL_GAP, left, width });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    placePanel();
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
    };
  }, [open, placePanel]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !panelRef.current?.contains(target))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ctx || !ctx.account) return null;
  const { account, items, unreadCount, loading, hasMore, permission } = ctx;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) ctx.loadList();
  };

  const openItem = (item: NotificationItem) => {
    ctx.markRead(item.id);
    setOpen(false);
    if (item.link_path) router.push(item.link_path);
  };

  const turnOn = async () => {
    const result = await ctx.enable();
    if (result === "granted") success("Notifications are on for this browser");
  };

  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    // Outer element takes the caller's positioning (e.g. `fixed` for the mobile button);
    // the inner one anchors the dropdown.
    <div className={className || undefined}>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          aria-expanded={open}
          className={`relative flex items-center justify-center transition-colors ${BUTTON_STYLE[placement]}`}
        >
          <Bell className={`w-5 h-5 ${ringing ? "bell-ring" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]">
              {ringing && (
                <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping motion-reduce:hidden" />
              )}
              <span className="relative block min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center">
                {badge}
              </span>
            </span>
          )}
        </button>

        {open && panelPos && createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            style={{ position: "fixed", top: panelPos.top, left: panelPos.left, width: panelPos.width }}
            className="z-[100] bg-white dark:bg-gray-900 text-left rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Notifications
              </p>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => ctx.markAllRead()}
                    className="text-xs font-semibold text-primary-blue dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={ctx.toggleSound}
                  aria-label={ctx.soundOn ? "Mute notification sound" : "Unmute notification sound"}
                  title={ctx.soundOn ? "Sound on" : "Sound off"}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {ctx.soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {permission === "default" && (
              <div className="m-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {account === "recruiter"
                    ? "Get an instant alert when someone applies to your jobs."
                    : "Get instant updates when employers respond to your applications."}
                </p>
                <button
                  type="button"
                  onClick={turnOn}
                  className="mt-2 px-3 py-1.5 rounded-md bg-primary-blue text-white text-xs font-bold hover:bg-blue-700"
                >
                  Turn on notifications
                </button>
              </div>
            )}
            {permission === "denied" && (
              <p className="mx-4 mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <BellOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Notifications are blocked for this site. Allow them in your
                browser&apos;s site settings to get instant updates.
              </p>
            )}

            <div className="max-h-[60vh] overflow-y-auto py-1">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? "Loading…" : "No notifications yet"}
                </p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${item.read ? "" : "bg-blue-50/40 dark:bg-blue-900/10"}`}
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.read ? "bg-transparent" : "bg-primary-blue"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm text-gray-900 dark:text-white ${item.read ? "font-medium" : "font-bold"}`}
                      >
                        {item.title}
                      </span>
                      <span className="block text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {item.body}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-1">
                        {timeAgo(item.created_at)}
                      </span>
                    </span>
                  </button>
                ))
              )}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => ctx.loadMore()}
                  disabled={loading}
                  className="w-full py-2 text-xs font-semibold text-primary-blue dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Loading…" : "Show older"}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
}
