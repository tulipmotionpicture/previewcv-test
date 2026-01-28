import React from "react";
import { api } from "@/lib/api";

type JobsFiltersProps = {
  selectedFilters: Record<string, string[]>;
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
};

type FilterOption = { name: string; value: string; count: number };
type FilterResponse = {
  filters: Record<string, FilterOption[]>;
};

function JobsFilters({
  selectedFilters,
  setSelectedFilters,
}: JobsFiltersProps) {
  const [filters, setFilters] = React.useState<
    FilterResponse["filters"] | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // Track which filter sections are expanded
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});

  // No jobs API call here; handled by parent
  React.useEffect(() => {
    async function fetchFilters() {
      try {
        const response = await api.getJobFilters();
        // Ensure every filter option has a 'value' property
        const normalizedFilters: Record<string, FilterOption[]> = {};
        Object.entries(response.filters).forEach(([key, options]) => {
          if (Array.isArray(options)) {
            normalizedFilters[key] = options.map((opt) => ({
              name: opt.name,
              value: opt.value !== undefined ? opt.value : opt.name,
              count: opt.count,
            }));
          }
        });
        setFilters(normalizedFilters);

        // Initialize all sections as expanded by default
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(normalizedFilters).forEach((key) => {
          initialExpanded[key] = true;
        });
        setExpandedSections(initialExpanded);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchFilters();
  }, []);

  const toggleSection = (filterKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  // Count selected filters for a section
  const getSelectedCount = (filterKey: string) => {
    return Array.isArray(selectedFilters[filterKey])
      ? selectedFilters[filterKey].length
      : 0;
  };

  // Count total applied filters
  const getTotalAppliedCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, arr) => total + (Array.isArray(arr) ? arr.length : 0),
      0
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            All Filters
          </h2>
          {getTotalAppliedCount() > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Applied ({getTotalAppliedCount()})
            </span>
          )}
        </div>
        {Object.values(selectedFilters).some((arr) => arr.length > 0) && (
          <button
            onClick={() => setSelectedFilters({})}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      {loading && <div className="text-sm text-gray-500">Loading filters...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {!loading && !error && filters && (
        <div className="flex flex-col gap-1">
          {Object.entries(filters).map(([filterKey, options]) => {
            const isExpanded = expandedSections[filterKey];
            const selectedCount = getSelectedCount(filterKey);

            return (
              <div key={filterKey} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                {/* Filter Header - Clickable */}
                <button
                  onClick={() => toggleSection(filterKey)}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {filterKey
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>
                    {selectedCount > 0 && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Filter Options - Collapsible */}
                {isExpanded && (
                  <div className="pb-3 flex flex-col gap-2">
                    {Array.isArray(options) &&
                      options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30 px-1 py-1 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="form-checkbox rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            checked={
                              Array.isArray(selectedFilters[filterKey]) &&
                              selectedFilters[filterKey].includes(opt.value)
                            }
                            onChange={() => {
                              setSelectedFilters((prev) => {
                                const prevArr = Array.isArray(prev[filterKey])
                                  ? prev[filterKey]
                                  : [];
                                const alreadySelected = prevArr.includes(opt.value);
                                return {
                                  ...prev,
                                  [filterKey]: alreadySelected
                                    ? prevArr.filter((v) => v !== opt.value)
                                    : [...prevArr, opt.value],
                                };
                              });
                            }}
                          />
                          <span className="flex-1">{opt.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({opt.count})
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobsFilters;
