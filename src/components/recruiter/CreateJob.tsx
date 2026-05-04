"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, X, Check, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { JobFormState, JOB_FORM_INITIAL } from "@/components/recruiter";
import RichTextEditor from "../ui/RichTextEditor";
import CountrySearch from "../location/CountrySearch";
import StateSearch from "../location/StateSearch";
import CitySearch from "../location/CitySearch";
import { JobSearch, SkillSearch, CompanySearch } from "../masters";
import { JobTitle, Company } from "@/types/masters";

const STEPS = [
  "Core Details",
  "Description",
  "Skills & Categories",
  "Review & Publish",
];

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  />
);

const TextArea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => (
  <textarea
    {...props}
    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  />
);

const Select = (
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[];
  },
) => {
  const { options, ...rest } = props;
  return (
    <select
      {...rest}
      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

const SkillTag = ({
  skill,
  onRemove,
}: {
  skill: string;
  onRemove: () => void;
}) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
    {skill}
    <X
      className="w-3 h-3 cursor-pointer hover:text-blue-900 dark:hover:text-blue-200"
      onClick={onRemove}
    />
  </div>
);

interface JobCreationProps {
  onNavigateToPricing?: () => void;
}

export default function JobCreationPage({
  onNavigateToPricing,
}: JobCreationProps = {}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { recruiter } = useRecruiterAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<JobFormState>(JOB_FORM_INITIAL);
  const [categoryInput, setCategoryInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [selectedJobTitleId, setSelectedJobTitleId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [companyInput, setCompanyInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");

  React.useEffect(() => {
    if (recruiter?.company_name && !form.company_name) {
      setForm((p) => ({ ...p, company_name: recruiter.company_name || "" }));
      setCompanyInput(recruiter.company_name);
    }
  }, [recruiter]);

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  // Calculate form completion percentage
  const completionPercent = useMemo(() => {
    const fields = [
      form.title,
      form.company_name,
      form.country,
      form.city,
      form.job_type,
      form.experience_level,
      form.salary_min,
      form.salary_max,
      form.description,
      form.requirements,
    ];
    const filled = fields.filter((f) => f).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchSuggestions = async () => {
    if (!selectedJobTitleId) return;
    setLoadingSuggestions(true);
    try {
      const res = await api.request<any>(
        `/api/v1/job-descriptions/by-title/${selectedJobTitleId}?page=1&page_size=10`,
        {},
        true,
        true
      );
      setSuggestions(res.items || []);
      setCurrentSuggestionIndex(0);
      setShowSuggestions(true);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch job description suggestions", "error");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (sug: any) => {
    setForm((prev) => ({
      ...prev,
      description: sug.description || prev.description,
      responsibilities: sug.responsibilities || prev.responsibilities,
      requirements: sug.requirements || prev.requirements,
      required_skills: sug.skills_required && sug.skills_required.length > 0
        ? Array.from(new Set([...(prev.required_skills ? prev.required_skills.split(",").map((s: string) => s.trim()) : []), ...sug.skills_required])).filter(Boolean).join(", ")
        : prev.required_skills,
      preferred_skills: sug.skills_preferred && sug.skills_preferred.length > 0
        ? Array.from(new Set([...(prev.preferred_skills ? prev.preferred_skills.split(",").map((s: string) => s.trim()) : []), ...sug.skills_preferred])).filter(Boolean).join(", ")
        : prev.preferred_skills,
      categories: sug.categories_keywords && sug.categories_keywords.length > 0
        ? Array.from(new Set([...(prev.categories ? prev.categories.split(",").map((s: string) => s.trim()) : []), ...sug.categories_keywords])).filter(Boolean).join(", ")
        : prev.categories,
      experience_level: sug.experience_level ? sug.experience_level.toLowerCase() : prev.experience_level
    }));
    setShowSuggestions(false);
    showToast("Suggestion applied successfully", "success");
  };

  const addCategory = () => {
    const cat = categoryInput.trim();
    if (!cat) return;

    const current = form.categories
      ? form.categories
        .split(",")
        .filter(Boolean)
        .map((c) => c.trim())
      : [];

    if (!current.includes(cat)) {
      current.push(cat);
      setForm((p) => ({ ...p, categories: current.join(", ") }));
    }
    setCategoryInput("");
  };

  const removeCategory = (cat: string) => {
    const current = form.categories
      ? form.categories
        .split(",")
        .filter(Boolean)
        .map((c) => c.trim())
      : [];
    const updated = current.filter((c) => c !== cat);
    setForm((p) => ({
      ...p,
      categories: updated.length > 0 ? updated.join(", ") : "",
    }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (
      !form.title ||
      !form.company_name ||
      !form.country ||
      !form.city ||
      !form.job_type ||
      !form.experience_level ||
      !form.description ||
      !form.requirements ||
      !form.salary_min ||
      !form.salary_max
    ) {
      showToast("Please fill all the required fields before submitting.", "error");
      return;
    }

    try {
      setLoading(true);

      const requiredSkillsArray = form.required_skills
        ? form.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : [];

      const preferredSkillsArray = form.preferred_skills
        ? form.preferred_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : [];

      const categoriesArray = form.categories
        ? form.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
        : [];

      const response = await api.createJob({
        title: form.title,
        company_name: form.company_name,
        country: form.country,
        state: form.state,
        city: form.city,
        job_type: form.job_type,
        experience_level: form.experience_level,
        description: form.description,
        requirements: form.requirements,
        responsibilities: form.responsibilities,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        salary_currency: form.salary_currency,
        is_remote: form.is_remote,
        is_active: form.is_active,
        required_skills: requiredSkillsArray,
        preferred_skills: preferredSkillsArray,
        categories: categoriesArray,
      });

      showToast("Job posted successfully 🚀", "success");

      // Clear form
      setForm(JOB_FORM_INITIAL);
      setStep(0);
      setCategoryInput("");
      setJobTitleInput("");
      setCompanyInput("");
      setSkillInput("");
      setPrefSkillInput("");

      console.log("Job created successfully:", response);
      router.push("/recruiter/dashboard?tab=jobs");
    } catch (e: any) {
      console.error("Job creation failed:", e);
      const errorMessage = e.detail?.message || e.message || "Failed to create job. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mx-auto" onSubmit={(e) => {
      e.preventDefault();
      if (step === 3) submit();
      else next();
    }}>
      {/* PROGRESS BAR */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-2">
          {STEPS.map((stepName, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <motion.div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold transition-all mb-2 ${i < step
                  ? "bg-green-500 text-white shadow-md"
                  : i === step
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600"
                  }`}
                animate={{ scale: i === step ? 1.2 : 1 }}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </motion.div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center whitespace-nowrap px-1">
                {stepName}
              </p>
            </div>
          ))}
        </div>

        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-blue-500 to-blue-600 shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* CONTENT WITH LIVE PREVIEW */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORM SECTION */}
        <div className="lg:col-span-2">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* STEP 1: CORE DETAILS */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Job Title *
                    </label>
                    <JobSearch
                      title={jobTitleInput || form.title}
                      onChange={(val: JobTitle | null) => {
                        if (val) {
                          if (val.id > 0) {
                            setSelectedJobTitleId(val.id);
                            setForm((prev) => ({ ...prev, title: val.title }));
                            setJobTitleInput("");
                          } else {
                            setSelectedJobTitleId(null);
                            setJobTitleInput(val.title);
                            setForm((prev) => ({ ...prev, title: val.title }));
                          }
                        } else {
                          setSelectedJobTitleId(null);
                          setJobTitleInput("");
                          setForm((prev) => ({ ...prev, title: "" }));
                        }
                      }}
                      placeholder="Add job title (e.g., Software Engineer)"
                      renderInput={({
                        value,
                        onChange: rOnChange,
                        onFocus,
                        onBlur,
                        onKeyDown,
                      }) => (
                        <input
                          type="text"
                          value={jobTitleInput || form.title}
                          onChange={(e) => {
                            rOnChange(e);
                            setForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }));
                          }}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          onKeyDown={onKeyDown}
                          placeholder="Enter job title"
                          className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                          required
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Company Name *
                    </label>
                    <CompanySearch
                      company={companyInput || form.company_name}
                      onChange={(val: Company | null) => {
                        if (val) {
                          if (val.id > 0) {
                            setForm((prev) => ({ ...prev, company_name: val.name }));
                            setCompanyInput("");
                          } else {
                            setCompanyInput(val.name);
                            setForm((prev) => ({ ...prev, company_name: val.name }));
                          }
                        } else {
                          setCompanyInput("");
                          setForm((prev) => ({ ...prev, company_name: "" }));
                        }
                      }}
                      placeholder="e.g., Tech Corp"
                      renderInput={({
                        value,
                        onChange: rOnChange,
                        onFocus,
                        onBlur,
                        onKeyDown,
                      }) => (
                        <input
                          type="text"
                          value={companyInput || form.company_name}
                          onChange={(e) => {
                            rOnChange(e);
                            setForm((prev) => ({
                              ...prev,
                              company_name: e.target.value,
                            }));
                          }}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          onKeyDown={onKeyDown}
                          placeholder="e.g., Tech Corp"
                          className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                          required
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Job Type *
                    </label>
                    <Select
                      name="job_type"
                      value={form.job_type}
                      onChange={handleChange}
                      required
                      options={[
                        { value: "", label: "Select Job Type" },
                        { value: "full_time", label: "Full Time" },
                        { value: "part_time", label: "Part Time" },
                        { value: "contract", label: "Contract" },
                        { value: "internship", label: "Internship" },
                        { value: "freelance", label: "Freelance" },
                        { value: "temporary", label: "Temporary" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Experience Level *
                    </label>
                    <Select
                      name="experience_level"
                      value={form.experience_level}
                      onChange={handleChange}
                      required
                      options={[
                        { value: "", label: "Select Experience Level" },
                        { value: "entry", label: "Entry Level" },
                        { value: "junior", label: "Junior" },
                        { value: "mid", label: "Mid Level" },
                        { value: "senior", label: "Senior" },
                        { value: "lead", label: "Lead" },
                        { value: "director", label: "Director" },
                        { value: "executive", label: "Executive" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Country *
                    </label>
                    <CountrySearch
                      country={form.country}
                      renderInput={({
                        value,
                        onChange,
                        onFocus,
                        onBlur,
                        onKeyDown,
                      }) => (
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
                        handleChange({ target: { name: "country", value: c ? c.name : "" } } as any);
                        handleChange({ target: { name: "countryCode", value: c ? c.code : "" } } as any);
                        handleChange({ target: { name: "state", value: "" } } as any);
                        handleChange({ target: { name: "stateCode", value: "" } } as any);
                        handleChange({ target: { name: "city", value: "" } } as any);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      State/Region
                    </label>
                    <StateSearch
                      state={form.state}
                      countryCode={form.countryCode}
                      renderInput={({
                        value,
                        onChange,
                        onFocus,
                        onBlur,
                        onKeyDown,
                      }) => (
                        <input
                          type="text"
                          value={value}
                          onChange={onChange}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          onKeyDown={onKeyDown}
                          placeholder="e.g. California"
                          className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                        />
                      )}
                      onChange={(s) => {
                        handleChange({ target: { name: "state", value: s ? s.name : "" } } as any);
                        handleChange({ target: { name: "stateCode", value: s ? s.code : "" } } as any);
                        handleChange({ target: { name: "city", value: "" } } as any);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      City *
                    </label>
                    <CitySearch
                      city={form.city}
                      countryCode={form.countryCode}
                      stateCode={form.stateCode}
                      renderInput={({
                        value,
                        onChange,
                        onFocus,
                        onBlur,
                        onKeyDown,
                      }) => (
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
                        handleChange({ target: { name: "city", value: c ? c.name : "" } } as any);
                      }}
                    />
                  </div>
                </div>

                {/* Work Mode Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="is_remote"
                      checked={form.is_remote}
                      onChange={handleChange}
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
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    This position is remote-friendly
                  </span>
                </label>
              </div>
            )}

            {/* STEP 2: DESCRIPTION */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium">
                      Job Description *
                    </label>

                    {selectedJobTitleId && (
                      <button
                        type="button"
                        onClick={fetchSuggestions}
                        disabled={loadingSuggestions}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {loadingSuggestions ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Loading Suggestions...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4" />
                            Get Suggestions
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <RichTextEditor
                    value={form.description}
                    onChange={(content: string) => {
                      const event = {
                        target: {
                          name: "description",
                          value: content,
                        },
                      } as any;
                      handleChange(event);
                    }}
                    placeholder="Describe the job role, team, and what makes this opportunity unique..."
                  />


                  {showSuggestions && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Suggested Job Details</h4>
                            <p className="text-xs text-gray-500 mt-1">Select a suggestion to automatically populate your job form</p>
                          </div>
                          <button onClick={() => setShowSuggestions(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {loadingSuggestions ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
                              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          ) : null}

                          {suggestions.length === 0 && !loadingSuggestions ? (
                            <div className="text-center py-8 text-gray-500">No suggestions found for this job title.</div>
                          ) : suggestions.length > 0 ? (
                            <div className="p-6">
                              <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-semibold">{suggestions[currentSuggestionIndex].experience_level}</span>
                                <span className="px-3 py-1.5 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-full text-sm font-semibold">{suggestions[currentSuggestionIndex].industry_context}</span>
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h5>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{suggestions[currentSuggestionIndex].description}</p>
                                </div>
                                {suggestions[currentSuggestionIndex].responsibilities && (
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Responsibilities</h5>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{suggestions[currentSuggestionIndex].responsibilities}</p>
                                  </div>
                                )}
                                {suggestions[currentSuggestionIndex].requirements && (
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Requirements</h5>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{suggestions[currentSuggestionIndex].requirements}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Top Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {suggestions[currentSuggestionIndex].skills_required?.map((skill: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{skill}</span>
                                      )) || <span className="text-sm text-gray-500">None</span>}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Keywords</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {suggestions[currentSuggestionIndex].categories_keywords?.map((kw: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{kw}</span>
                                      )) || <span className="text-sm text-gray-500">None</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="pt-6 mt-4 flex justify-center border-t border-gray-100 dark:border-gray-700">
                                  <button onClick={() => applySuggestion(suggestions[currentSuggestionIndex])} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                                    Use Suggestion
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {suggestions.length > 1 && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                            <button
                              onClick={() => setCurrentSuggestionIndex(prev => prev - 1)}
                              disabled={currentSuggestionIndex === 0}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            >
                              Previous
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Suggestion {currentSuggestionIndex + 1} of {suggestions.length}
                            </span>
                            <button
                              onClick={() => setCurrentSuggestionIndex(prev => prev + 1)}
                              disabled={currentSuggestionIndex === suggestions.length - 1}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                    Responsibilities
                  </label>
                  <RichTextEditor
                    value={form.responsibilities}
                    onChange={(content: string) => {
                      const event = {
                        target: {
                          name: "responsibilities",
                          value: content,
                        },
                      } as any;
                      handleChange(event);
                    }}
                    placeholder="List key responsibilities and day-to-day activities..."
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                    Requirements *
                  </label>
                  <RichTextEditor
                    value={form.requirements}
                    onChange={(content: string) => {
                      const event = {
                        target: {
                          name: "requirements",
                          value: content,
                        },
                      } as any;
                      handleChange(event);
                    }}
                    placeholder="List qualifications, education, and experience requirements..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Currency
                    </label>
                    <Select
                      name="salary_currency"
                      value={form.salary_currency}
                      onChange={handleChange}
                      options={[
                        { value: "USD", label: "USD" },
                        { value: "EUR", label: "EUR" },
                        { value: "GBP", label: "GBP" },
                        { value: "INR", label: "INR" },
                        { value: "CAD", label: "CAD" },
                        { value: "AUD", label: "AUD" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Min Salary *
                    </label>
                    <Input
                      name="salary_min"
                      type="number"
                      value={form.salary_min}
                      onChange={handleChange}
                      placeholder="80000"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Max Salary *
                    </label>
                    <Input
                      name="salary_max"
                      type="number"
                      value={form.salary_max}
                      onChange={handleChange}
                      placeholder="150000"
                      required
                    />
                  </div>

                </div>
              </div>
            )}


            {/* STEP 1: SKILLS & CATEGORIES */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-3 block">
                    Required Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <SkillSearch
                        skill={skillInput}
                        onChange={(s) => {
                          if (s) {
                            if (s.id > 0) {
                              if (s.skillName) {
                                const currentSkills = form.required_skills
                                  ? form.required_skills
                                    .split(",")
                                    .filter(Boolean)
                                    .map((x) => x.trim())
                                  : [];
                                if (!currentSkills.includes(s.skillName)) {
                                  currentSkills.push(s.skillName);
                                  handleChange({
                                    target: {
                                      name: "required_skills",
                                      value: currentSkills.join(","),
                                    },
                                  } as any);
                                }
                              }
                              setSkillInput("");
                            } else {
                              setSkillInput(s.skillName);
                            }
                          } else {
                            setSkillInput("");
                          }
                        }}
                        placeholder="Add required skill"
                        renderInput={({
                          value,
                          onChange: rOnChange,
                          onFocus,
                          onBlur,
                          onKeyDown,
                        }) => (
                          <input
                            type="text"
                            value={value}
                            onChange={rOnChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyDown={(e) => {
                              onKeyDown(e);
                              if (e.key === "Enter" && !e.defaultPrevented) {
                                e.preventDefault();
                                if (
                                  skillInput.trim() &&
                                  (!form.required_skills ||
                                    !form.required_skills
                                      .split(",")
                                      .map((s) => s.trim())
                                      .includes(skillInput.trim()))
                                ) {
                                  const currentSkills = form.required_skills
                                    ? form.required_skills
                                      .split(",")
                                      .filter(Boolean)
                                      .map((x) => x.trim())
                                    : [];
                                  currentSkills.push(skillInput.trim());
                                  handleChange({
                                    target: {
                                      name: "required_skills",
                                      value: currentSkills.join(","),
                                    },
                                  } as any);
                                  setSkillInput("");
                                }
                              }
                            }}
                            placeholder="Add required skill (e.g. React) and press Enter"
                            className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                          />
                        )}
                      />
                    </div>
                  </div>
                  {form.required_skills && (
                    <div className="flex flex-wrap gap-2">
                      {form.required_skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((skill) => (
                          <SkillTag
                            key={skill}
                            skill={skill}
                            onRemove={() => {
                              const updated = form.required_skills
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s !== skill)
                                .join(", ");
                              setForm((p) => ({
                                ...p,
                                required_skills: updated,
                              }));
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-3 block">
                    Preferred Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <SkillSearch
                        skill={prefSkillInput}
                        onChange={(s) => {
                          if (s) {
                            if (s.id > 0) {
                              if (s.skillName) {
                                const currentSkills = form.preferred_skills
                                  ? form.preferred_skills
                                    .split(",")
                                    .filter(Boolean)
                                    .map((x) => x.trim())
                                  : [];
                                if (!currentSkills.includes(s.skillName)) {
                                  currentSkills.push(s.skillName);
                                  handleChange({
                                    target: {
                                      name: "preferred_skills",
                                      value: currentSkills.join(","),
                                    },
                                  } as any);
                                }
                              }
                              setPrefSkillInput("");
                            } else {
                              setPrefSkillInput(s.skillName);
                            }
                          } else {
                            setPrefSkillInput("");
                          }
                        }}
                        placeholder="Add preferred skill"
                        renderInput={({
                          value,
                          onChange: rOnChange,
                          onFocus,
                          onBlur,
                          onKeyDown,
                        }) => (
                          <input
                            type="text"
                            value={value}
                            onChange={rOnChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyDown={(e) => {
                              onKeyDown(e);
                              if (e.key === "Enter" && !e.defaultPrevented) {
                                e.preventDefault();
                                if (
                                  prefSkillInput.trim() &&
                                  (!form.preferred_skills ||
                                    !form.preferred_skills
                                      .split(",")
                                      .map((s) => s.trim())
                                      .includes(prefSkillInput.trim()))
                                ) {
                                  const currentSkills = form.preferred_skills
                                    ? form.preferred_skills
                                      .split(",")
                                      .filter(Boolean)
                                      .map((x) => x.trim())
                                    : [];
                                  currentSkills.push(prefSkillInput.trim());
                                  handleChange({
                                    target: {
                                      name: "preferred_skills",
                                      value: currentSkills.join(","),
                                    },
                                  } as any);
                                  setPrefSkillInput("");
                                }
                              }
                            }}
                            placeholder="Add preferred skill and press Enter"
                            className="w-full px-4 py-2 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white"
                          />
                        )}
                      />
                    </div>
                  </div>
                  {form.preferred_skills && (
                    <div className="flex flex-wrap gap-2">
                      {form.preferred_skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((skill) => (
                          <SkillTag
                            key={skill}
                            skill={skill}
                            onRemove={() => {
                              const updated = form.preferred_skills
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s !== skill)
                                .join(", ");
                              setForm((p) => ({
                                ...p,
                                preferred_skills: updated,
                              }));
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-3 block">
                    Categories/Keywords
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        e.key === "Enter" && (e.preventDefault(), addCategory())
                      }
                      placeholder="Add category and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                    >
                      Add
                    </button>
                  </div>
                  {form.categories && (
                    <div className="flex flex-wrap gap-2">
                      {form.categories
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean)
                        .map((cat) => (
                          <SkillTag
                            key={cat}
                            skill={cat}
                            onRemove={() => removeCategory(cat)}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* STEP 4: REVIEW */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Review Your Job Posting
                  </h3>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Title
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {form.title || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Company
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {form.company_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Location
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {form.city}, {form.state && `${form.state}, `}
                        {form.country}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Job Type
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {form.job_type.replace("_", " ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Experience Level
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {form.experience_level}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Remote
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {form.is_remote ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Salary Range
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {form.salary_currency} {form.salary_min || "0"} -{" "}
                        {form.salary_max || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <label className="flex items-center gap-3 cursor-pointer group border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-green-500 checked:bg-green-500 focus:ring-2 focus:ring-green-500/20 transition-all dark:border-gray-600 dark:bg-gray-700"
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
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Publish Immediately
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      The job will be visible to candidates right away
                    </p>
                  </div>
                </label>
              </div>
            )}
          </motion.div>
        </div>

        {/* LIVE PREVIEW SECTION */}
        <div className="hidden lg:block">
          <div className="sticky top-20 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-sm">
            {/* <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Live Preview
            </h3> */}

            <div className="space-y-4">
              {/* Title & Company */}
              {form.title && (
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {form.title}
                  </h4>
                  {form.company_name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {form.company_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {form.city}
                    {form.state && `, ${form.state}`}
                  </p>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {form.job_type && (
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                    {form.job_type.replace("_", " ").toUpperCase()}
                  </div>
                )}
                {form.experience_level && (
                  <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full capitalize">
                    {form.experience_level}
                  </div>
                )}
                {form.is_remote && (
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                    Remote
                  </div>
                )}
              </div>

              {/* Salary */}
              {form.salary_min || form.salary_max ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Salary Range
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {form.salary_currency} {form.salary_min || "0"} -{" "}
                    {form.salary_max || "0"}
                  </p>
                </div>
              ) : null}

              {/* Required Skills */}
              {form.required_skills && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.required_skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 6)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    {form.required_skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean).length > 6 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                          +
                          {form.required_skills
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean).length - 6}
                        </span>
                      )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {form.categories && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.categories
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              {form.description && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Description
                  </p>
                  <div
                    className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 prose dark:prose-invert max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: form.description }}
                  />
                </div>
              )}

              {/* Responsibilities */}
              {form.responsibilities && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Responsibilities
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 whitespace-pre-wrap">
                    {form.responsibilities}
                  </p>
                </div>
              )}

              {/* Completion Progress */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Form Completion
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10">
                    {completionPercent}%
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${form.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {form.is_active ? "Will be published" : "Draft mode"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {step === 3 ? "Publish Job" : "Next Step"}
              {step === 3 ? <Plus size={16} /> : <ChevronRight size={16} />}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
