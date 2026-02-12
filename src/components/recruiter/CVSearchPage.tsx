"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import {
  CVSearchResult,
  CVSearchResponse,
  CVUnlockResponse,
  CVCreditsStatus,
  BucketWithStats,
  BucketListResponse,
  SearchHistoryResponse,
  SearchHistoryItem,
  SearchResultCountTrendResponse,
  SearchHistoryTrendItem,
  CreditsBalance,
} from "@/types/api";
import {
  Search,
  Filter,
  Unlock,
  Download,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  FolderPlus,
  Plus,
  History,
  TrendingUp,
  RotateCw,
  Clock,
} from "lucide-react";

export default function CVSearchPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    skills: [] as string[],
    skills_match_all: false,
    min_experience_years: 0,
    max_experience_years: 50,
    country: "",
    state: "",
    city: "",
    job_titles: [] as string[],
    companies: [] as string[],
    education_level: "",
    degrees: [] as string[],
    languages: [] as string[],
    language_proficiency: "",
    open_to_work_only: false,
    is_currently_employed: undefined as boolean | undefined,
    page: 1,
    page_size: 20,
    sort_by: "relevance",
    sort_order: "desc",
  });

  // Input states for adding items to arrays
  const [skillInput, setSkillInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [degreeInput, setDegreeInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [searchResults, setSearchResults] = useState<CVSearchResponse | null>(
    null,
  );
  const [creditsStatus, setCreditsStatus] = useState<CVCreditsStatus | null>(
    null,
  );
  const [creditsBalance, setCreditsBalance] = useState<CreditsBalance | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [unlockedResumes, setUnlockedResumes] = useState<Set<number>>(
    new Set(),
  );
  const [selectedResumes, setSelectedResumes] = useState<Set<number>>(
    new Set(),
  );
  const [unlockingIds, setUnlockingIds] = useState<Set<number>>(new Set());

  // Bucket states
  const [buckets, setBuckets] = useState<BucketWithStats[]>([]);
  const [showBucketModal, setShowBucketModal] = useState(false);
  const [selectedBucketId, setSelectedBucketId] = useState<number | null>(null);
  const [newBucketName, setNewBucketName] = useState("");
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  const [showCreateBucket, setShowCreateBucket] = useState(false);
  const [addingToBucket, setAddingToBucket] = useState(false);

  // History & Trend states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [trendData, setTrendData] =
    useState<SearchResultCountTrendResponse | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  // Fetch credits status and buckets
  useEffect(() => {
    const fetchCreditsStatus = async () => {
      try {
        const status = await api.getCVCreditsStatus();
        setCreditsStatus(status);
      } catch (error) {
        console.error("Failed to fetch credits status:", error);
      }
    };

    const fetchCreditsBalance = async () => {
      try {
        const balance = await api.getCreditsBalance();
        setCreditsBalance(balance);
      } catch (error) {
        console.error("Failed to fetch credits balance:", error);
      }
    };

    const fetchBuckets = async () => {
      try {
        const response = await api.listBuckets({ include_archived: false });
        setBuckets(response.buckets);
      } catch (error) {
        console.error("Failed to fetch buckets:", error);
      }
    };

    fetchCreditsStatus();
    fetchCreditsBalance();
    fetchBuckets();
  }, []);

  // Search CVs
  // --- History & Trend Handlers ---
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchSearchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res: any = await api.getSearchHistory({ limit: 10 });

      // api.getSearchHistory is now normalized, but accept a few legacy shapes here as well
      let items: any[] = [];
      if (Array.isArray(res)) items = res;
      else if (res?.history && Array.isArray(res.history)) items = res.history;
      else if (res?.searches && Array.isArray(res.searches))
        items = res.searches;
      else if (res?.results && Array.isArray(res.results)) items = res.results;
      else if (res?.data && Array.isArray(res.data)) items = res.data;

      setSearchHistory(items);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Failed to fetch search history", error);
      setHistoryError("Failed to load search history. Please try again.");
      // Still show modal to show error
      setShowHistoryModal(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRerunSearch = async (historyId: number) => {
    setLoading(true);
    setShowHistoryModal(false);

    // helper to coerce arrays (API may store comma-joined strings)
    const toArray = (v: any) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    try {
      // Populate form from saved history (if available in client state)
      const saved = searchHistory.find((s) => s.id === historyId) as
        | any
        | undefined;
      if (saved?.search_filters) {
        const f = saved.search_filters || {};
        setSearchQuery(f.keyword_search || f.keyword || "");

        setFilters((prev) => ({
          ...prev,
          skills: toArray(f.skills),
          skills_match_all: !!f.skills_match_all,
          job_titles: toArray(f.job_titles),
          companies: toArray(f.companies),
          degrees: toArray(f.degrees),
          languages: toArray(f.languages),
          language_proficiency: f.language_proficiency || "",
          min_experience_years:
            typeof f.min_experience_years === "number"
              ? f.min_experience_years
              : prev.min_experience_years,
          max_experience_years:
            typeof f.max_experience_years === "number"
              ? f.max_experience_years
              : prev.max_experience_years,
          country: f.country || "",
          state: f.state || "",
          city: f.city || "",
          education_level: f.education_level || "",
          open_to_work_only: !!f.open_to_work_only,
          is_currently_employed:
            f.is_currently_employed === undefined
              ? undefined
              : !!f.is_currently_employed,
          page: f.page || 1,
          page_size: f.page_size || prev.page_size,
          sort_by: f.sort_by || prev.sort_by,
          sort_order: f.sort_order || prev.sort_order,
        }));

        // clear single-item inputs (they'll be shown from filter arrays)
        setSkillInput("");
        setJobTitleInput("");
        setCompanyInput("");
        setDegreeInput("");
        setLanguageInput("");
      }

      // Rerun on server and show results
      const res = await api.rerunSavedSearch(historyId);
      setSearchResults(res);
    } catch (error) {
      console.error("Failed to rerun search", error);
      showToast("Failed to rerun saved search.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleShowTrend = async (historyId: number) => {
    setTrendLoading(true);
    try {
      const res = await api.getSearchHistoryTrend(historyId);
      // Ensure history array exists
      const safeData = res ? { ...res, history: res.history || [] } : null;
      setTrendData(safeData);
      setShowTrendModal(true);
    } catch (error) {
      console.error("Failed to fetch trend", error);
    } finally {
      setTrendLoading(false);
    }
  };

  const handleSearch = useCallback(
    async (overrides?: Partial<typeof filters>) => {
      // Get current filters from state
      const currentFilters = filters;
      const activeFilters = overrides
        ? { ...currentFilters, ...overrides }
        : currentFilters;

      if (
        !searchQuery.trim() &&
        activeFilters.skills.length === 0 &&
        activeFilters.job_titles.length === 0
      ) {
        showToast("Please enter a search keyword or select filters", "error");
        return;
      }

      setLoading(true);

      // Update filters state immediately
      setFilters(activeFilters);

      const params: any = {
        keyword_search: searchQuery || undefined,
        skills:
          activeFilters.skills.length > 0 ? activeFilters.skills : undefined,
        skills_match_all: activeFilters.skills_match_all,
        job_titles:
          activeFilters.job_titles.length > 0
            ? activeFilters.job_titles
            : undefined,
        companies:
          activeFilters.companies.length > 0
            ? activeFilters.companies
            : undefined,
        min_experience_years: activeFilters.min_experience_years,
        max_experience_years: activeFilters.max_experience_years,
        country: activeFilters.country || undefined,
        state: activeFilters.state || undefined,
        city: activeFilters.city || undefined,
        degrees:
          activeFilters.degrees.length > 0 ? activeFilters.degrees : undefined,
        languages:
          activeFilters.languages.length > 0
            ? activeFilters.languages
            : undefined,
        language_proficiency: activeFilters.language_proficiency || undefined,
        open_to_work_only: activeFilters.open_to_work_only || undefined,
        is_currently_employed: activeFilters.is_currently_employed,
        page: activeFilters.page,
        page_size: activeFilters.page_size,
        sort_by: activeFilters.sort_by,
        sort_order: activeFilters.sort_order,
      };

      // Remove undefined values
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key],
      );

      try {
        const response = await api.searchCVs(params);
        setSearchResults(response);
      } catch (error) {
        console.error("Failed to search CVs:", error);
        showToast("Failed to search CVs. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filters, showToast],
  );

  // Unlock single resume
  const handleUnlockResume = async (resumeId: number) => {
    setUnlockingIds((prev) => new Set([...prev, resumeId]));
    try {
      await api.unlockCVProfile(resumeId, "search");
      setUnlockedResumes((prev) => new Set([...prev, resumeId]));

      // Refresh credits
      const status = await api.getCVCreditsStatus();
      setCreditsStatus(status);

      showToast("Resume unlocked successfully!", "success");
    } catch (error: any) {
      console.error("Failed to unlock resume:", error);
      showToast(
        error?.message || "Failed to unlock resume. Please try again.",
        "error",
      );
    } finally {
      setUnlockingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

  // Bulk unlock
  const handleBulkUnlock = async () => {
    if (selectedResumes.size === 0) {
      showToast("Please select resumes to unlock", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.bulkUnlockCVProfiles(
        Array.from(selectedResumes),
        "search",
      );

      // Mark as unlocked
      selectedResumes.forEach((id) => {
        setUnlockedResumes((prev) => new Set([...prev, id]));
      });
      setSelectedResumes(new Set());

      // Refresh credits
      const status = await api.getCVCreditsStatus();
      setCreditsStatus(status);

      showToast(
        `${response.unlocked_count} resumes unlocked successfully!`,
        "success",
      );
    } catch (error: any) {
      console.error("Failed to bulk unlock:", error);
      showToast(error?.message || "Failed to unlock resumes.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Download resume
  const handleDownloadResume = async (resumeId: number) => {
    try {
      const response = await api.downloadUnlockedResume(resumeId, "url", true);
      if (response.download_url) {
        window.open(response.download_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to download resume:", error);
      showToast("Failed to download resume.", "error");
    }
  };

  const toggleSelectResume = (resumeId: number) => {
    setSelectedResumes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resumeId)) {
        newSet.delete(resumeId);
      } else {
        newSet.add(resumeId);
      }
      return newSet;
    });
  };

  // Helper functions to add/remove array items
  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters({
        ...filters,
        skills: [...filters.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter((s) => s !== skill),
    });
  };

  const addJobTitle = () => {
    if (
      jobTitleInput.trim() &&
      !filters.job_titles.includes(jobTitleInput.trim())
    ) {
      setFilters({
        ...filters,
        job_titles: [...filters.job_titles, jobTitleInput.trim()],
      });
      setJobTitleInput("");
    }
  };

  const removeJobTitle = (title: string) => {
    setFilters({
      ...filters,
      job_titles: filters.job_titles.filter((t) => t !== title),
    });
  };

  const addCompany = () => {
    if (
      companyInput.trim() &&
      !filters.companies.includes(companyInput.trim())
    ) {
      setFilters({
        ...filters,
        companies: [...filters.companies, companyInput.trim()],
      });
      setCompanyInput("");
    }
  };

  const removeCompany = (company: string) => {
    setFilters({
      ...filters,
      companies: filters.companies.filter((c) => c !== company),
    });
  };

  const addDegree = () => {
    if (degreeInput.trim() && !filters.degrees.includes(degreeInput.trim())) {
      setFilters({
        ...filters,
        degrees: [...filters.degrees, degreeInput.trim()],
      });
      setDegreeInput("");
    }
  };

  const removeDegree = (degree: string) => {
    setFilters({
      ...filters,
      degrees: filters.degrees.filter((d) => d !== degree),
    });
  };

  const addLanguage = () => {
    if (
      languageInput.trim() &&
      !filters.languages.includes(languageInput.trim())
    ) {
      setFilters({
        ...filters,
        languages: [...filters.languages, languageInput.trim()],
      });
      setLanguageInput("");
    }
  };

  const removeLanguage = (language: string) => {
    setFilters({
      ...filters,
      languages: filters.languages.filter((l) => l !== language),
    });
  };

  // Bucket functions
  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      showToast("Please enter a bucket name", "error");
      return;
    }

    setIsCreatingBucket(true);
    try {
      const newBucket = await api.createBucket({
        name: newBucketName.trim(),
        color: "#3B82F6",
      });
      setBuckets([...buckets, newBucket]);
      setNewBucketName("");
      setShowCreateBucket(false);
      showToast("Bucket created successfully!", "success");
    } catch (error: any) {
      console.error("Failed to create bucket:", error);
      showToast(error?.message || "Failed to create bucket", "error");
    } finally {
      setIsCreatingBucket(false);
    }
  };

  const handleAddToBucket = async () => {
    if (!selectedBucketId) {
      showToast("Please select a bucket", "error");
      return;
    }
    if (selectedResumes.size === 0) {
      showToast("Please select resumes to add", "error");
      return;
    }

    setAddingToBucket(true);
    try {
      const response = await api.addResumesToBucket(selectedBucketId, {
        resume_ids: Array.from(selectedResumes),
      });

      showToast(
        `${response.data.added_count} resumes added to bucket successfully!`,
        "success",
      );
      setShowBucketModal(false);
      setSelectedResumes(new Set());

      // Refresh buckets to update counts
      const refreshed = await api.listBuckets({ include_archived: false });
      setBuckets(refreshed.buckets);
    } catch (error: any) {
      console.error("Failed to add resumes to bucket:", error);
      showToast(error?.message || "Failed to add resumes to bucket", "error");
    } finally {
      setAddingToBucket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            CV Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Search and unlock candidate profiles
          </p>
        </div> */}
        {creditsStatus && creditsBalance && (
          <div className="flex items-center gap-5">
            {/* Circular Progress */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  className="stroke-gray-100 dark:stroke-gray-800"
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  className="stroke-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 *
                    Math.PI *
                    40 *
                    (1 -
                      creditsBalance.credits_remaining /
                        Math.max(creditsBalance.total_credits, 1))
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {creditsBalance.credits_remaining}/500
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Available Credits
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {creditsStatus.active_unlocks} active unlocks
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      {/* Search Section */}
      <div className="bg-white dark:bg-[#282727] rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by skills, title, company..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Country
            </label>
            <input
              type="text"
              value={filters.country}
              onChange={(e) =>
                setFilters({ ...filters, country: e.target.value })
              }
              placeholder="e.g., United States"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
            />
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              State
            </label>
            <input
              type="text"
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value })
              }
              placeholder="e.g., California"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
            />
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g., San Francisco"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
            />
          </div>

          {/* Experience Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Experience (Years)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={filters.min_experience_years}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    min_experience_years: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Min"
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:text-gray-200"
              />
              <input
                type="number"
                min="0"
                value={filters.max_experience_years}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    max_experience_years: parseInt(e.target.value) || 50,
                  })
                }
                placeholder="Max"
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search CVs
          </button>

          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm "
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>

          <button
            onClick={fetchSearchHistory}
            className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <History className="w-4 h-4" />
            History
          </button>

          {selectedResumes.size > 0 && (
            <>
              <button
                onClick={handleBulkUnlock}
                disabled={
                  loading ||
                  !creditsStatus ||
                  creditsStatus.credits_remaining < selectedResumes.size
                }
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Unlock className="w-4 h-4" />
                Unlock {selectedResumes.size}
              </button>
              <button
                onClick={() => setShowBucketModal(true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <FolderPlus className="w-4 h-4" />
                Add to Bucket
              </button>
            </>
          )}
        </div>

        {/* Advanced Filters Modal */}
        {showAdvancedFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200   dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-1 border-b  bg-slate-900 rounded-t-xl">
                <h3 className="text-lg font-semibold text-white">
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                      placeholder="Add skill (e.g., React, Python)"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={filters.skills_match_all}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          skills_match_all: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Match all skills (AND)
                    </span>
                  </label>
                </div>

                {/* Job Titles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Job Titles
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={jobTitleInput}
                      onChange={(e) => setJobTitleInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addJobTitle())
                      }
                      placeholder="Add job title (e.g., Software Engineer)"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addJobTitle}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.job_titles.map((title) => (
                      <span
                        key={title}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                      >
                        {title}
                        <button
                          onClick={() => removeJobTitle(title)}
                          className="hover:text-green-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Companies
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addCompany())
                      }
                      placeholder="Add company (e.g., Google, Microsoft)"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addCompany}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.companies.map((company) => (
                      <span
                        key={company}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                      >
                        {company}
                        <button
                          onClick={() => removeCompany(company)}
                          className="hover:text-purple-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Education Level
                  </label>
                  <select
                    value={filters.education_level}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        education_level: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="high_school">High School</option>
                    <option value="associate">Associate</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                {/* Degrees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Degrees
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={degreeInput}
                      onChange={(e) => setDegreeInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addDegree())
                      }
                      placeholder="Add degree (e.g., Computer Science, MBA)"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addDegree}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.degrees.map((degree) => (
                      <span
                        key={degree}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm"
                      >
                        {degree}
                        <button
                          onClick={() => removeDegree(degree)}
                          className="hover:text-yellow-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Languages
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addLanguage())
                      }
                      placeholder="Add language (e.g., English, Spanish)"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addLanguage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {filters.languages.map((language) => (
                      <span
                        key={language}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                      >
                        {language}
                        <button
                          onClick={() => removeLanguage(language)}
                          className="hover:text-indigo-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    value={filters.language_proficiency}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        language_proficiency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Proficiency</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="fluent">Fluent</option>
                    <option value="native">Native</option>
                  </select>
                </div>

                {/* Employment Status Filters */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.open_to_work_only}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          open_to_work_only: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Open to work only
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.is_currently_employed === true}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          is_currently_employed: e.target.checked
                            ? true
                            : undefined,
                        })
                      }
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Currently employed
                    </span>
                  </label>
                </div>

                {/* Sort Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Sort By
                    </label>
                    <select
                      value={filters.sort_by}
                      onChange={(e) =>
                        setFilters({ ...filters, sort_by: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="recent_activity">Recent Activity</option>
                      <option value="experience">Experience</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Sort Order
                    </label>
                    <select
                      value={filters.sort_order}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sort_order: e.target.value as "asc" | "desc",
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3 rounded-b-xl">
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSearch();
                    setShowAdvancedFilters(false);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {searchResults && (
        <div className="space-y-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {searchResults.results.map((result) => (
              <div
                key={result.resume_id}
                className="group relative rounded-2xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-[#282727]
                 p-6 shadow-sm
                 hover:shadow-xl hover:-translate-y-0.5
                 transition-all duration-200
                 flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                        {result.full_name}
                      </h3>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {result.professional_title}
                      </p>
                    </div>
                  </div>

                  {/* Select */}
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedResumes.has(result.resume_id)}
                      onChange={() => toggleSelectResume(result.resume_id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    Select
                  </label>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 dark:text-gray-400 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {result.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {result.experience_years} yrs
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    {result.highest_education}
                  </div>
                  {result.current_company && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      {result.current_company}
                    </div>
                  )}
                </div>

                {/* Skills */}
                {result.skills?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-medium
                           bg-blue-50 text-blue-700
                           dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {result.skills.length > 5 && (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium
                               bg-gray-100 dark:bg-gray-800
                               text-gray-700 dark:text-gray-300"
                        >
                          +{result.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto">
                  {result.is_unlocked ||
                  unlockedResumes.has(result.resume_id) ? (
                    <button
                      onClick={() => handleDownloadResume(result.resume_id)}
                      className="w-full px-4 py-2 rounded-xl text-sm font-semibold
                       bg-emerald-600 hover:bg-emerald-700
                       text-white shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download CV
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlockResume(result.resume_id)}
                      disabled={
                        unlockingIds.has(result.resume_id) ||
                        !creditsStatus ||
                        creditsStatus.credits_remaining < 1
                      }
                      className="w-full px-4 py-2 rounded-xl text-sm font-semibold
                       bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:from-blue-700 hover:to-indigo-700
                       text-white shadow-md transition
                       disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {unlockingIds.has(result.resume_id) ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                      Unlock (1 credit)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {searchResults.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.max(1, filters.page - 1),
                  })
                }
                disabled={filters.page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {filters.page} of {searchResults.total_pages}
              </span>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.min(searchResults.total_pages, filters.page + 1),
                  })
                }
                disabled={filters.page === searchResults.total_pages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bucket Modal */}
      {showBucketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Add to Bucket
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedResumes.size} resume
                {selectedResumes.size > 1 ? "s" : ""} selected
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {!showCreateBucket ? (
                <div className="space-y-4">
                  {/* Bucket List */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select a bucket
                    </label>
                    {buckets.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {buckets.map((bucket) => (
                          <label
                            key={bucket.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="bucket"
                              value={bucket.id}
                              checked={selectedBucketId === bucket.id}
                              onChange={() => setSelectedBucketId(bucket.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {bucket.color && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: bucket.color }}
                                  />
                                )}
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {bucket.name}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {bucket.item_count} items
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No buckets yet. Create one to organize your resumes.
                      </p>
                    )}
                  </div>

                  {/* Create New Bucket Button */}
                  <button
                    onClick={() => setShowCreateBucket(true)}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Bucket
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bucket Name
                    </label>
                    <input
                      type="text"
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value)}
                      placeholder="e.g., Senior Developers"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateBucket(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateBucket}
                      disabled={isCreatingBucket}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreatingBucket ? "Creating..." : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowBucketModal(false);
                  setShowCreateBucket(false);
                  setSelectedBucketId(null);
                  setNewBucketName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              {!showCreateBucket && (
                <button
                  onClick={handleAddToBucket}
                  disabled={!selectedBucketId || addingToBucket}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingToBucket ? "Adding..." : "Add to Bucket"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Search History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-1 border-b bg-slate-900 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Search History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {historyLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : historyError ? (
                <div className="text-center text-red-500 py-8">
                  {historyError}
                </div>
              ) : !searchHistory || searchHistory.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No search history found.
                </div>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          {/* Search Name/Title */}
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {item.search_name || "Untitled Search"}
                          </h4>

                          {/* Filter badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.search_filters &&
                              Object.entries(item.search_filters).map(
                                ([key, value]) => {
                                  // Skip internal/pagination fields
                                  if (
                                    !value ||
                                    key === "page" ||
                                    key === "limit" ||
                                    key === "page_size" ||
                                    key === "sort_by" ||
                                    key === "sort_order" ||
                                    key === "skills_match_all" ||
                                    key === "not_in_any_bucket" ||
                                    key === "open_to_work_only"
                                  )
                                    return null;

                                  // Format the display value
                                  let displayValue = String(value);
                                  if (Array.isArray(value)) {
                                    displayValue = value.join(", ");
                                  } else if (typeof value === "boolean") {
                                    displayValue = value ? "Yes" : "No";
                                  }

                                  return (
                                    <span
                                      key={key}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                    >
                                      {key.replace(/_/g, " ")}: {displayValue}
                                    </span>
                                  );
                                },
                              )}
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <span>{item.latest_result_count} results</span>
                            <span>
                              Used {item.use_count}{" "}
                              {item.use_count === 1 ? "time" : "times"}
                            </span>
                            {item.result_count_change != null &&
                              item.result_count_change !== 0 && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    item.result_count_change > 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  {item.result_count_change > 0 ? "+" : ""}
                                  {item.result_count_change}
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShowTrend(item.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="View Trend"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRerunSearch(item.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <RotateCw className="w-3 h-3" />
                            Rerun
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trend Modal */}
      {showTrendModal && trendData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-1 border-b bg-slate-900 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                Search Result Trend
              </h3>
              <button
                onClick={() => setShowTrendModal(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {trendLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Total Records: {trendData.total_records}
                    </span>
                  </div>
                  <div className="relative h-64 border-l border-b border-gray-300 dark:border-gray-600">
                    <div className="absolute inset-0 flex items-end justify-around px-2">
                      {trendData.history?.map((point, index) => {
                        const history = trendData.history || [];
                        const maxCount = Math.max(
                          ...history.map((h) => h.result_count),
                          1,
                        );
                        const height = (point.result_count / maxCount) * 100;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center group w-8"
                          >
                            <div
                              className="w-full bg-purple-500 rounded-t transition-all group-hover:bg-purple-600 relative"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {point.result_count} results
                                <br />
                                {new Date(
                                  point.recorded_at,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                    {trendData.history?.length > 0 && (
                      <>
                        <span>
                          {new Date(
                            trendData.history[0].recorded_at,
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(
                            trendData.history[trendData.history.length - 1]
                              .recorded_at,
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
