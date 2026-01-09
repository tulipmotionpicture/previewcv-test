"use client";

import { Job } from "@/types/api";

export type JobFormState = {
  title: string;
  location: string;
  job_type:
    | "full_time"
    | "part_time"
    | "contract"
    | "internship"
    | "temporary"
    | "freelance"
    | "other";
  experience_level:
    | "entry"
    | "junior"
    | "mid"
    | "senior"
    | "lead"
    | "director"
    | "executive";
  description: string;
  requirements: string;
  responsibilities: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  is_remote: boolean;
  required_skills: string;
  preferred_skills: string;
  categories: string;
};

export const JOB_FORM_INITIAL: JobFormState = {
  title: "",
  location: "",
  job_type: "full_time",
  experience_level: "entry",
  description: "",
  requirements: "",
  responsibilities: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
  is_remote: false,
  required_skills: "",
  preferred_skills: "",
  categories: "",
};

interface JobManagementProps {
  jobs: Job[];
  loadingJobs: boolean;
  jobForm: JobFormState;
  creatingJob: boolean;
  onJobFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onCreateJob: (e: React.FormEvent) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: number) => void;
  onViewApplications: (jobId: number) => void;
}

export default function JobManagement({
  jobs,
  loadingJobs,
  jobForm,
  creatingJob,
  onJobFormChange,
  onCreateJob,
  onEditJob,
  onDeleteJob,
  onViewApplications,
}: JobManagementProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-10">
        Manage Career Opportunities
      </h1>

      {/* Create Job Form */}
      <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
          Post New Opportunity
        </h3>
        <form onSubmit={onCreateJob} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="title"
              value={jobForm.title}
              onChange={onJobFormChange}
              placeholder="Job Title"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <input
              name="location"
              value={jobForm.location}
              onChange={onJobFormChange}
              placeholder="Location (e.g. Remote)"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <select
              name="job_type"
              value={jobForm.job_type}
              onChange={onJobFormChange}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
              <option value="freelance">Freelance</option>
              <option value="other">Other</option>
            </select>
            <select
              name="experience_level"
              value={jobForm.experience_level}
              onChange={onJobFormChange}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
            >
              <option value="entry">Entry</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="director">Director</option>
              <option value="executive">Executive</option>
            </select>
            <select
              name="salary_currency"
              value={jobForm.salary_currency}
              onChange={onJobFormChange}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="number"
              name="salary_min"
              value={jobForm.salary_min}
              onChange={onJobFormChange}
              placeholder="Minimum Salary"
              min="0"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              type="number"
              name="salary_max"
              value={jobForm.salary_max}
              onChange={onJobFormChange}
              placeholder="Maximum Salary"
              min="0"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="is_remote"
              checked={jobForm.is_remote}
              onChange={onJobFormChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Position is remote-friendly
          </label>

          <div>
            <textarea
              name="description"
              value={jobForm.description}
              onChange={onJobFormChange}
              placeholder="Describe the opportunity, team, and impact."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <textarea
              name="requirements"
              value={jobForm.requirements}
              onChange={onJobFormChange}
              placeholder="Core qualifications or requirements (comma or line separated)."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              rows={3}
            />
            <textarea
              name="responsibilities"
              value={jobForm.responsibilities}
              onChange={onJobFormChange}
              placeholder="Key responsibilities or day-to-day expectations."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              name="required_skills"
              value={jobForm.required_skills}
              onChange={onJobFormChange}
              placeholder="Required skills (comma separated)"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              name="preferred_skills"
              value={jobForm.preferred_skills}
              onChange={onJobFormChange}
              placeholder="Preferred skills (comma separated)"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              name="categories"
              value={jobForm.categories}
              onChange={onJobFormChange}
              placeholder="Categories or tags (comma separated)"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creatingJob}
              className="px-6 py-3 bg-gray-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all disabled:opacity-70"
            >
              {creatingJob ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </section>

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-6">
        {loadingJobs ? (
          <div className="text-center py-10">Loading jobs...</div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-1 uppercase tracking-tight">
                  {job.title}
                </h4>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-tight">
                  {job.location} • {job.job_type.replace("_", " ")} •
                  <span
                    className={`ml-1 ${
                      job.status === "active"
                        ? "text-green-600"
                        : job.status === "closed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {job.status
                      ? job.status.charAt(0).toUpperCase() + job.status.slice(1)
                      : "Unknown"}
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onEditJob(job)}
                  className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-100 transition-colors"
                  title="Edit Job"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteJob(job.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100 transition-colors"
                  title="Delete Job"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onViewApplications(job.id)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                >
                  View Applications
                </button>
              </div>
            </div>
          ))
        )}
        {!loadingJobs && jobs.length === 0 && (
          <p className="text-gray-400 text-center">No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
}
