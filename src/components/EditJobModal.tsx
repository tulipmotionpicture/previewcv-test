"use client";

import { useState, useEffect } from "react";
import { Job } from "@/types/api";
import Button from "./ui/Button";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobId: number, data: Partial<Job>) => Promise<void>;
  job: Job | null;
}

export default function EditJobModal({
  isOpen,
  onClose,
  onSave,
  job,
}: EditJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
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
    required_skills: [] as string[],
    preferred_skills: [] as string[],
    categories: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        company_name: job.company_name || "",
        location: job.location || "",
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
        required_skills: job.required_skills || [],
        preferred_skills: job.preferred_skills || [],
        categories: job.categories || [],
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
        location: formData.location,
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
        required_skills:
          formData.required_skills.length > 0
            ? formData.required_skills
            : undefined,
        preferred_skills:
          formData.preferred_skills.length > 0
            ? formData.preferred_skills
            : undefined,
        categories:
          formData.categories.length > 0 ? formData.categories : undefined,
      };

      await onSave(job.id, updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update job:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (type: "required" | "preferred") => {
    const input =
      type === "required" ? requiredSkillInput : preferredSkillInput;
    if (!input.trim()) return;

    if (type === "required") {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, input.trim()],
      });
      setRequiredSkillInput("");
    } else {
      setFormData({
        ...formData,
        preferred_skills: [...formData.preferred_skills, input.trim()],
      });
      setPreferredSkillInput("");
    }
  };

  const removeSkill = (type: "required" | "preferred", index: number) => {
    if (type === "required") {
      setFormData({
        ...formData,
        required_skills: formData.required_skills.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        preferred_skills: formData.preferred_skills.filter(
          (_, i) => i !== index
        ),
      });
    }
  };

  const addCategory = () => {
    if (!categoryInput.trim()) return;
    setFormData({
      ...formData,
      categories: [...formData.categories, categoryInput.trim()],
    });
    setCategoryInput("");
  };

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index),
    });
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Job Posting
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Job Type
              </label>
              <select
                value={formData.job_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    job_type: e.target.value as Job["job_type"],
                  })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Experience Level
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience_level: e.target.value as Job["experience_level"],
                  })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_remote"
                checked={formData.is_remote}
                onChange={(e) =>
                  setFormData({ ...formData, is_remote: e.target.checked })
                }
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
              />
              <label
                htmlFor="is_remote"
                className="text-sm font-bold text-gray-900 dark:text-gray-100"
              >
                Remote Position
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-bold text-gray-900 dark:text-gray-100"
              >
                Active
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Min Salary
              </label>
              <input
                type="number"
                value={formData.salary_min}
                onChange={(e) =>
                  setFormData({ ...formData, salary_min: e.target.value })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
                placeholder="80000"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Max Salary
              </label>
              <input
                type="number"
                value={formData.salary_max}
                onChange={(e) =>
                  setFormData({ ...formData, salary_max: e.target.value })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
                placeholder="120000"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                Currency
              </label>
              <input
                type="text"
                value={formData.salary_currency}
                onChange={(e) =>
                  setFormData({ ...formData, salary_currency: e.target.value })
                }
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100"
                placeholder="USD"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              rows={3}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Responsibilities
            </label>
            <textarea
              value={formData.responsibilities}
              onChange={(e) =>
                setFormData({ ...formData, responsibilities: e.target.value })
              }
              rows={3}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 dark:hover:bg-gray-750 transition-all font-medium text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Required Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={requiredSkillInput}
                onChange={(e) => setRequiredSkillInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addSkill("required"))
                }
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm text-gray-900 dark:text-gray-100"
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={() => addSkill("required")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("required", index)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Preferred Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={preferredSkillInput}
                onChange={(e) => setPreferredSkillInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addSkill("preferred"))
                }
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm text-gray-900 dark:text-gray-100"
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={() => addSkill("preferred")}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferred_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("preferred", index)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
              Categories
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCategory())
                }
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm text-gray-900 dark:text-gray-100"
                placeholder="Add a category and press Enter"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
