// Firebase web config for push notifications (project letsmakecv-2b044).
//
// These values are public by design: they identify the Firebase project to the browser
// and grant no access on their own (the backend sends pushes with its own service-account
// key). They live in code rather than NEXT_PUBLIC_* build variables so there is nothing
// to keep in sync in the Cloudflare build settings.

export const FIREBASE_WEB_CONFIG = {
  apiKey: "AIzaSyCcOJZArnQTlMaJG1Pj7cM-QYaWJyvo3CE",
  authDomain: "letsmakecv-2b044.firebaseapp.com",
  projectId: "letsmakecv-2b044",
  storageBucket: "letsmakecv-2b044.firebasestorage.app",
  messagingSenderId: "825106691989",
  appId: "1:825106691989:web:e0e56038fe73ece3dba89c",
};

// Web Push certificate (public half of the VAPID key pair).
export const FIREBASE_VAPID_KEY =
  "BFxDPWmDRif1DKmU5_aOgE8m6xzeZoM819oNZfc3J2930IoTYwpt9WpZwWk6ayw1d1XHdFDy51N9erpS4CNKbU0";

// Our own service worker (public/push-sw.js), registered under a dedicated scope so it
// never controls page loads; it only receives pushes.
export const PUSH_SW_PATH = "/push-sw.js";
export const PUSH_SW_SCOPE = "/firebase-cloud-messaging-push-scope";

// Tells the backend which site this browser token belongs to (links open on that site).
export const PUSH_DEVICE_CLIENT = "previewcv_web";
