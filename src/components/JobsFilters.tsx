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

  // No jobs API call here; handled by parent
  React.useEffect(() => {
    async function fetchFilters() {
      try {
        const response = await api.getJobFilters();
        // Ensure every filter option has a 'value' property
        const normalizedFilters: Record<string, FilterOption[]> = {};
        Object.entries(response.filters).forEach(([key, options]) => {
          normalizedFilters[key] = (options as FilterOption[]).map((opt) => ({
            name: opt.name,
            value: opt.value !== undefined ? opt.value : opt.name,
            count: opt.count,
          }));
        });
        setFilters(normalizedFilters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchFilters();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-900">
        Advanced Filters
      </h2>
      {loading && <div>Loading filters...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && filters && (
        <div className="flex flex-col gap-8">
          {Object.entries(filters).map(([filterKey, options]) => (
            <div key={filterKey}>
              <h3 className="font-semibold mb-3 text-gray-800">
                {filterKey
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h3>
              <div className="flex flex-col gap-3">
                {Array.isArray(options) &&
                  options.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox rounded"
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
                      {opt.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({opt.count})
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsFilters;
