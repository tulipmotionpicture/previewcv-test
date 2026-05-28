/**
 * Paddle.js helper — memoized initialization + thin overlay-checkout wrapper.
 *
 * Backend returns a per-checkout `client_token` + `environment` inside
 * `CheckoutContextResponse`, so we re-init only if either changes (which it
 * never should within a session). Re-calls return the cached Promise.
 *
 * Usage:
 *   const paddle = await initPaddle(ctx.client_token, ctx.environment);
 *   await openCheckout(paddle, ctx, {
 *     onCompleted: () => router.push("/recruiter/billing/success?type=job"),
 *     onClosed: () => {},
 *   });
 */

import {
  initializePaddle,
  CheckoutEventNames,
  type Paddle,
} from "@paddle/paddle-js";
import type {
  CheckoutContextResponse,
  PaddleEnvironment,
} from "@/types/api";

interface CachedPaddle {
  token: string;
  environment: PaddleEnvironment;
  promise: Promise<Paddle | undefined>;
}

let cached: CachedPaddle | null = null;

const envFromBackend = (env: string | undefined): PaddleEnvironment => {
  return env === "production" ? "production" : "sandbox";
};

export interface OpenCheckoutCallbacks {
  onCompleted?: (event: unknown) => void;
  onClosed?: (event: unknown) => void;
  onError?: (event: unknown) => void;
}

// Single in-flight checkout callback slot (Paddle only allows one overlay).
let currentCallbacks: OpenCheckoutCallbacks = {};

const setCallbacks = (cb: OpenCheckoutCallbacks) => {
  currentCallbacks = cb;
};

/**
 * Initialize Paddle.js (lazy, memoized).
 *
 * The eventCallback is wired once and dispatches to whatever callbacks are
 * currently registered via `openCheckout`.
 */
export function initPaddle(
  token: string,
  environment: string,
): Promise<Paddle | undefined> {
  const env = envFromBackend(environment);

  if (cached && cached.token === token && cached.environment === env) {
    return cached.promise;
  }

  const promise = initializePaddle({
    token,
    environment: env,
    eventCallback: (event) => {
      const name = event?.name;
      try {
        if (name === CheckoutEventNames.CHECKOUT_COMPLETED) {
          currentCallbacks.onCompleted?.(event);
        } else if (name === CheckoutEventNames.CHECKOUT_CLOSED) {
          currentCallbacks.onClosed?.(event);
        } else if (
          name === CheckoutEventNames.CHECKOUT_ERROR ||
          name === CheckoutEventNames.CHECKOUT_FAILED ||
          name === CheckoutEventNames.CHECKOUT_PAYMENT_FAILED ||
          name === CheckoutEventNames.CHECKOUT_PAYMENT_ERROR
        ) {
          currentCallbacks.onError?.(event);
        }
      } catch (err) {
        // Never throw out of Paddle's callback
        console.error("[paddle] eventCallback handler error", err);
      }
    },
  });

  cached = { token, environment: env, promise };
  return promise;
}

/**
 * Open the Paddle.js overlay checkout for the given backend-issued context.
 *
 * - For Job subscriptions, `ctx.is_subscription === true` and `ctx.price_id`
 *   is a Paddle recurring price.
 * - For CV credit packs, `ctx.is_subscription === false` and the same
 *   `price_id` is a one-time price.
 *
 * `successUrl` is taken from the backend (`ctx.success_url`) but the caller
 * may override it (we always send `${origin}/recruiter/billing/success?type=…`).
 */
export async function openCheckout(
  paddle: Paddle | undefined,
  ctx: CheckoutContextResponse,
  callbacks: OpenCheckoutCallbacks = {},
  overrideSuccessUrl?: string,
): Promise<void> {
  if (!paddle) {
    throw new Error("Paddle.js not initialized");
  }

  setCallbacks(callbacks);

  const customer =
    ctx.customer && (ctx.customer.id || ctx.customer.email)
      ? ctx.customer.id
        ? { id: ctx.customer.id }
        : { email: ctx.customer.email as string }
      : undefined;

  paddle.Checkout.open({
    items: [{ priceId: ctx.price_id, quantity: 1 }],
    customer,
    customData: ctx.custom_data as unknown as Record<string, unknown>,
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: ctx.locale || "en",
      successUrl: overrideSuccessUrl || ctx.success_url || undefined,
      allowLogout: false,
    },
  });
}

/**
 * Format a display-price hint from the backend (`display_amount_minor` is the
 * smallest currency unit — cents for USD, paise for INR, etc.).
 */
export function formatDisplayPrice(
  amountMinor: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amountMinor == null || !currency) return "";
  const amount = amountMinor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
