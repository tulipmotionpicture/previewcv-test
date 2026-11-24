"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { checkSalary, type SalaryInput } from "@/lib/salaryCheck";
import { formatSalaryRange } from "@/lib/salary";

/** Inline hint under the salary fields when the amounts look mistyped. Never blocks. */
export default function SalaryWarning({
  onApply,
  ...fields
}: {
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  salary_type: string;
  onApply: (salary: SalaryInput) => void;
}) {
  const warning = checkSalary(fields);
  if (!warning) return null;
  const { suggestion } = warning;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p>{warning.message}</p>
        {suggestion && (
          <button
            type="button"
            onClick={() => onApply(suggestion)}
            className="mt-1 font-semibold underline underline-offset-2 hover:no-underline"
          >
            Use {formatSalaryRange(suggestion)}
          </button>
        )}
      </div>
    </div>
  );
}
