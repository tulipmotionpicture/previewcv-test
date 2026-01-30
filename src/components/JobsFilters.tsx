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
  location_hierarchy?: Record<string, any>;
};

function JobsFilters({
  selectedFilters,
  setSelectedFilters,
}: JobsFiltersProps) {
  const [filters, setFilters] = React.useState<
    FilterResponse["filters"] | null
  >(null);
  const [locationHierarchy, setLocationHierarchy] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});
  // Track how many items to show for each filter section
  const [visibleItems, setVisibleItems] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    async function fetchFilters() {
      try {
        const response = await api.getJobFilters();
        const rawFilters = response.filters as any;

        // Extract hierarchy if it exists inside filters
        const hierarchy = rawFilters.location_hierarchy ||
          response.location_hierarchy ||
          {};

        setLocationHierarchy(hierarchy);

        const normalizedFilters: Record<string, FilterOption[]> = {};
        Object.entries(response.filters).forEach(([key, options]) => {
          // Skip the location_hierarchy object itself and the "locations" filter
          if (Array.isArray(options) && key !== "locations") {
            normalizedFilters[key] = options.map((opt) => ({
              name: opt.name,
              value: opt.value !== undefined ? opt.value : opt.name,
              count: opt.count,
            }));
          }
        });
        setFilters(normalizedFilters);

        const initialExpanded: Record<string, boolean> = {};
        const initialVisible: Record<string, number> = {};
        Object.keys(normalizedFilters).forEach((key) => {
          initialExpanded[key] = true;
          initialVisible[key] = 10;
        });
        setExpandedSections(initialExpanded);
        setVisibleItems(initialVisible);
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

  const getSelectedCount = (filterKey: string) => {
    return Array.isArray(selectedFilters[filterKey])
      ? selectedFilters[filterKey].length
      : 0;
  };

  const getTotalAppliedCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, arr) => total + (Array.isArray(arr) ? arr.length : 0),
      0
    );
  };

  const handleShowMore = (filterKey: string) => {
    setVisibleItems(prev => ({
      ...prev,
      [filterKey]: (prev[filterKey] || 10) + 10
    }));
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

            // Filter options based on dependent selections (Location Hierarchy)
            let filteredOptions = [...options];

            if (filterKey === "states" && selectedFilters["countries"]?.length > 0) {
              const selectedCountries = selectedFilters["countries"];
              const validStates = new Set<string>();
              selectedCountries.forEach(country => {
                const countryData = locationHierarchy[country];
                if (countryData?.states) {
                  Object.keys(countryData.states).forEach(state => {
                    if (state !== "_no_state") validStates.add(state);
                  });
                }
              });
              filteredOptions = options.filter(opt => validStates.has(opt.value));
            } else if (filterKey === "cities" && selectedFilters["states"]?.length > 0) {
              const selectedStates = selectedFilters["states"];
              const validCities = new Set<string>();
              selectedStates.forEach(state => {
                // Find which country this state belongs to
                Object.values(locationHierarchy).forEach(countryData => {
                  if (countryData.states?.[state]) {
                    Object.keys(countryData.states[state].cities).forEach(city => {
                      validCities.add(city);
                    });
                  }
                });
              });
              filteredOptions = options.filter(opt => validCities.has(opt.value));
            } else if (filterKey === "cities" && selectedFilters["countries"]?.length > 0 && (!selectedFilters["states"] || selectedFilters["states"].length === 0)) {
              // If country is selected but no state, show cities that belong to those countries (under _no_state or directly)
              const selectedCountries = selectedFilters["countries"];
              const validCities = new Set<string>();
              selectedCountries.forEach(country => {
                const countryData = locationHierarchy[country];
                if (countryData?.states) {
                  Object.values(countryData.states).forEach((stateData: any) => {
                    if (stateData.cities) {
                      Object.keys(stateData.cities).forEach(city => validCities.add(city));
                    }
                  });
                }
              });
              filteredOptions = options.filter(opt => validCities.has(opt.value));
            }

            // If no options after filtering (and it's a dependent field), maybe hide it or show empty
            // If no options after filtering (and it's a dependent field), maybe hide it or show empty
            if (filteredOptions.length === 0 && (filterKey === "states" || filterKey === "cities")) {
              if (filterKey === "states" && selectedFilters["countries"]?.length > 0) {
                // Check if all selected countries have NO states (only _no_state)
                const hasAnyStates = selectedFilters["countries"].some(c => {
                  const states = locationHierarchy[c]?.states;
                  return states && Object.keys(states).some(s => s !== "_no_state");
                });
                if (!hasAnyStates) return null; // Hide state filter if countries have no states
              }
              // For cities, if we have options, we show them. 
              // The logic above already filtered them correctly based on country/state selection.
              // So if length is 0 here, it truly means no cities match the current selection.
              if (filterKey === "cities" && (selectedFilters["countries"]?.length > 0 || selectedFilters["states"]?.length > 0)) {
                // If filteredOptions is empty, we can hide it or show "No cities found"
                // Returning null hides the entire section
                return null;
              }
            }

            const visibleCount = visibleItems[filterKey] || 10;
            const displayedOptions = filteredOptions.slice(0, visibleCount);
            const hasMore = filteredOptions.length > visibleCount;

            return (
              <div key={filterKey} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                <button
                  onClick={() => toggleSection(filterKey)}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""}`}
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

                {isExpanded && (
                  <div className="pb-4 flex flex-col gap-1">
                    {displayedOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30 px-2 py-1.5 rounded cursor-pointer transition-colors"
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
                              const newArr = alreadySelected
                                ? prevArr.filter((v) => v !== opt.value)
                                : [...prevArr, opt.value];

                              const newFilters = { ...prev, [filterKey]: newArr };

                              // Reset dependent filters if parent selection changes
                              if (filterKey === "country" && alreadySelected) {
                                // If unselecting a country, we might need to clear states/cities
                                // For simplicity, let parent handle data consistency or we can clear here
                              }

                              return newFilters;
                            });
                          }}
                        />
                        <span className="flex-1 truncate">{opt.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({opt.count})
                        </span>
                      </label>
                    ))}

                    {hasMore && (
                      <button
                        onClick={() => handleShowMore(filterKey)}
                        className="text-xs text-left px-2 py-2 text-blue-600 dark:text-blue-400 font-bold hover:underline mt-1"
                      >
                        + View More ({filteredOptions.length - visibleCount})
                      </button>
                    )}

                    {filteredOptions.length === 0 && (
                      <div className="text-xs text-gray-400 italic px-2 py-2">
                        No {filterKey.replace(/_/g, " ")} available for selected filters
                      </div>
                    )}
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

