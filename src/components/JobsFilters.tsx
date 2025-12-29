import React from "react";

export default function JobsFilters() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">
        Advanced Filters
      </h2>
      <div className="flex flex-col gap-8">
        {/* Industry Filter */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Industry</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" /> IT &
              Software
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" />{" "}
              Construction
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" /> Real
              Estate
            </label>
            {/* Add more industries as needed */}
          </div>
        </div>
        {/* Job Titles Filter */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Job Titles</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" /> Full
              Stack Developer
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" />{" "}
              Frontend Engineer
            </label>
            {/* Add more job titles as needed */}
          </div>
        </div>
        {/* Experience Level Filter */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Experience Level</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" /> Fresh
              / Intern
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="form-checkbox rounded" /> 1-3
              Years
            </label>
            {/* Add more experience levels as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
