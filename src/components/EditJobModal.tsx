import React, { useState, useEffect } from "react";
import { Job } from "@/types/api";
import { Minimize2, Maximize2, X, ChevronDown, Plus } from "lucide-react";
import CountrySearch from "./location/CountrySearch";
import StateSearch from "./location/StateSearch";
import CitySearch from "./location/CitySearch";
import RichTextEditor from "./ui/RichTextEditor";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobId: number, data: Partial<Job>) => Promise<void>;
  job: Job | null;
  loadingJobDetails?: boolean;
}

export default function EditJobModal({
  isOpen,
  onClose,
  onSave,
  job,
  loadingJobDetails = false,
}: EditJobModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    country: "",
    countryCode: "",
    state: "",
    stateCode: "",
    city: "",
    job_type: "full_time" as Job["job_type"],
    experience_level: "mid" as Job["experience_level"],
    description: "",
    requirements: "",
    responsibilities: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    is_remote: false,
    is_active: true,
    required_skills: "" as string,
    preferred_skills: "" as string,
    categories: "" as string,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        company_name: job.company_name || "",
        country: job.country || "",
        state: job.state || "",
        city: job.city || "",
        countryCode: "",
        stateCode: "",
        job_type: job.job_type || "full_time",
        experience_level: job.experience_level || "mid",
        description: job.description || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "",
        salary_currency: job.salary_currency || "USD",
        is_remote: job.is_remote || false,
        is_active: job.status === "active",
        required_skills: job.required_skills?.join(", ") || "",
        preferred_skills: job.preferred_skills?.join(", ") || "",
        categories: job.categories?.join(", ") || "",
      });
    }
  }, [job]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setLoading(true);
    try {
      const updateData: Partial<Job> & {
        is_active?: boolean;
        salary_currency?: string;
        required_skills?: string[];
        preferred_skills?: string[];
        categories?: string[];
      } = {
        title: formData.title,
        company_name: formData.company_name,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        description: formData.description,
        requirements: formData.requirements || undefined,
        responsibilities: formData.responsibilities || undefined,
        salary_min: formData.salary_min
          ? parseInt(formData.salary_min)
          : undefined,
        salary_max: formData.salary_max
          ? parseInt(formData.salary_max)
          : undefined,
        salary_currency: formData.salary_currency,
        is_remote: formData.is_remote,
        is_active: formData.is_active,
        required_skills: formData.required_skills ? formData.required_skills.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        preferred_skills: formData.preferred_skills ? formData.preferred_skills.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        categories: formData.categories ? formData.categories.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      };

      await onSave(job.id, updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update job:", error);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  // Loading skeleton
  if (loadingJobDetails || !job) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl p-8">
          <p className="text-center text-gray-500 dark:text-gray-400 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? "p-0" : "p-4 sm:p-6"}`}>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className={`relative w-full bg-white dark:bg-[#1E1E1E] shadow-2xl flex flex-col transition-all duration-300 ${isFullscreen ? "h-full max-w-none rounded-none" : "max-w-4xl max-h-[90vh] rounded-xl"
          }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 bg-[#0B172B] border-b border-gray-800 ${isFullscreen ? "" : "rounded-t-xl"
          }`}>
          <h2 className="text-lg font-semibold text-white">
            Edit Job Posting
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={onChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-600 bg-gray-700 shadow-sm checked:border-blue-500 checked:bg-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors select-none">
                Active
              </span>
            </label>
            <div className="h-4 w-px bg-gray-600 mx-2" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Row 1: Title and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Enter job title"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={onChange}
                placeholder="Enter company name"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Row 1.5: Country, State, City */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <CountrySearch
                country={formData.country}
                renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                  <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    placeholder="e.g. USA"
                    className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                    required
                  />
                )}
                onChange={(c) => {
                  onChange({ target: { name: "country", value: c ? c.name : "" } } as any);
                  onChange({ target: { name: "countryCode", value: c ? c.code : "" } } as any);
                  onChange({ target: { name: "state", value: "" } } as any);
                  onChange({ target: { name: "stateCode", value: "" } } as any);
                  onChange({ target: { name: "city", value: "" } } as any);
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State
              </label>
              <StateSearch
                state={formData.state}
                countryCode={formData.countryCode}
                renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                  <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    placeholder="e.g. California"
                    className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                    required
                  />
                )}
                onChange={(s) => {
                  onChange({ target: { name: "state", value: s ? s.name : "" } } as any);
                  onChange({ target: { name: "stateCode", value: s ? s.code : "" } } as any);
                  onChange({ target: { name: "city", value: "" } } as any);
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <CitySearch
                city={formData.city}
                countryCode={formData.countryCode}
                stateCode={formData.stateCode}
                renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                  <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    placeholder="e.g. San Francisco"
                    className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                    required
                  />
                )}
                onChange={(c) => {
                  onChange({ target: { name: "city", value: c ? c.name : "" } } as any);
                }}
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
                  value={formData.salary_currency}
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
                value={formData.salary_min}
                onChange={onChange}
                placeholder="Min"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />

              <span className="text-sm text-gray-500 font-medium">to</span>

              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={onChange}
                placeholder="Max"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Job Type, Experience Level & Work Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Settings
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <select
                  name="job_type"
                  value={formData.job_type}
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
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={onChange}
                  className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white pr-8"
                >
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="work_mode"
                  defaultValue={formData.is_remote ? "remote" : "onsite"}
                  onChange={(e) => {
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
                  checked={formData.is_remote}
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
              value={formData.description}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Responsibilities
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={onChange}
              rows={3}
              placeholder="Enter responsibilities"
              className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white resize-none"
            />
          </div>

          {/* Row 5: Qualification or Requirement */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Qualification or Requirement
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={onChange}
              rows={3}
              placeholder="Enter qualification or requirment"
              className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white resize-none"
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
                name="categories"
                value={formData.categories}
                onChange={onChange}
                placeholder="Destinations and skills associated to this job"
                className="w-full px-2 py-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 dark:text-white outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Required skills
              </label>
              <input
                type="text"
                name="required_skills"
                value={formData.required_skills}
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
                value={formData.preferred_skills}
                onChange={onChange}
                placeholder="preferred skills (comma sep)"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1E1E1E]/50 rounded-b-xl flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
