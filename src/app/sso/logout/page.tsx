// src/app/sso/logout/page.tsx
"use client";

import { useEffect } from "react";
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
    try {
      window.localStorage.removeItem(LS_ACCESS_TOKEN);
      window.localStorage.removeItem(LS_REFRESH_TOKEN);
      window.localStorage.removeItem(LS_USER_TYPE);
    } catch { }
    if (ret && (SSO_ALLOWED_ORIGINS as readonly string[]).includes(ret)) {
      try { window.parent.postMessage({ type: "sso", status: "logged_out" }, ret); } catch { }
    }
  }, []);

  return null;
}
