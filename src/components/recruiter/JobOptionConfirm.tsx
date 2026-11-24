"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, EyeOff, Info } from "lucide-react";

interface JobOptionConfirmProps {
  title: string;
  /** What will happen, in plain words, one point each. */
  points: string[];
  /** Shown highlighted: what can't be undone, or what the recruiter should check. */
  warnings?: string[];
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onClose: () => void;
}

/** Explains a job option in plain words and asks the recruiter to confirm it. Without
 *  onConfirm it only explains, with a single button. */
export default function JobOptionConfirm({
  title,
  points,
  warnings = [],
  confirmText,
  cancelText,
  onConfirm,
  onClose,
}: JobOptionConfirmProps) {
  const firstButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  // Portalled to <body>: the dashboard's animated wrappers would otherwise trap "fixed".
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-option-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {onConfirm ? <EyeOff className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          </span>
          <h3 id="job-option-title" className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        <ul className="mt-5 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
              {onConfirm ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <span className="mx-1 mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
              )}
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {warnings.length > 0 && (
          <div className="mt-5 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
            {warnings.map((warning) => (
              <p key={warning} className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{warning}</span>
              </p>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={firstButton}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
