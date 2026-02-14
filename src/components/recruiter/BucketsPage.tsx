"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  BucketWithStats,
  BucketListResponse,
  CVCreditsStatus,
  CVUnlockResponse,
} from "@/types/api";
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
  Eye,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  GripVertical,
  Clock,
  PlusCircle,
  FileText,
  ArrowRightLeft,
  RotateCw,
  FolderPlus,
  Unlock,
  Lock,
  Minimize2,
  Maximize2,
} from "lucide-react";
import ResumeDetailModal from "./ResumeDetailModal";

export default function BucketsPage() {
  const { showToast } = useToast();
  const router = useRouter();
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

  // Bucket items state
  const [showBucketItems, setShowBucketItems] = useState(false);
  const [bucketItems, setBucketItems] = useState<any>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsPage, setItemsPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [itemsPerPage] = useState(20);

  // Move/Copy state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [targetBucketId, setTargetBucketId] = useState<number | null>(null);
  const [keepInSource, setKeepInSource] = useState(false);
  const [movingItems, setMovingItems] = useState(false);

  // Reorder state
  const [isReordering, setIsReordering] = useState(false);
  const [reorderingItems, setReorderingItems] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Activity logs state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Unlock state for resumes
  const [unlockedResumes, setUnlockedResumes] = useState<Set<number>>(
    new Set(),
  );
  const [unlockingIds, setUnlockingIds] = useState<Set<number>>(new Set());
  const [loadingResumeDetail, setLoadingResumeDetail] = useState<Set<number>>(
    new Set(),
  );
  const [creditsStatus, setCreditsStatus] = useState<CVCreditsStatus | null>(
    null,
  );
  const [resumeDetailData, setResumeDetailData] =
    useState<CVUnlockResponse | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [currentResumeIndex, setCurrentResumeIndex] = useState<number>(0);
  const [currentResumeIsLocked, setCurrentResumeIsLocked] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lockedResumeInfo, setLockedResumeInfo] = useState<{
    name?: string;
    resume_id?: number;
    created_at?: string;
    updated_at?: string;
  } | null>(null);

  // Form state
  const [bucketForm, setBucketForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "folder",
  });

  // Edit item state
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemForm, setItemForm] = useState({
    notes: "",
    rating: null as number | null,
    status: "",
  });
  const [savingItem, setSavingItem] = useState(false);

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
    fetchCreditsStatus();
  }, [showArchived]);

  // Fetch credits status
  const fetchCreditsStatus = async () => {
    try {
      const status = await api.getCVCreditsStatus();
      setCreditsStatus(status);
    } catch (error) {
      console.error("Failed to fetch credits status:", error);
    }
  };

  // Unlock single resume
  const handleUnlockResume = async (resumeId: number) => {
    setUnlockingIds((prev) => new Set([...prev, resumeId]));
    try {
      const response = await api.unlockCVProfile(resumeId, "bucket");
      setUnlockedResumes((prev) => new Set([...prev, resumeId]));

      // Refresh credits
      const status = await api.getCVCreditsStatus();
      setCreditsStatus(status);

      // Show resume details in modal
      setResumeDetailData(response);
      setShowResumeModal(true);
      setCurrentResumeIsLocked(false);
      setLockedResumeInfo(null);

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

  // View resume (already unlocked)
  const handleViewResume = async (resumeId: number) => {
    setLoadingResumeDetail((prev) => new Set([...prev, resumeId]));
    try {
      // Call unlock API to get resume data (already unlocked, so just retrieves data)
      const response = await api.unlockCVProfile(resumeId, "bucket");
      setResumeDetailData(response);
      setShowResumeModal(true);
    } catch (error) {
      console.error("Failed to load resume:", error);
      showToast("Failed to load resume details.", "error");
    } finally {
      setLoadingResumeDetail((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

  // Download PDF from modal
  const handleDownloadPDF = async () => {
    if (!resumeDetailData) return;
    try {
      const response = await api.downloadUnlockedResume(
        resumeDetailData.resume_id,
        "url",
        true,
      );
      if (response.download_url) {
        window.open(response.download_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to download resume:", error);
      showToast("Failed to download resume.", "error");
    }
  };

  // Navigate to next resume
  const handleNavigateNext = async () => {
    if (!bucketItems?.items || currentResumeIndex >= bucketItems.items.length - 1 || isNavigating) return;

    setIsNavigating(true);
    try {
      const nextIndex = currentResumeIndex + 1;
      const nextItem = bucketItems.items[nextIndex];
      setCurrentResumeIndex(nextIndex);

      // Check if the next resume is locked
      const isNextLocked = !nextItem.is_unlocked && !unlockedResumes.has(nextItem.resume_id);

      if (isNextLocked) {
        setCurrentResumeIsLocked(true);
        setResumeDetailData(null);
        // Set locked resume info for display
        setLockedResumeInfo({
          name: nextItem.resume?.name,
          resume_id: nextItem.resume_id,
          created_at: nextItem.created_at,
          updated_at: nextItem.updated_at,
        });
      } else {
        // Load the next resume
        const response = await api.unlockCVProfile(nextItem.resume_id, "bucket");
        setResumeDetailData(response);
        setCurrentResumeIsLocked(false);
        setLockedResumeInfo(null);
      }
    } catch (error) {
      console.error("Failed to load resume:", error);
      showToast("Failed to load resume details.", "error");
    } finally {
      setIsNavigating(false);
    }
  };

  // Navigate to previous resume
  const handleNavigatePrevious = async () => {
    if (!bucketItems?.items || currentResumeIndex <= 0 || isNavigating) return;

    setIsNavigating(true);
    try {
      const prevIndex = currentResumeIndex - 1;
      const prevItem = bucketItems.items[prevIndex];
      setCurrentResumeIndex(prevIndex);

      // Check if the previous resume is locked
      const isPrevLocked = !prevItem.is_unlocked && !unlockedResumes.has(prevItem.resume_id);

      if (isPrevLocked) {
        setCurrentResumeIsLocked(true);
        setResumeDetailData(null);
        // Set locked resume info for display
        setLockedResumeInfo({
          name: prevItem.resume?.name,
          resume_id: prevItem.resume_id,
          created_at: prevItem.created_at,
          updated_at: prevItem.updated_at,
        });
      } else {
        // Load the previous resume
        const response = await api.unlockCVProfile(prevItem.resume_id, "bucket");
        setResumeDetailData(response);
        setCurrentResumeIsLocked(false);
        setLockedResumeInfo(null);
      }
    } catch (error) {
      console.error("Failed to load resume:", error);
      showToast("Failed to load resume details.", "error");
    } finally {
      setIsNavigating(false);
    }
  };

  // Unlock current resume from modal
  const handleUnlockFromModal = async () => {
    if (!bucketItems?.items) return;
    const currentItem = bucketItems.items[currentResumeIndex];
    if (!currentItem) return;

    await handleUnlockResume(currentItem.resume_id);
  };

  // Open edit item modal
  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      notes: item.notes || "",
      rating: item.rating || null,
      status: item.status || "",
    });
    setShowEditItemModal(true);
  };

  // Save item metadata
  const handleSaveItemMetadata = async () => {
    if (!editingItem || !selectedBucket) return;

    setSavingItem(true);
    try {
      await api.updateBucketItem(selectedBucket.id, editingItem.id, {
        notes: itemForm.notes || undefined,
        rating: itemForm.rating || undefined,
        status: itemForm.status || undefined,
      });

      // Refresh bucket items
      await fetchBucketItems(selectedBucket);

      setShowEditItemModal(false);
      setEditingItem(null);
      showToast("Item updated successfully!", "success");
    } catch (error: any) {
      console.error("Failed to update item:", error);
      showToast(
        error?.message || "Failed to update item. Please try again.",
        "error",
      );
    } finally {
      setSavingItem(false);
    }
  };

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

  // Fetch bucket items
  const fetchBucketItems = async (
    bucket: BucketWithStats,
    page: number = 1,
  ) => {
    setSelectedBucket(bucket);
    setLoadingItems(true);
    setShowBucketItems(true);
    try {
      const response = await api.listBucketResumes(bucket.id, {
        page,
        per_page: itemsPerPage,
        sort_by: "added_at",
        order: "desc",
      });
      setBucketItems(response);
      setItemsPage(page);
    } catch (error) {
      console.error("Failed to fetch bucket items:", error);
      showToast("Failed to load bucket items", "error");
    } finally {
      setLoadingItems(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle move/copy resumes
  const handleMoveResumes = async () => {
    if (!selectedBucket || !targetBucketId || selectedItems.size === 0) {
      showToast("Please select a target bucket and items to move", "error");
      return;
    }

    if (targetBucketId === selectedBucket.id) {
      showToast("Cannot move to the same bucket", "error");
      return;
    }

    setMovingItems(true);
    try {
      const response = await api.moveResumesBetweenBuckets({
        from_bucket_id: selectedBucket.id,
        to_bucket_id: targetBucketId,
        item_ids: Array.from(selectedItems),
        keep_in_source: keepInSource,
      });

      showToast(
        keepInSource
          ? `${response.data.added_count} resumes copied successfully!`
          : `${response.data.added_count} resumes moved successfully!`,
        "success",
      );

      // Reset and refresh
      setShowMoveModal(false);
      setSelectedItems(new Set());
      setTargetBucketId(null);
      setKeepInSource(false);

      // Refresh current bucket items
      if (selectedBucket) {
        fetchBucketItems(selectedBucket, itemsPage);
      }

      // Refresh buckets list
      fetchBuckets();
    } catch (error: any) {
      console.error("Failed to move resumes:", error);
      showToast(error?.message || "Failed to move resumes", "error");
    } finally {
      setMovingItems(false);
    }
  };

  // Handle remove single item
  const handleRemoveItem = async (itemId: number, resumeName: string) => {
    if (!selectedBucket) return;

    if (!confirm(`Remove "${resumeName}" from this bucket?`)) return;

    try {
      await api.removeBucketItem(selectedBucket.id, itemId);
      showToast("Resume removed from bucket", "success");

      // Refresh current bucket items
      fetchBucketItems(selectedBucket, itemsPage);
      fetchBuckets();
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      showToast(error?.message || "Failed to remove item", "error");
    }
  };

  // Handle bulk remove
  const handleBulkRemove = async () => {
    if (!selectedBucket || selectedItems.size === 0) return;

    if (
      !confirm(
        `Remove ${selectedItems.size} resume${selectedItems.size > 1 ? "s" : ""} from this bucket?`,
      )
    )
      return;

    setMovingItems(true);
    try {
      await api.bulkRemoveBucketResumes(
        selectedBucket.id,
        Array.from(selectedItems),
      );
      showToast(
        `${selectedItems.size} resume${selectedItems.size > 1 ? "s" : ""} removed successfully!`,
        "success",
      );

      // Reset and refresh
      setSelectedItems(new Set());
      fetchBucketItems(selectedBucket, itemsPage);
      fetchBuckets();
    } catch (error: any) {
      console.error("Failed to remove resumes:", error);
      showToast(error?.message || "Failed to remove resumes", "error");
    } finally {
      setMovingItems(false);
    }
  };

  // Move item up in order
  const moveItemUp = (currentIndex: number) => {
    if (!bucketItems?.items || currentIndex === 0) return;

    const newItems = [...bucketItems.items];
    [newItems[currentIndex - 1], newItems[currentIndex]] = [
      newItems[currentIndex],
      newItems[currentIndex - 1],
    ];

    setBucketItems({ ...bucketItems, items: newItems });
  };

  // Move item down in order
  const moveItemDown = (currentIndex: number) => {
    if (!bucketItems?.items || currentIndex === bucketItems.items.length - 1)
      return;

    const newItems = [...bucketItems.items];
    [newItems[currentIndex], newItems[currentIndex + 1]] = [
      newItems[currentIndex + 1],
      newItems[currentIndex],
    ];

    setBucketItems({ ...bucketItems, items: newItems });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === index) return;

    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || !bucketItems?.items) return;

    const newItems = [...bucketItems.items];
    const draggedItem = newItems[draggedIndex];

    // Remove from old position
    newItems.splice(draggedIndex, 1);
    // Insert at new position
    newItems.splice(dropIndex, 0, draggedItem);

    setBucketItems({ ...bucketItems, items: newItems });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save reorder
  const handleSaveReorder = async () => {
    if (!selectedBucket || !bucketItems?.items) return;

    setReorderingItems(true);
    try {
      const itemOrders = bucketItems.items.map((item: any, index: number) => ({
        item_id: item.id,
        display_order: index,
      }));

      await api.reorderBucketItems(selectedBucket.id, itemOrders);
      showToast("Order saved successfully!", "success");

      setIsReordering(false);
      // Refresh to get the new order from server
      fetchBucketItems(selectedBucket, itemsPage);
      fetchBuckets();
    } catch (error: any) {
      console.error("Failed to save order:", error);
      showToast(error?.message || "Failed to save order", "error");
    } finally {
      setReorderingItems(false);
    }
  };

  // Cancel reorder
  const handleCancelReorder = () => {
    setIsReordering(false);
    // Refresh to restore original order
    if (selectedBucket) {
      fetchBucketItems(selectedBucket, itemsPage);
    }
  };

  // Fetch bucket activity logs
  const fetchBucketActivity = async (bucketId: number) => {
    setLoadingActivity(true);
    setShowActivityModal(true);
    try {
      const response = await api.getBucketActivity(bucketId, 100);
      setActivityLogs(response || []);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      showToast("Failed to load activity logs", "error");
    } finally {
      setLoadingActivity(false);
    }
  };

  // Format timestamp for activity logs
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get icon and color for activity action
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "bucket_created":
        return {
          Icon: FolderPlus,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-900/20",
        };
      case "bucket_updated":
        return {
          Icon: Edit2,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-900/20",
        };
      case "resumes_bulk_added":
      case "resume_added":
        return {
          Icon: PlusCircle,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
        };
      case "resume_removed":
      case "resumes_bulk_removed":
        return {
          Icon: Trash2,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-900/20",
        };
      case "resumes_moved":
        return {
          Icon: ArrowRightLeft,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-50 dark:bg-purple-900/20",
        };
      case "resumes_reordered":
        return {
          Icon: RotateCw,
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-50 dark:bg-orange-900/20",
        };
      default:
        return {
          Icon: FileText,
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900/20",
        };
    }
  };

  // Format metadata value for display
  const formatMetadataValue = (key: string, value: any): React.ReactNode => {
    // Handle "Changes" object with from/to pattern
    if (
      key.toLowerCase() === "changes" &&
      typeof value === "object" &&
      value !== null
    ) {
      return (
        <div className="space-y-2 mt-2">
          {Object.entries(value).map(([field, change]: [string, any]) => {
            if (
              typeof change === "object" &&
              change !== null &&
              "from" in change &&
              "to" in change
            ) {
              // Handle color changes with visual preview
              if (field.toLowerCase() === "color") {
                return (
                  <div key={field} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold capitalize text-gray-700 dark:text-gray-300">
                      {field}:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                          style={{ backgroundColor: change.from || "#cccccc" }}
                          title={change.from || "None"}
                        />
                        <span className="text-xs text-gray-500">
                          {change.from || "None"}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-1">
                        <div
                          className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                          style={{ backgroundColor: change.to }}
                          title={change.to}
                        />
                        <span className="text-xs text-gray-500">
                          {change.to}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              // Handle other from/to changes
              const fromValue =
                change.from === null ? "None" : String(change.from);
              const toValue = change.to === null ? "None" : String(change.to);
              return (
                <div key={field} className="flex items-center gap-2 text-sm">
                  <span className="font-semibold capitalize text-gray-700 dark:text-gray-300">
                    {field}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                      {fromValue}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                      {toValue}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // Handle resume_ids array
    if (key === "resume_ids" && Array.isArray(value)) {
      return (
        <span className="inline-flex items-center gap-1 text-xs">
          <FileText className="w-3 h-3" />
          {value.length} resume{value.length !== 1 ? "s" : ""} (IDs:{" "}
          {value.join(", ")})
        </span>
      );
    }

    // Handle count
    if (key === "count") {
      return (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {value}
        </span>
      );
    }

    // Handle bucket_name
    if (key === "bucket_name") {
      return (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          "{value}"
        </span>
      );
    }

    // Handle null values
    if (value === null) {
      return <span className="text-gray-400 italic">None</span>;
    }

    // Handle regular object
    if (typeof value === "object" && value !== null) {
      return (
        <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
          {JSON.stringify(value)}
        </code>
      );
    }

    return String(value);
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
              <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                <div
                  className="rounded-lg p-2.5 border"
                  style={{
                    backgroundColor: `${bucket.color || "#3B82F6"}08`,
                    borderColor: `${bucket.color || "#3B82F6"}30`,
                  }}
                >
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-[10px] mb-0.5">
                    <Users className="w-3.5 h-3.5" />
                    Total
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {bucket.item_count}
                  </div>
                </div>
                <div
                  className="rounded-lg p-2.5 border"
                  style={{
                    backgroundColor: `${bucket.color || "#3B82F6"}08`,
                    borderColor: `${bucket.color || "#3B82F6"}30`,
                  }}
                >

                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-[10px] mb-0.5">
                    Unlocked / Locked
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    <span className="text-green-500">{bucket.unlocked_count ?? 0}</span> / <span className="text-red-500">{bucket.locked_count ?? 0}</span>
                  </div>

                </div>


              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2 pt-4 border-t relative z-10"
                style={{ borderColor: `${bucket.color || "#3B82F6"}20` }}
              >
                <button
                  onClick={() => fetchBucketItems(bucket)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: bucket.color || "#3B82F6" }}
                >
                  <Eye className="w-4 h-4" />
                  View Items
                </button>
                <button
                  onClick={() => openEditModal(bucket)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleArchive(bucket)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Archive className="w-4 h-4" />
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
                      className={`h-10 rounded-lg border-2 transition-all ${bucketForm.color === color.value
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
                      className={`h-10 rounded-lg border-2 transition-all ${bucketForm.color === color.value
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


      {/* Bucket Items Modal */}
      {showBucketItems && selectedBucket && (
        <div
          className={
            isFullscreen
              ? "fixed inset-0 bg-black/50 z-50"
              : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          }
        >
          <div
            className={
              isFullscreen
                ? "bg-white dark:bg-[#282727] shadow-xl flex flex-col transition-all duration-300 w-full h-full"
                : "bg-white dark:bg-[#282727] rounded-xl shadow-xl flex flex-col transition-all duration-300 w-full max-w-7xl max-h-[90vh]"
            }
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 border-b rounded-t-xl flex items-center justify-between"
              style={{ backgroundColor: selectedBucket.color || "#3B82F6" }}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedBucket.name}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {bucketItems?.total || 0} resumes in this bucket
                    {selectedItems.size > 0 &&
                      ` • ${selectedItems.size} selected`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isReordering ? (
                  <>
                    <button
                      onClick={handleCancelReorder}
                      disabled={reorderingItems}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReorder}
                      disabled={reorderingItems}
                      className="px-4 py-2 bg-white hover:bg-white/90 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {reorderingItems ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>Save Order</>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {selectedItems.size === 0 &&
                      bucketItems?.items?.length > 1 && (
                        <button
                          onClick={() => setIsReordering(true)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <GripVertical className="w-4 h-4" />
                          Reorder
                        </button>
                      )}
                    {selectedItems.size === 0 && (
                      <button
                        onClick={() => fetchBucketActivity(selectedBucket.id)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Activity
                      </button>
                    )}
                    {selectedItems.size > 0 && (
                      <>
                        <button
                          onClick={() => setShowMoveModal(true)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                          Move/Copy ({selectedItems.size})
                        </button>
                        <button
                          onClick={handleBulkRemove}
                          disabled={movingItems}
                          className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove ({selectedItems.size})
                        </button>
                      </>
                    )}
                  </>
                )}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowBucketItems(false);
                    setBucketItems(null);
                    setSelectedBucket(null);
                    setSelectedItems(new Set());
                    setIsReordering(false);
                    setIsFullscreen(false);
                  }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingItems ? (
                  <div className="flex justify-center items-center py-12">
                    <div
                      className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: `${selectedBucket.color || "#3B82F6"}40`,
                        borderTopColor: "transparent",
                      }}
                    />
                  </div>
                ) : bucketItems?.items?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No resumes yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add resumes to this bucket from the CV Search page
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
                      {bucketItems?.items?.map((item: any, index: number) => (
                        <div
                          key={item.id}
                          draggable={isReordering}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`group relative rounded-2xl border bg-white dark:bg-gray-800 p-6 shadow-sm transition-all duration-200 flex flex-col ${isReordering
                            ? "cursor-move"
                            : "hover:shadow-xl hover:-translate-y-0.5"
                            } ${draggedIndex === index ? "opacity-50 scale-95" : ""
                            } ${dragOverIndex === index && draggedIndex !== index
                              ? "border-4 scale-105"
                              : "border border-gray-200 dark:border-gray-700"
                            }`}
                          style={
                            dragOverIndex === index && draggedIndex !== index
                              ? { borderColor: selectedBucket.color || "#3B82F6" }
                              : {}
                          }
                        >
                          {/* Drag Handle or Checkbox */}
                          <div className="absolute top-4 right-4 z-10">
                            {isReordering ? (
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-move">
                                <GripVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selectedItems.has(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 cursor-pointer"
                                style={{
                                  accentColor: selectedBucket.color || "#3B82F6",
                                }}
                              />
                            )}
                          </div>

                          {/* Resume Header */}
                          <div className="flex items-start justify-between gap-4 mb-4 pr-8">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                              style={{
                                backgroundColor:
                                  selectedBucket.color || "#3B82F6",
                              }}
                            >
                              {item.resume?.name?.[0]?.toUpperCase() || "R"}
                            </div> */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {item.resume?.name || "Untitled Resume"}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  Resume ID: {item.resume_id}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Resume Info */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="col-span-2">
                              <span className="text-gray-500 dark:text-gray-500">
                                Created
                              </span>
                              <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {new Date(
                                  item.resume?.created_at,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {/* <div className="col-span-2">
                            <span className="text-gray-500 dark:text-gray-500">
                              Last Updated
                            </span>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              {new Date(
                                item.resume?.updated_at,
                              ).toLocaleDateString()}
                            </p>
                          </div> */}
                          </div>

                          {/* Bucket Meta */}
                          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Added to Bucket
                              </span>
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {new Date(item.added_at).toLocaleDateString()}
                              </span>
                            </div>
                            {item.rating && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Rating
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < item.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.status && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Status
                                </span>
                                <span
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `${selectedBucket.color || "#3B82F6"}20`,
                                    color: selectedBucket.color || "#3B82F6",
                                  }}
                                >
                                  {item.status}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.notes}
                              </p>
                            </div>
                          )}

                          {/* Lock Status Indicator */}
                          {item.is_unlocked ||
                            unlockedResumes.has(item.resume_id) ? (
                            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                              <Unlock className="w-4 h-4" />
                              <span>Unlocked</span>
                              {item.unlocked_until && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                  until{" "}
                                  {new Date(
                                    item.unlocked_until,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="mb-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                              <Lock className="w-4 h-4" />
                              <span>Locked - Unlock to view</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                            {/* View/Unlock Button */}
                            {item.is_unlocked ||
                              unlockedResumes.has(item.resume_id) ? (
                              <button
                                onClick={() => {
                                  setCurrentResumeIndex(index);
                                  setCurrentResumeIsLocked(false);
                                  setLockedResumeInfo(null);
                                  handleViewResume(item.resume_id);
                                }}
                                disabled={loadingResumeDetail.has(item.resume_id)}
                                className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                                style={{
                                  backgroundColor:
                                    selectedBucket.color || "#3B82F6",
                                }}
                              >
                                {loadingResumeDetail.has(item.resume_id) ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                                View Resume
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setCurrentResumeIndex(index);
                                  setCurrentResumeIsLocked(false);
                                  setLockedResumeInfo({
                                    name: item.resume?.name,
                                    resume_id: item.resume_id,
                                    created_at: item.created_at,
                                    updated_at: item.updated_at,
                                  });
                                  handleUnlockResume(item.resume_id);
                                }}
                                disabled={
                                  unlockingIds.has(item.resume_id) ||
                                  !creditsStatus ||
                                  creditsStatus.credits_remaining < 1
                                }
                                className="w-full px-4 py-2 rounded-lg text-sm font-semibold
                               bg-gradient-to-r from-blue-600 to-indigo-600
                               hover:from-blue-700 hover:to-indigo-700
                               text-white shadow-md transition
                               disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {unlockingIds.has(item.resume_id) ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                                Unlock (1 credit)
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditItem(item)}
                              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit Notes & Rating
                            </button>

                            <button
                              onClick={() =>
                                handleRemoveItem(
                                  item.id,
                                  item.resume?.name || "this resume",
                                )
                              }
                              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove from Bucket
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {bucketItems && bucketItems.total > itemsPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() =>
                            fetchBucketItems(selectedBucket, itemsPage - 1)
                          }
                          disabled={itemsPage === 1}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {itemsPage} of{" "}
                          {Math.ceil(bucketItems.total / itemsPerPage)}
                        </span>
                        <button
                          onClick={() =>
                            fetchBucketItems(selectedBucket, itemsPage + 1)
                          }
                          disabled={
                            itemsPage >=
                            Math.ceil(bucketItems.total / itemsPerPage)
                          }
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move/Copy Modal */}
      {showMoveModal && selectedBucket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Move or Copy Resumes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedItems.size} resume{selectedItems.size > 1 ? "s" : ""}{" "}
                selected
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Bucket *
                </label>
                <select
                  value={targetBucketId || ""}
                  onChange={(e) => setTargetBucketId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a bucket...</option>
                  {buckets
                    .filter(
                      (b) => b.id !== selectedBucket?.id && !b.is_archived,
                    )
                    .map((bucket) => (
                      <option key={bucket.id} value={bucket.id}>
                        {bucket.name} ({bucket.item_count} items)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="keepInSource"
                  checked={keepInSource}
                  onChange={(e) => setKeepInSource(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="keepInSource"
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                >
                  Keep in current bucket (Copy instead of Move)
                </label>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                {keepInSource ? (
                  <>
                    <strong>Copy:</strong> Resumes will be added to the target
                    bucket while staying in "{selectedBucket.name}"
                  </>
                ) : (
                  <>
                    <strong>Move:</strong> Resumes will be removed from "
                    {selectedBucket.name}" and added to the target bucket
                  </>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setTargetBucketId(null);
                  setKeepInSource(false);
                }}
                disabled={movingItems}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveResumes}
                disabled={!targetBucketId || movingItems}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {movingItems ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {keepInSource ? "Copying..." : "Moving..."}
                  </>
                ) : (
                  <>{keepInSource ? "Copy" : "Move"} Resumes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && selectedBucket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#282727] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div
              className="px-6 py-4 border-b rounded-t-xl flex items-center justify-between"
              style={{ backgroundColor: selectedBucket.color || "#3B82F6" }}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Activity Logs
                  </h2>
                  <p className="text-white/80 text-sm">
                    {selectedBucket.name} - Recent activity
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityLogs([]);
                }}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingActivity ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading activity logs...
                    </p>
                  </div>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      No activity logs yet
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                      Activity will appear here as you interact with this bucket
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log: any, index: number) => {
                    const { Icon, color, bg } = getActivityIcon(log.action);
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
                          >
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {log.action
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l: string) =>
                                      l.toUpperCase(),
                                    )}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatActivityTime(log.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Metadata */}
                            {log.metadata &&
                              Object.keys(log.metadata).length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mt-3 border border-gray-200 dark:border-gray-800">
                                  <div className="space-y-2">
                                    {Object.entries(log.metadata).map(
                                      ([key, value]: [string, any]) => (
                                        <div key={key} className="text-sm">
                                          {key.toLowerCase() !== "changes" && (
                                            <span className="text-gray-600 dark:text-gray-400 font-medium inline-block min-w-[100px]">
                                              {key
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (l: string) =>
                                                  l.toUpperCase(),
                                                )}
                                              :
                                            </span>
                                          )}
                                          <span className="text-gray-900 dark:text-gray-100">
                                            {formatMetadataValue(key, value)}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}


                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityLogs([]);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Detail Modal */}
      <ResumeDetailModal
        isOpen={showResumeModal}
        onClose={() => {
          setShowResumeModal(false);
          setResumeDetailData(null);
        }}
        resumeData={resumeDetailData}
        onDownloadPDF={handleDownloadPDF}
        onNavigateNext={handleNavigateNext}
        onNavigatePrevious={handleNavigatePrevious}
        hasNext={bucketItems?.items ? currentResumeIndex < bucketItems.items.length - 1 : false}
        hasPrevious={currentResumeIndex > 0}
        currentIndex={currentResumeIndex}
        totalCount={bucketItems?.items?.length || 0}
        isNavigating={isNavigating}
        isLocked={currentResumeIsLocked}
        onUnlock={handleUnlockFromModal}
        unlocking={bucketItems?.items ? unlockingIds.has(bucketItems.items[currentResumeIndex]?.resume_id) : false}
        lockedResumeInfo={lockedResumeInfo}
      />

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Edit Resume Details
              </h3>
              <button
                onClick={() => {
                  setShowEditItemModal(false);
                  setEditingItem(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Resume Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      backgroundColor: selectedBucket?.color || "#3B82F6",
                    }}
                  >
                    {editingItem.resume?.name?.[0]?.toUpperCase() || "R"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {editingItem.resume?.name || "Untitled Resume"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Resume ID: {editingItem.resume_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setItemForm({ ...itemForm, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${itemForm.rating && itemForm.rating >= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                          }`}
                      />
                    </button>
                  ))}
                  {itemForm.rating && (
                    <button
                      onClick={() => setItemForm({ ...itemForm, rating: null })}
                      className="ml-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Status
                </label>
                <input
                  id="status"
                  type="text"
                  value={itemForm.status}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, status: e.target.value })
                  }
                  placeholder="e.g., To Contact, Interviewed, Rejected"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {itemForm.status.length}/100 characters
                </p>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={itemForm.notes}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, notes: e.target.value })
                  }
                  placeholder="Add your notes about this candidate..."
                  rows={6}
                  maxLength={5000}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {itemForm.notes.length}/5000 characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditItemModal(false);
                  setEditingItem(null);
                }}
                disabled={savingItem}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItemMetadata}
                disabled={savingItem}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingItem ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
