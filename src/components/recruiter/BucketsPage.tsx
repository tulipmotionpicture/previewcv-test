"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BucketWithStats, BucketListResponse } from "@/types/api";
import { useToast } from "@/context/ToastContext";
import {
  FolderOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Archive,
  Star,
  Users,
  ChevronRight,
} from "lucide-react";

export default function BucketsPage() {
  const { showToast } = useToast();
  const [buckets, setBuckets] = useState<BucketWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bucketToDelete, setBucketToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<BucketWithStats | null>(
    null,
  );
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [bucketForm, setBucketForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "folder",
  });

  // Fetch buckets
  const fetchBuckets = async () => {
    setLoading(true);
    try {
      const response = await api.listBuckets({
        include_archived: showArchived,
        sort_by: "display_order",
        order: "asc",
      });
      setBuckets(response.buckets);
    } catch (error) {
      console.error("Failed to fetch buckets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, [showArchived]);

  // Search buckets
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBuckets();
      return;
    }

    try {
      const response = await api.searchBuckets({
        query: searchQuery,
        include_archived: showArchived,
      });
      setBuckets(response.buckets);
    } catch (error) {
      console.error("Failed to search buckets:", error);
    }
  };

  // Create bucket
  const handleCreateBucket = async () => {
    if (!bucketForm.name.trim()) {
      showToast("Please enter a bucket name", "error");
      return;
    }

    try {
      await api.createBucket(bucketForm);
      setShowCreateModal(false);
      setBucketForm({
        name: "",
        description: "",
        color: "#3B82F6",
        icon: "folder",
      });
      fetchBuckets();
      showToast("Bucket created successfully!", "success");
    } catch (error: any) {
      console.error("Failed to create bucket:", error);
      showToast(error?.message || "Failed to create bucket", "error");
    }
  };

  // Update bucket
  const handleUpdateBucket = async () => {
    if (!selectedBucket || !bucketForm.name.trim()) {
      showToast("Please enter a bucket name", "error");
      return;
    }

    try {
      await api.updateBucket(selectedBucket.id, bucketForm);
      setShowEditModal(false);
      setSelectedBucket(null);
      setBucketForm({
        name: "",
        description: "",
        color: "#3B82F6",
        icon: "folder",
      });
      fetchBuckets();
      showToast("Bucket updated successfully!", "success");
    } catch (error: any) {
      console.error("Failed to update bucket:", error);
      showToast(error?.message || "Failed to update bucket", "error");
    }
  };

  // Delete bucket
  const handleDeleteBucket = async (bucketId: number, bucketName: string) => {
    setBucketToDelete({ id: bucketId, name: bucketName });
    setShowDeleteConfirm(true);
  };

  // Confirm delete bucket
  const confirmDeleteBucket = async () => {
    if (!bucketToDelete) return;

    try {
      await api.deleteBucket(bucketToDelete.id);
      fetchBuckets();
      showToast("Bucket deleted successfully!", "success");
    } catch (error: any) {
      console.error("Failed to delete bucket:", error);
      showToast(error?.message || "Failed to delete bucket", "error");
    } finally {
      setShowDeleteConfirm(false);
      setBucketToDelete(null);
    }
  };

  // Archive/Unarchive bucket
  const handleToggleArchive = async (bucket: BucketWithStats) => {
    try {
      await api.updateBucket(bucket.id, {
        is_archived: !bucket.is_archived,
      });
      fetchBuckets();
    } catch (error: any) {
      console.error("Failed to toggle archive:", error);
      showToast(error?.message || "Failed to update bucket", "error");
    }
  };

  // Open edit modal
  const openEditModal = (bucket: BucketWithStats) => {
    setSelectedBucket(bucket);
    setBucketForm({
      name: bucket.name,
      description: bucket.description || "",
      color: bucket.color || "#3B82F6",
      icon: bucket.icon || "folder",
    });
    setShowEditModal(true);
  };

  const filteredBuckets = buckets;

  const colorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#10B981", label: "Green" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#F59E0B", label: "Orange" },
    { value: "#EF4444", label: "Red" },
    { value: "#EC4899", label: "Pink" },
    { value: "#6366F1", label: "Indigo" },
    { value: "#14B8A6", label: "Teal" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Resume Buckets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize and manage your candidate pipelines
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Bucket
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#282727] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search buckets..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Search
          </button>
          <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show Archived
            </span>
          </label>
        </div>
      </div>

      {/* Buckets Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading buckets...</p>
        </div>
      ) : filteredBuckets.length === 0 ? (
        <div className="bg-white dark:bg-[#282727] rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No buckets found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first bucket to start organizing candidates
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Bucket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuckets.map((bucket) => (
            <div
              key={bucket.id}
              className="relative bg-white dark:bg-[#282727] rounded-xl border-2 p-6 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
              style={{
                borderColor: bucket.color || "#3B82F6",
                boxShadow: `0 4px 20px ${bucket.color || "#3B82F6"}20`,
              }}
            >
              {/* Colored top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: bucket.color || "#3B82F6" }}
              />

              {/* Colored gradient background overlay */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -z-0"
                style={{ backgroundColor: bucket.color || "#3B82F6" }}
              />

              {/* Bucket Header */}
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: bucket.color || "#3B82F6",
                      boxShadow: `0 8px 16px ${bucket.color || "#3B82F6"}40`,
                    }}
                  >
                    <FolderOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {bucket.name}
                    </h3>
                    {bucket.is_archived && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Archive className="w-3 h-3" />
                        Archived
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {bucket.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 relative z-10">
                  {bucket.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: `${bucket.color || "#3B82F6"}08`,
                    borderColor: `${bucket.color || "#3B82F6"}30`,
                  }}
                >
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                    <Users className="w-4 h-4" />
                    Resumes
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {bucket.item_count}
                  </div>
                </div>
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: `${bucket.color || "#3B82F6"}08`,
                    borderColor: `${bucket.color || "#3B82F6"}30`,
                  }}
                >
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
                    <Star className="w-4 h-4" />
                    Avg Rating
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {bucket.avg_rating ? bucket.avg_rating.toFixed(1) : "—"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2 pt-4 border-t relative z-10"
                style={{ borderColor: `${bucket.color || "#3B82F6"}20` }}
              >
                <button
                  onClick={() => openEditModal(bucket)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleArchive(bucket)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  {bucket.is_archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  onClick={() => handleDeleteBucket(bucket.id, bucket.name)}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Create New Bucket
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bucket Name *
                </label>
                <input
                  type="text"
                  value={bucketForm.name}
                  onChange={(e) =>
                    setBucketForm({ ...bucketForm, name: e.target.value })
                  }
                  placeholder="e.g., Senior Developers"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={bucketForm.description}
                  onChange={(e) =>
                    setBucketForm({
                      ...bucketForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setBucketForm({ ...bucketForm, color: color.value })
                      }
                      className={`h-10 rounded-lg border-2 transition-all ${
                        bucketForm.color === color.value
                          ? "border-gray-900 dark:border-white scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setBucketForm({
                    name: "",
                    description: "",
                    color: "#3B82F6",
                    icon: "folder",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBucket}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Bucket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBucket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Edit Bucket
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bucket Name *
                </label>
                <input
                  type="text"
                  value={bucketForm.name}
                  onChange={(e) =>
                    setBucketForm({ ...bucketForm, name: e.target.value })
                  }
                  placeholder="e.g., Senior Developers"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={bucketForm.description}
                  onChange={(e) =>
                    setBucketForm({
                      ...bucketForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setBucketForm({ ...bucketForm, color: color.value })
                      }
                      className={`h-10 rounded-lg border-2 transition-all ${
                        bucketForm.color === color.value
                          ? "border-gray-900 dark:border-white scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBucket(null);
                  setBucketForm({
                    name: "",
                    description: "",
                    color: "#3B82F6",
                    icon: "folder",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBucket}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Bucket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bucketToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                Delete Bucket
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  &quot;{bucketToDelete.name}&quot;
                </strong>
                ?
              </p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                This action cannot be undone and will remove all items from the
                bucket.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBucketToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBucket}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
