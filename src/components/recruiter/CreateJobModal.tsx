import React from "react";
import { X, ChevronDown, Plus } from "lucide-react";
import { JobFormState } from "./JobManagement";
import RichTextEditor from "../ui/RichTextEditor";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobForm: JobFormState;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export default function CreateJobModal({
  isOpen,
  onClose,
  jobForm,
  onChange,
  onSubmit,
  isSubmitting = false,
}: CreateJobModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-4xl bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B172B] rounded-t-xl border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">
            Post New Opportunity
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Row 1: Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={jobForm.title}
              onChange={onChange}
              placeholder="Enter job title"
              className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Row 1.5: Country, State, City */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={jobForm.country}
                onChange={onChange}
                placeholder="Enter country"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State / Region
              </label>
              <input
                type="text"
                name="state"
                value={jobForm.state}
                onChange={onChange}
                placeholder="Enter state or region"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <input
                type="text"
                name="city"
                value={jobForm.city}
                onChange={onChange}
                placeholder="Enter city"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Row 2: Monthly Salary */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Monthly Salary
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-32">
                <select
                  name="salary_currency"
                  value={jobForm.salary_currency}
                  onChange={onChange}
                  className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white pr-8"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <input
                type="number"
                name="salary_min"
                value={jobForm.salary_min}
                onChange={onChange}
                placeholder="Min"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />

              <span className="text-sm text-gray-500 font-medium">to</span>

              <input
                type="number"
                name="salary_max"
                value={jobForm.salary_max}
                onChange={onChange}
                placeholder="Max"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Job Type & Work Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Type
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <select
                  name="job_type"
                  value={jobForm.job_type}
                  onChange={onChange}
                  className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white pr-8"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="work_mode" // Not a real field, but maps to is_remote roughly for UI
                  defaultValue={jobForm.is_remote ? "remote" : "onsite"}
                  onChange={(e) => {
                    // We can manually trigger is_remote change
                    const isRemote = e.target.value === "remote";
                    const event = {
                      target: {
                        name: "is_remote",
                        type: "checkbox",
                        checked: isRemote,
                        value: isRemote,
                      },
                    } as any;
                    onChange(event);
                  }}
                  className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white pr-8"
                >
                  <option value="onsite">On Site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer group w-fit">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="is_remote"
                  checked={jobForm.is_remote}
                  onChange={onChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-blue-500 checked:bg-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:border-gray-600 dark:bg-gray-700"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 text-white transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors select-none">
                Position is remote-friendly
              </span>
            </label>
          </div>

          {/* Row 4: Job Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Description
            </label>
            <RichTextEditor
              value={jobForm.description}
              onChange={(content: string) => {
                const event = {
                  target: {
                    name: "description",
                    value: content,
                  },
                } as any;
                onChange(event);
              }}
              placeholder="Describe the opportunity, team and impact"
            />
          </div>

          {/* Row 5: Qualification or Requirement */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Qualification or Requirement
            </label>
            <input
              type="text"
              name="requirements"
              value={jobForm.requirements}
              onChange={onChange}
              placeholder="Enter qualification or requirment (comma or line separated)"
              className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Row 6: Keywords / Key skills */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Keywords / Key skills
            </label>
            <div className="bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                name="categories" // Mapping to categories for "Keywords"
                value={jobForm.categories}
                onChange={onChange}
                placeholder="Destinations and skills associated to this job"
                className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 dark:text-white outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {/* Example pills - purely visual based on placeholder input, or we could parse the categories string */}
              {jobForm.categories
                .split(",")
                .filter((c) => c.trim())
                .map((cat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium"
                  >
                    {cat.trim()}
                    <Plus className="w-3 h-3 rotate-45" />
                  </span>
                ))}
            </div>
          </div>

          {/* Row 7: 3 Columns for specific skills/tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Required skills
              </label>
              <input
                type="text"
                name="required_skills"
                value={jobForm.required_skills}
                onChange={onChange}
                placeholder="required skills (comma sep)"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred skills
              </label>
              <input
                type="text"
                name="preferred_skills"
                value={jobForm.preferred_skills}
                onChange={onChange}
                placeholder="preferred skills (comma sep)"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categories or tags
              </label>
              <input
                type="text"
                name="categories"
                value={jobForm.categories}
                onChange={onChange}
                placeholder="Categories tags"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1E1E1E]/50 rounded-b-xl flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
