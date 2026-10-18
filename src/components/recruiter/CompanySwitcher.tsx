"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronsUpDown } from "lucide-react";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { teamApi, isTeamUnavailable } from "@/lib/teamApi";
import type { TeamMembership } from "@/types/team";

/**
 * Team members who work for several companies switch between them here. Each
 * company has its own role, jobs, notes and inbox; the login is shared.
 * Renders nothing for owners and single-company members.
 */
export default function CompanySwitcher() {
  const { actor, isTeamMember, signInWithTokens } = useRecruiterAuth();
  const [companies, setCompanies] = useState<TeamMembership[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const memberId = actor?.member_id ?? null;

  useEffect(() => {
    if (!isTeamMember) return;
    teamApi
      .myCompanies()
      .then(setCompanies)
      .catch((e) => !isTeamUnavailable(e) && setError("Couldn't load your companies"));
  }, [isTeamMember, memberId]);

  const active = companies.filter((c) => c.status === "active");
  if (!isTeamMember || active.length < 2) return null;

  const pick = async (id: number) => {
    if (id === memberId || busy) return;
    setBusy(true);
    setError("");
    try {
      const s = await teamApi.switchCompany(id);
      await signInWithTokens(s.access_token, s.refresh_token);
      // Every tab holds company data: reload the dashboard fresh for the new company.
      window.location.assign("/recruiter/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Couldn't switch company");
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="relative flex items-center gap-2 rounded-md border border-[#E1E8F1] dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5">
        <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="sr-only">Switch company</span>
        <select
          className="flex-1 min-w-0 appearance-none bg-transparent text-[12px] font-semibold text-gray-900 dark:text-gray-100 outline-none cursor-pointer pr-4"
          value={memberId ?? ""}
          disabled={busy}
          onChange={(e) => pick(Number(e.target.value))}
        >
          {active.map((c) => (
            <option key={c.member_id} value={c.member_id}>
              {c.company_name || "Company"} · {c.role_name}
            </option>
          ))}
        </select>
        <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
      </label>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
