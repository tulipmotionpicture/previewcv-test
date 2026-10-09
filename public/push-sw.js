/* PreviewCV push notifications service worker (Firebase Cloud Messaging, web push).
 *
 * Deliberately free of the Firebase SDK: FCM delivers a standard Web Push whose payload
 * is the JSON message ({notification, data, fcmOptions}), so this worker shows it itself.
 * Registered under its own scope (see src/lib/push/config.ts), so it never intercepts
 * page loads.
 *
 * - A visible tab of this site gets the message instead (postMessage), which shows an
 *   in-page toast and refreshes the bell, rather than a duplicate system notification.
 * - Clicking a notification focuses a tab already on that page or opens one.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    return;
  }
  const notification = payload.notification || {};
  const data = payload.data || {};
  const link = (payload.fcmOptions && payload.fcmOptions.link) || data.link || "/";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const visible = windows.filter((w) => w.visibilityState === "visible");
      if (visible.length > 0) {
        visible.forEach((w) =>
          w.postMessage({
            type: "push-notification",
            title: notification.title,
            body: notification.body,
            link,
            data,
          })
        );
        return;
      }
      await self.registration.showNotification(notification.title || "PreviewCV", {
        body: notification.body || "",
        icon: "/push-icon-192.png",
        // One entry per notification id, so a re-delivered push replaces rather than stacks;
        // renotify still alerts (sound/vibration) when it does.
        tag: data.notification_id || undefined,
        renotify: Boolean(data.notification_id),
        // Android buzz; the sound itself is the OS notification sound (web pages can't set it).
        vibrate: [180, 80, 180],
        data: { link },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    (event.notification.data && event.notification.data.link) || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of windows) {
        if (w.url === target && "focus" in w) return w.focus();
      }
      return self.clients.openWindow(target);
    })()
  );
});
