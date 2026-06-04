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
import { JobSearch, SkillSearch } from "../masters";
import { JobTitle } from "@/types/masters";
import { JobContentVariant } from "@/types/api";
import { getCurrencyOptions } from "@/lib/salary";
import { recruiterNeedsVerification } from "@/lib/recruiterVerification";

const STEPS = [
  "Core Details",
  "Description",
  "Skills & Categories",
  "Review & Publish",
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "entry", label: "Entry Level (0-1 years)" },
  { value: "junior", label: "Junior (1-3 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior (5-10 years)" },
  { value: "lead", label: "Lead (10+ years)" },
  { value: "director", label: "Director" },
  { value: "executive", label: "Executive" },
];

const experienceLevelLabel = (value: string) =>
  EXPERIENCE_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;

// Guided context questions shown one-at-a-time before AI generation, so the
// model gets the recruiter's own framing for each section of the job post.
const CONTEXT_STEPS = [
  {
    key: "description",
    label: "Describe the role",
    placeholder:
      "e.g. We're hiring a senior backend engineer to own our payments platform — high ownership, small team, lots of autonomy.",
    hint: "A few sentences on what this role is really about — the mission, team, and what makes it interesting.",
  },
  {
    key: "responsibilities",
    label: "Key responsibilities",
    placeholder:
      "e.g. Design and ship payment APIs, mentor two junior engineers, own on-call for the billing service.",
    hint: "What will this person actually do day-to-day? List the things that matter most.",
  },
  {
    key: "requirements",
    label: "Must-have requirements",
    placeholder:
      "e.g. 5+ years in Go or Java, experience with distributed systems, worked on payment or fintech products.",
    hint: "The non-negotiables — experience, background, or qualifications a candidate must have.",
  },
  {
    key: "skills",
    label: "Important skills & tools",
    placeholder:
      "e.g. Go, PostgreSQL, Kafka, AWS, strong system-design skills, clear written communication.",
    hint: "Specific technologies, tools, or strengths you want the AI to emphasise.",
  },
] as const;

type ContextKey = (typeof CONTEXT_STEPS)[number]["key"];

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
  jobToEdit?: any;
  onSuccess?: () => void;
}

export default function JobCreationPage({
  onNavigateToPricing,
  jobToEdit,
  onSuccess,
}: JobCreationProps = {}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { recruiter } = useRecruiterAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<JobFormState>(() => {
    if (jobToEdit) {
      return {
        title: jobToEdit.title || "",
        company_name: jobToEdit.company_name || "",
        country: jobToEdit.country || "",
        state: jobToEdit.state || "",
        city: jobToEdit.city || "",
        job_type: jobToEdit.job_type || "full_time",
        experience_level: jobToEdit.experience_level || "entry",
        is_remote: jobToEdit.is_remote || false,
        salary_min: jobToEdit.salary_min ? String(jobToEdit.salary_min) : "",
        salary_max: jobToEdit.salary_max ? String(jobToEdit.salary_max) : "",
        salary_currency: jobToEdit.salary_currency || "USD",
        salary_type: jobToEdit.salary_type || "yearly",
        description: jobToEdit.description || "",
        requirements: jobToEdit.requirements || "",
        responsibilities: jobToEdit.responsibilities || "",
        required_skills: jobToEdit.required_skills?.join(", ") || "",
        preferred_skills: jobToEdit.preferred_skills?.join(", ") || "",
        categories: jobToEdit.categories?.join(", ") || "",
        is_active: jobToEdit.is_active ?? true,
      };
    }
    return JOB_FORM_INITIAL;
  });
  const [categoryInput, setCategoryInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState(jobToEdit?.title || "");
  const [selectedJobTitleId, setSelectedJobTitleId] = useState<number | null>(null);
  // Old "Get Suggestions" state — retired with the AI generate-content flow (see below).
  // const [showSuggestions, setShowSuggestions] = useState(false);
  // const [suggestions, setSuggestions] = useState<any[]>([]);
  // const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  // const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [companyInput, setCompanyInput] = useState(jobToEdit?.company_name || "");
  const [skillInput, setSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");

  // --- AI content generation (POST /api/v1/recruiters/jobs/generate-content) ---
  type GenPhase = "currency" | "context" | "generating" | "variants" | "error";
  const [showGenModal, setShowGenModal] = useState(false);
  const [genPhase, setGenPhase] = useState<GenPhase>("currency");
  const [genCurrency, setGenCurrency] = useState(form.salary_currency || "USD");
  const [variants, setVariants] = useState<JobContentVariant[]>([]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [genError, setGenError] = useState("");
  const [genMsgIndex, setGenMsgIndex] = useState(0);

  // Guided context inputs collected between the currency and generating phases.
  const [ctxStep, setCtxStep] = useState(0);
  const [genCtx, setGenCtx] = useState<Record<ContextKey, string>>({
    description: "",
    responsibilities: "",
    requirements: "",
    skills: "",
  });

  const GEN_MESSAGES = [
    "Analyzing the role…",
    "Drafting 3 tailored variants…",
    "Writing responsibilities & requirements…",
    "Estimating a fair salary range…",
    "Polishing the final wording…",
    "Almost there…",
  ];

  // Cycle the loading status message while a generation request is in flight.
  React.useEffect(() => {
    if (!showGenModal || genPhase !== "generating") return;
    const id = setInterval(() => {
      setGenMsgIndex((i) => (i + 1) % GEN_MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, [showGenModal, genPhase, GEN_MESSAGES.length]);

  // Full ISO 4217 currency list for the currency dropdowns (computed once).
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  // For a NEW job, pre-fill Company Name from the recruiter's /me profile:
  // individual recruiters → their full name, company recruiters → company name.
  // Edit mode or an already-typed value is left untouched.
  React.useEffect(() => {
    if (jobToEdit || form.company_name) return;
    const prefill =
      recruiter?.recruiter_type === "individual"
        ? recruiter?.full_name
        : recruiter?.recruiter_type === "company"
          ? recruiter?.company_name
          : recruiter?.company_name || recruiter?.full_name;
    if (prefill) {
      setForm((p) => ({ ...p, company_name: prefill }));
      setCompanyInput(prefill);
    }
  }, [recruiter, jobToEdit]);

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

  // ----------------------------------------------------------------------------
  // OLD "Get Suggestions" wiring — replaced by the AI generate-content flow below.
  // Previously fetched canned suggestions from GET
  // /api/v1/job-descriptions/by-title/{id}. Kept (commented) for reference.
  // ----------------------------------------------------------------------------
  /*
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
  */

  // Convert plain text ("\n" newlines, "- "/"• " bullets) into simple HTML for the
  // TipTap RichTextEditor (which stores/renders HTML).
  const generatedTextToHtml = (text?: string | null) => {
    if (!text) return "";
    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const lines = text.split("\n").map((l) => l.trim());
    let html = "";
    let inList = false;
    for (const line of lines) {
      if (!line) {
        if (inList) { html += "</ul>"; inList = false; }
        continue;
      }
      if (/^[-•]\s+/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${escape(line.replace(/^[-•]\s+/, ""))}</li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p>${escape(line)}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html;
  };

  // Open the generation modal — but first validate the Step-1 inputs the API needs.
  const openGenerate = () => {
    const missing = !form.title.trim()
      ? { field: "title", message: "Please enter a job title in Step 1 first." }
      : !form.company_name.trim()
        ? { field: "company_name", message: "Please enter a company name in Step 1 first." }
        : !form.job_type
          ? { field: "job_type", message: "Please select a job type in Step 1 first." }
          : !form.experience_level
            ? { field: "experience_level", message: "Please select an experience level in Step 1 first." }
            : null;
    if (missing) {
      showToast(missing.message, "error");
      setStep(0);
      focusField(missing.field);
      return;
    }
    setGenCurrency(form.salary_currency || "USD");
    setGenError("");
    setVariants([]);
    setCtxStep(0);
    setGenCtx({ description: "", responsibilities: "", requirements: "", skills: "" });
    setGenPhase("currency");
    setShowGenModal(true);
  };

  // Call generate-content with the confirmed currency. May take a while.
  const runGenerate = async () => {
    setGenError("");
    setGenMsgIndex(0);
    setGenPhase("generating");
    setForm((p) => ({ ...p, salary_currency: genCurrency }));
    try {
      const res = await api.generateJobContent({
        job_title: form.title,
        company_name: form.company_name,
        job_type: form.job_type,
        experience_level: form.experience_level,
        is_remote: form.is_remote,
        salary_currency: genCurrency,
        description_context: genCtx.description.trim(),
        responsibilities_context: genCtx.responsibilities.trim(),
        requirements_context: genCtx.requirements.trim(),
        skills_context: genCtx.skills.trim(),
      });
      const list = res?.variants || [];
      if (!list.length) {
        setGenError("No content was generated. Please try again.");
        setGenPhase("error");
        return;
      }
      setVariants(list);
      setVariantIndex(0);
      setGenPhase("variants");
    } catch (e: any) {
      console.error(e);
      setGenError(e?.message || "Failed to generate content. Please try again.");
      setGenPhase("error");
    }
  };

  // Apply the chosen variant — OVERWRITE the Step 2 + Step 3 fields.
  const applyVariant = (v: JobContentVariant) => {
    setForm((prev) => ({
      ...prev,
      description: generatedTextToHtml(v.description),
      responsibilities: generatedTextToHtml(v.responsibilities),
      requirements: generatedTextToHtml(v.requirements),
      salary_currency: v.salary_currency || prev.salary_currency,
      salary_min: v.salary_min != null ? String(v.salary_min) : "",
      salary_max: v.salary_max != null ? String(v.salary_max) : "",
      salary_type:
        (v.salary_type as JobFormState["salary_type"]) || "yearly",
      required_skills: (v.required_skills || []).join(", "),
      preferred_skills: (v.preferred_skills || []).join(", "),
      categories: (v.categories || []).join(", "),
    }));
    setShowGenModal(false);
    showToast("Content applied — review Step 2 & Step 3.", "success");
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

  // Rich-text fields render as HTML; treat tag-only/whitespace content as empty.
  const isRichTextEmpty = (html: string) =>
    !html ||
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length === 0;

  // Count non-empty entries in a comma-separated field (skills/categories).
  const countList = (value: string) =>
    value
      ? value.split(",").map((x) => x.trim()).filter(Boolean).length
      : 0;

  // Scroll to and focus the field that failed validation so the user's
  // attention is drawn to it. Each field's wrapper carries id={`field-<key>`};
  // we focus the first focusable element inside it (input/select/textarea or
  // the rich-text editor's contenteditable area).
  const focusField = (field: string) => {
    if (typeof window === "undefined") return;
    // Defer so any step change has rendered the target before we focus it.
    setTimeout(() => {
      const wrapper = document.getElementById(`field-${field}`);
      if (!wrapper) return;
      wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = wrapper.querySelector<HTMLElement>(
        'input, select, textarea, [contenteditable="true"], .ProseMirror',
      );
      focusable?.focus();
    }, 60);
  };

  type StepError = { field: string; message: string };

  // Returns the first validation error for a given step, or null if it passes.
  // Every field is mandatory except the remote-friendly checkbox and the
  // Publish-immediately toggle.
  const validateStep = (s: number): StepError | null => {
    if (s === 0) {
      if (!form.title.trim())
        return { field: "title", message: "Please enter a job title." };
      if (!form.company_name.trim())
        return { field: "company_name", message: "Please enter a company name." };
      if (!form.job_type)
        return { field: "job_type", message: "Please select a job type." };
      if (!form.experience_level)
        return { field: "experience_level", message: "Please select an experience level." };
      if (!form.country.trim())
        return { field: "country", message: "Please select a country." };
      if (!form.state.trim())
        return { field: "state", message: "Please select a state/region." };
      if (!form.city.trim())
        return { field: "city", message: "Please select a city." };
    }
    if (s === 1) {
      if (isRichTextEmpty(form.description))
        return { field: "description", message: "Please enter a job description." };
      if (isRichTextEmpty(form.responsibilities))
        return { field: "responsibilities", message: "Please enter the responsibilities." };
      if (isRichTextEmpty(form.requirements))
        return { field: "requirements", message: "Please enter the requirements." };
      if (!form.salary_type)
        return { field: "salary_type", message: "Please select a pay period." };
      if (!form.salary_currency)
        return { field: "salary_currency", message: "Please select a currency." };

      const min = Number(form.salary_min);
      const max = Number(form.salary_max);
      if (!form.salary_min.trim() || Number.isNaN(min))
        return { field: "salary_min", message: "Please enter a valid minimum salary." };
      if (min <= 0)
        return { field: "salary_min", message: "Minimum salary must be greater than 0." };
      if (!form.salary_max.trim() || Number.isNaN(max))
        return { field: "salary_max", message: "Please enter a valid maximum salary." };
      if (max <= 0)
        return { field: "salary_max", message: "Maximum salary must be greater than 0." };
      if (max < min)
        return {
          field: "salary_max",
          message: "Maximum salary must be greater than or equal to the minimum salary.",
        };
    }
    if (s === 2) {
      if (countList(form.required_skills) < 1)
        return { field: "required_skills", message: "Please add at least one required skill." };
      if (countList(form.preferred_skills) < 1)
        return { field: "preferred_skills", message: "Please add at least one preferred skill." };
      if (countList(form.categories) < 1)
        return { field: "categories", message: "Please add at least one category/keyword." };
    }
    return null;
  };

  const next = () => {
    const error = validateStep(step);
    if (error) {
      showToast(error.message, "error");
      focusField(error.field);
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    // Backstop: an unverified recruiter cannot post jobs.
    if (recruiterNeedsVerification(recruiter)) {
      showToast("Please verify your email before posting a job.", "error");
      return;
    }
    // Re-validate every data step before sending; jump to the first failing
    // step, then focus the offending field so the user sees what's missing.
    for (const s of [0, 1, 2]) {
      const error = validateStep(s);
      if (error) {
        showToast(error.message, "error");
        setStep(s);
        focusField(error.field);
        return;
      }
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

      const payload = {
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
        salary_type: form.salary_type,
        is_remote: form.is_remote,
        is_active: form.is_active,
        required_skills: requiredSkillsArray,
        preferred_skills: preferredSkillsArray,
        categories: categoriesArray,
      };

      if (jobToEdit?.id) {
        await api.updateJob(jobToEdit.id, payload as any);
        showToast("Job updated successfully 🚀", "success");
      } else {
        await api.createJob(payload);
        showToast("Job posted successfully 🚀", "success");
        // Clear form
        setForm(JOB_FORM_INITIAL);
        setStep(0);
        setCategoryInput("");
        setJobTitleInput("");
        setCompanyInput("");
        setSkillInput("");
        setPrefSkillInput("");
      }

      if (onSuccess) onSuccess();
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.detail?.message || e.message || (jobToEdit ? "Failed to update job" : "Failed to create job. Please try again.");
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderLivePreview = (isReview = false) => (
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
          <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
            {experienceLevelLabel(form.experience_level)}
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
            className={`text-sm text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none prose-sm ${!isReview ? 'line-clamp-3' : ''}`}
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
          <div
            className={`text-sm text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none prose-sm ${!isReview ? 'line-clamp-3' : ''}`}
            dangerouslySetInnerHTML={{ __html: form.responsibilities }}
          />
        </div>
      )}

      {/* Requirements */}
      {form.requirements && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2">
            Requirements
          </p>
          <div
            className={`text-sm text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none prose-sm ${!isReview ? 'line-clamp-3' : ''}`}
            dangerouslySetInnerHTML={{ __html: form.requirements }}
          />
        </div>
      )}

      {!isReview && (
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
      )}

      {/* Status */}
      {form.is_active !== undefined && (
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
      )}
    </div>
  );

  return (
    <form className="mx-auto" noValidate onSubmit={(e) => {
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
      <div className={`grid ${step < 3 ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
        {/* FORM SECTION */}
        <div className={step < 3 ? 'lg:col-span-2' : ''}>
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
                  <div id="field-title">
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

                  <div id="field-company_name">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Company Name *
                    </label>
                    {/* Locked for now — company name always comes from the prefill
                        (recruiter profile on new jobs, saved value on edit). Selection
                        will be re-enabled later. */}
                    <input
                      type="text"
                      value={companyInput || form.company_name}
                      readOnly
                      disabled
                      aria-readonly="true"
                      placeholder="e.g., Tech Corp"
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none placeholder-gray-400 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div id="field-job_type">
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

                  <div id="field-experience_level">
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
                        ...EXPERIENCE_LEVEL_OPTIONS,
                      ]}
                    />
                  </div>

                  <div id="field-country">
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

                  <div id="field-state">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      State/Region *
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

                  <div id="field-city">
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
                <div className="relative" id="field-description">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium">
                      Job Description *
                    </label>

                    <button
                      type="button"
                      onClick={openGenerate}
                      disabled={showGenModal && genPhase === "generating"}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {showGenModal && genPhase === "generating" ? (
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
                          Generating…
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4" />
                          Get Suggestions
                        </>
                      )}
                    </button>
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


                  {showGenModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-blue-600" />
                              AI Job Content
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {genPhase === "currency" && "Confirm the salary currency, then we'll draft tailored content."}
                              {genPhase === "context" && "Add a little context so the AI tailors each section to your role."}
                              {genPhase === "generating" && "Generating tailored content from your job details…"}
                              {genPhase === "variants" && "Pick a variant to fill in Step 2 & Step 3."}
                              {genPhase === "error" && "Something went wrong."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowGenModal(false)}
                            disabled={genPhase === "generating"}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                          {/* Phase: currency */}
                          {genPhase === "currency" && (
                            <div className="p-8 max-w-sm mx-auto">
                              <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                                Salary Currency
                              </label>
                              <Select
                                value={genCurrency}
                                onChange={(e) => setGenCurrency(e.target.value)}
                                options={currencyOptions}
                              />
                              <p className="text-xs text-gray-500 mt-3">
                                Next, you&apos;ll add a little context for{" "}
                                <span className="font-medium">{form.title || "this role"}</span> so the AI can tailor every section.
                              </p>
                            </div>
                          )}

                          {/* Phase: context — guided, one question at a time */}
                          {genPhase === "context" && (
                            <div className="p-8 max-w-xl mx-auto">
                              {/* Progress */}
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                  Step {ctxStep + 1} of {CONTEXT_STEPS.length}
                                </span>
                                <div className="flex gap-1.5">
                                  {CONTEXT_STEPS.map((s, i) => (
                                    <span
                                      key={s.key}
                                      className={`h-1.5 rounded-full transition-all ${
                                        i === ctxStep
                                          ? "w-6 bg-blue-600"
                                          : genCtx[CONTEXT_STEPS[i].key].trim()
                                            ? "w-1.5 bg-blue-400"
                                            : "w-1.5 bg-gray-300 dark:bg-gray-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div key={CONTEXT_STEPS[ctxStep].key} className="animate-in fade-in slide-in-from-right-4 duration-200">
                                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {CONTEXT_STEPS[ctxStep].label}
                                </h5>
                                <p className="text-xs text-gray-500 mb-3">{CONTEXT_STEPS[ctxStep].hint}</p>
                                <textarea
                                  autoFocus
                                  value={genCtx[CONTEXT_STEPS[ctxStep].key]}
                                  onChange={(e) =>
                                    setGenCtx((prev) => ({
                                      ...prev,
                                      [CONTEXT_STEPS[ctxStep].key]: e.target.value,
                                    }))
                                  }
                                  rows={6}
                                  placeholder={CONTEXT_STEPS[ctxStep].placeholder}
                                  className="w-full px-4 py-3 bg-white dark:bg-[#282727] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white resize-none"
                                />
                                <div className="mt-1.5 text-right text-xs text-gray-400">
                                  {genCtx[CONTEXT_STEPS[ctxStep].key].trim().length} characters
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Phase: generating */}
                          {genPhase === "generating" && (
                            <div className="p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[260px]">
                              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="text-base font-semibold text-gray-900 dark:text-white">{GEN_MESSAGES[genMsgIndex]}</p>
                              <p className="text-xs text-gray-500 max-w-xs">
                                Crafting 3 tailored variants — this can take up to ~30 seconds. Please keep this window open.
                              </p>
                              <div className="flex gap-1.5 mt-2">
                                {GEN_MESSAGES.map((_, i) => (
                                  <span
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === genMsgIndex ? "w-6 bg-blue-600" : "w-1.5 bg-gray-300 dark:bg-gray-600"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Phase: error */}
                          {genPhase === "error" && (
                            <div className="p-12 flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
                              <div className="text-red-600 text-sm font-medium max-w-sm">{genError || "Failed to generate content."}</div>
                              <button
                                type="button"
                                onClick={() => setGenPhase("context")}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                              >
                                Try again
                              </button>
                            </div>
                          )}

                          {/* Phase: variants */}
                          {genPhase === "variants" && variants[variantIndex] && (
                            <div className="p-6">
                              <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-semibold">
                                  {variants[variantIndex].label}
                                </span>
                                {(variants[variantIndex].salary_min != null || variants[variantIndex].salary_max != null) && (
                                  <span className="px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full text-sm font-semibold">
                                    {variants[variantIndex].salary_currency} {variants[variantIndex].salary_min ?? "—"} – {variants[variantIndex].salary_max ?? "—"} / {variants[variantIndex].salary_type}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h5>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{variants[variantIndex].description}</p>
                                </div>
                                {variants[variantIndex].responsibilities && (
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Responsibilities</h5>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{variants[variantIndex].responsibilities}</p>
                                  </div>
                                )}
                                {variants[variantIndex].requirements && (
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Requirements</h5>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{variants[variantIndex].requirements}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Required Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {(variants[variantIndex].required_skills || []).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{skill}</span>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Preferred Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {(variants[variantIndex].preferred_skills || []).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{skill}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Categories</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {(variants[variantIndex].categories || []).map((cat, i) => (
                                      <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">{cat}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="pt-6 mt-4 flex justify-center border-t border-gray-100 dark:border-gray-700">
                                  <button
                                    type="button"
                                    onClick={() => applyVariant(variants[variantIndex])}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                                  >
                                    Use this variant
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer: currency actions */}
                        {genPhase === "currency" && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setShowGenModal(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setForm((p) => ({ ...p, salary_currency: genCurrency }));
                                setCtxStep(0);
                                setGenPhase("context");
                              }}
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                            >
                              Next
                            </button>
                          </div>
                        )}

                        {/* Footer: context actions */}
                        {genPhase === "context" && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                ctxStep === 0 ? setGenPhase("currency") : setCtxStep((s) => s - 1)
                              }
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            >
                              Back
                            </button>
                            {ctxStep < CONTEXT_STEPS.length - 1 ? (
                              <button
                                type="button"
                                onClick={() => setCtxStep((s) => s + 1)}
                                disabled={!genCtx[CONTEXT_STEPS[ctxStep].key].trim()}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={runGenerate}
                                disabled={CONTEXT_STEPS.some((s) => !genCtx[s.key].trim())}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Lightbulb className="h-4 w-4" /> Generate
                              </button>
                            )}
                          </div>
                        )}

                        {/* Footer: variant carousel */}
                        {genPhase === "variants" && variants.length > 1 && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setVariantIndex((i) => Math.max(0, i - 1))}
                              disabled={variantIndex === 0}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            >
                              Previous
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Variant {variantIndex + 1} of {variants.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVariantIndex((i) => Math.min(variants.length - 1, i + 1))}
                              disabled={variantIndex === variants.length - 1}
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

                <div id="field-responsibilities">
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                    Responsibilities *
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

                <div id="field-requirements">
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

                <div className="grid md:grid-cols-4 gap-6">

                  <div id="field-salary_type">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Pay Period
                    </label>
                    <Select
                      name="salary_type"
                      value={form.salary_type}
                      onChange={handleChange}
                      options={[
                        { value: "hourly", label: "Hourly" },
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" },
                        { value: "yearly", label: "Yearly" },
                      ]}
                    />
                  </div>
                  <div id="field-salary_currency">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Currency
                    </label>
                    <Select
                      name="salary_currency"
                      value={form.salary_currency}
                      onChange={handleChange}
                      options={currencyOptions}
                    />
                  </div>
                  <div id="field-salary_min">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Min Salary *
                    </label>
                    <Input
                      name="salary_min"
                      type="number"
                      min="1"
                      value={form.salary_min}
                      onChange={handleChange}
                      placeholder="80000"
                      required
                    />
                  </div>

                  <div id="field-salary_max">
                    <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-2 block">
                      Max Salary *
                    </label>
                    <Input
                      name="salary_max"
                      type="number"
                      min="1"
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
                <div id="field-required_skills">
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-3 block">
                    Required Skills *
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

                <div id="field-preferred_skills">
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-3 block">
                    Preferred Skills *
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

                <div id="field-categories">
                  <label className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-medium mb-3 block">
                    Categories/Keywords *
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
                <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    Review Your Job Posting
                  </h3>
                  {renderLivePreview(true)}
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
        {step < 3 && (
          <div className="hidden lg:block">
            <div className="sticky top-20 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-sm">
              {/* <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Live Preview
              </h3> */}
              {renderLivePreview(false)}
            </div>
          </div>
        )}
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
              {step === 3 ? (jobToEdit ? "Save Changes" : "Publish Job") : "Next Step"}
              {step === 3 ? (jobToEdit ? <Check size={16} /> : <Plus size={16} />) : <ChevronRight size={16} />}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
