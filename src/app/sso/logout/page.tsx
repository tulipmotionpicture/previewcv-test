// src/app/sso/logout/page.tsx
"use client";

import { useEffect } from "react";
import { unregisterPushDevice } from "@/lib/push/push";
import {
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_TYPE,
  SSO_ALLOWED_ORIGINS,
  normalizeOrigin,
} from "@/lib/sso/config";

export default function SSOLogoutPage() {
  useEffect(() => {
    const ret = normalizeOrigin(
      new URLSearchParams(window.location.search).get("return")
    );
    (async () => {
      // A sign-out on the peer site also ends push to this browser (best-effort, bounded),
      // while the access token needed to do it is still here.
      await unregisterPushDevice("candidate");
      try {
        window.localStorage.removeItem(LS_ACCESS_TOKEN);
        window.localStorage.removeItem(LS_REFRESH_TOKEN);
        window.localStorage.removeItem(LS_USER_TYPE);
      } catch { }
      if (ret && (SSO_ALLOWED_ORIGINS as readonly string[]).includes(ret)) {
        try { window.parent.postMessage({ type: "sso", status: "logged_out" }, ret); } catch { }
      }
    })();
  }, []);

  return null;
}
