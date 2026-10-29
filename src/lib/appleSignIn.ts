"use client";

// Sign in with Apple on the web (Apple JS, popup mode). Apple returns a signed
// identity token to the page; the backend verifies it at POST /auth/oauth/apple,
// the same check the iOS app uses (/auth/oauth/apple/mobile). Candidates only.
//
// The popup has to open inside the click, or Safari blocks it. So the script is
// loaded and AppleID.auth.init() run ahead of time (prepareAppleSignIn on mount),
// and signInWithApple() calls AppleID.auth.signIn() before its first await.

const APPLE_JS =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

/** Services ID for this site (Apple Developer > Identifiers > Services IDs). */
const APPLE_SERVICES_ID =
  process.env.NEXT_PUBLIC_APPLE_SERVICES_ID || "com.previewcv.web";

/** Must be a Return URL registered on the Services ID. */
const APPLE_REDIRECT_PATH = "/candidate/login";

export interface AppleCredential {
  identityToken: string;
  /** The nonce before hashing; the token carries its SHA-256 hex. */
  rawNonce: string;
  /** Apple shares the name on the first sign-in only. */
  givenName?: string;
  familyName?: string;
}

/** The user closed the Apple popup: not an error to show. */
export class AppleSignInCancelled extends Error {
  constructor() {
    super("Sign in with Apple was cancelled");
    this.name = "AppleSignInCancelled";
  }
}

type AppleIdGlobal = {
  auth: {
    init: (config: Record<string, unknown>) => void;
    signIn: () => Promise<any>;
  };
};

const appleId = () => (window as unknown as { AppleID?: AppleIdGlobal }).AppleID;

let scriptPromise: Promise<void> | null = null;
let prepared: { rawNonce: string; state: string } | null = null;

function loadScript(): Promise<void> {
  if (appleId()) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = APPLE_JS;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Could not load Sign in with Apple."));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/** Loads Apple JS and initialises a fresh nonce and state for the next click. */
export async function prepareAppleSignIn(): Promise<void> {
  await loadScript();
  const rawNonce = randomHex(32);
  const state = randomHex(16);
  const nonce = await sha256Hex(rawNonce);
  appleId()!.auth.init({
    clientId: APPLE_SERVICES_ID,
    scope: "name email",
    redirectURI: `${window.location.origin}${APPLE_REDIRECT_PATH}`,
    state,
    nonce,
    usePopup: true,
  });
  prepared = { rawNonce, state };
}

/**
 * Opens the Apple popup and returns what the backend needs. Throws
 * [AppleSignInCancelled] if the user closes it.
 */
export async function signInWithApple(): Promise<AppleCredential> {
  if (!prepared || !appleId()) await prepareAppleSignIn();
  const { rawNonce, state } = prepared!;
  prepared = null;

  let response: any;
  try {
    response = await appleId()!.auth.signIn();
  } catch (error: any) {
    const code = error?.error;
    if (code === "popup_closed_by_user" || code === "user_cancelled_authorize") {
      throw new AppleSignInCancelled();
    }
    throw new Error("Sign in with Apple could not be completed. Please try again.");
  } finally {
    // Ready for another attempt without waiting inside the next click.
    prepareAppleSignIn().catch(() => {});
  }

  const identityToken = response?.authorization?.id_token;
  if (response?.authorization?.state !== state || !identityToken) {
    throw new Error("Sign in with Apple could not be completed. Please try again.");
  }
  const name = response?.user?.name;
  return {
    identityToken,
    rawNonce,
    givenName: name?.firstName || undefined,
    familyName: name?.lastName || undefined,
  };
}
