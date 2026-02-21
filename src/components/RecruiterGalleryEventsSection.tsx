import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Upload,
  Star,
} from "lucide-react";
import RichTextEditor from "./ui/RichTextEditor";
// Removed 'sonner' import since it is not installed. Relying on toast prop.

interface EventFormState {
  title: string;
  description: string;
  event_date: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

const EVENT_FORM_INITIAL: EventFormState = {
  title: "",
  description: "",
  event_date: "",
  is_featured: false,
  display_order: 0,
  is_active: true,
};

const CustomCalendar = ({ selectedDate, onSelectDate }: { selectedDate: Date | null, onSelectDate: (d: Date | null) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Adjust so Monday is 0, Sunday is 6
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  return (
    <div className="bg-white dark:bg-[#313234] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm dark:text-gray-200">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full text-gray-400 dark:text-gray-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={handleNextMonth} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full text-gray-400 dark:text-gray-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 dark:text-gray-500 mb-2">
        <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs gap-y-3 font-medium text-gray-600 dark:text-gray-400">
        {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(isSelected ? null : date)}
              className={`w-6 h-6 flex items-center justify-center mx-auto rounded-full transition-colors ${isSelected ? "bg-[#0B6BCB] text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TimeSelector = ({ selectedTimePeriod, onSelectTimePeriod }: { selectedTimePeriod: string | null, onSelectTimePeriod: (t: string | null) => void }) => {
  const periods = [
    { label: "Morning", sublabel: "06:00 - 12:00", value: "morning" },
    { label: "Afternoon", sublabel: "12:00 - 18:00", value: "afternoon" },
    { label: "Evening", sublabel: "18:00 - 24:00", value: "evening" }
  ];

  return (
    <div className="bg-white dark:bg-[#313234] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 w-full flex flex-col gap-2">
      {periods.map(p => (
        <button
          key={p.value}
          onClick={() => onSelectTimePeriod(selectedTimePeriod === p.value ? null : p.value)}
          className={`flex flex-col items-start px-3 py-2 rounded-lg border transition-all ${selectedTimePeriod === p.value ? "border-[#0B6BCB] bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}
        >
          <span className={`text-sm font-semibold ${selectedTimePeriod === p.value ? "text-[#0B6BCB]" : "text-gray-700 dark:text-gray-200"}`}>{p.label}</span>
          <span className="text-xs text-gray-500">{p.sublabel}</span>
        </button>
      ))}
    </div>
  );
};

export default function RecruiterGalleryEventsSection({
  toast,
}: {
  recruiter: any;
  toast: any;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventForm, setEventForm] =
    useState<EventFormState>(EVENT_FORM_INITIAL);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [imageModalMode, setImageModalMode] = useState<"upload" | "edit" | null>(null);
  const [imageForm, setImageForm] = useState({
    file: null as File | null,
    eventId: null as number | null,
    imageId: null as number | null,
    caption: "",
    alt_text: "",
    is_cover: false,
    display_order: 0,
  });
  const [savingImage, setSavingImage] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState<"Active" | "Draft" | "Closed">(
    "Active",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"dates" | "time">("dates");
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMyGalleryEvents();
      const fetchedEvents = res?.events || res || [];
      setEvents(fetchedEvents);
    } catch {
      toast?.error("Failed to load gallery events");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Derived state for filtered events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const hasDate = !!event.event_date;
    const eventDate = hasDate ? new Date(event.event_date!) : null;
    const now = new Date();
    const isPast = eventDate ? eventDate < now : false;
    const isActive = event.is_active !== false;

    let matchesTab = false;
    if (activeTab === "Active") {
      matchesTab = isActive && !isPast;
    } else if (activeTab === "Closed") {
      matchesTab = isActive && isPast;
    } else if (activeTab === "Draft") {
      matchesTab = !isActive;
    }

    let matchesDateFilter = true;
    if (selectedDateFilter) {
      if (eventDate) {
        matchesDateFilter = eventDate.getFullYear() === selectedDateFilter.getFullYear() &&
          eventDate.getMonth() === selectedDateFilter.getMonth() &&
          eventDate.getDate() === selectedDateFilter.getDate();
      } else {
        matchesDateFilter = false;
      }
    }

    let matchesTimeFilter = true;
    if (selectedTimePeriod) {
      if (eventDate) {
        const hours = eventDate.getHours();
        if (selectedTimePeriod === "morning") {
          matchesTimeFilter = hours >= 6 && hours < 12;
        } else if (selectedTimePeriod === "afternoon") {
          matchesTimeFilter = hours >= 12 && hours < 18;
        } else if (selectedTimePeriod === "evening") {
          matchesTimeFilter = hours >= 18 || hours < 6;
        }
      } else {
        matchesTimeFilter = false;
      }
    }

    return matchesSearch && matchesTab && matchesDateFilter && matchesTimeFilter;
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setEventForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setEventForm((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setEventForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title) return;
    setCreating(true);
    try {
      const eventDate = eventForm.event_date
        ? eventForm.event_date.length === 16 ? eventForm.event_date + ":00" : eventForm.event_date
        : new Date().toISOString().slice(0, 19);

      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        event_date: eventDate,
        is_featured: eventForm.is_featured,
        display_order: eventForm.display_order,
      };
      await api.createGalleryEvent(payload);
      setEventForm(EVENT_FORM_INITIAL);
      setShowForm(false);
      toast?.success("Event created");
      fetchEvents();
    } catch {
      toast?.error("Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await api.deleteGalleryEvent(eventId);
      toast?.success("Event deleted");
      if (expandedEventId === eventId) setExpandedEventId(null);
      fetchEvents();
    } catch {
      toast?.error("Failed to delete event");
    }
  };

  const handleToggleFeatured = async (event: any) => {
    try {
      const payload = {
        title: event.title,
        description: event.description,
        event_date: event.event_date ? event.event_date.slice(0, 19) : new Date().toISOString().slice(0, 19),
        is_featured: !event.is_featured,
        display_order: event.display_order || 0,
        is_active: event.is_active !== undefined ? event.is_active : true,
      };
      await api.updateGalleryEvent(event.id, payload);
      toast?.success(`Event ${!event.is_featured ? "marked as featured" : "unfeatured"}`);
      fetchEvents();
    } catch {
      toast?.error("Failed to update feature status");
    }
  };

  const handleSelectUploadImage = (e: React.ChangeEvent<HTMLInputElement>, eventId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageForm({
      file,
      eventId,
      imageId: null,
      caption: "",
      alt_text: "",
      is_cover: false,
      display_order: 0,
    });
    setImageModalMode("upload");
    if (e.target) e.target.value = "";
  };

  const handleEditImageModal = (img: any, eventId: number) => {
    setImageForm({
      file: null,
      eventId,
      imageId: img.id,
      caption: img.caption || "",
      alt_text: img.alt_text || "",
      is_cover: img.is_cover || false,
      display_order: img.display_order || 0,
    });
    setImageModalMode("edit");
  };

  const handleSubmitImageForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImage(true);
    try {
      if (imageModalMode === "upload") {
        if (!imageForm.file || !imageForm.eventId) return;
        await api.uploadGalleryImage(imageForm.file, imageForm.eventId, {
          caption: imageForm.caption,
          alt_text: imageForm.alt_text,
          is_cover: imageForm.is_cover,
          display_order: imageForm.display_order,
        });
        toast?.success("Image uploaded successfully");
      } else if (imageModalMode === "edit") {
        if (!imageForm.imageId) return;
        await api.updateGalleryImage(imageForm.imageId, {
          caption: imageForm.caption,
          alt_text: imageForm.alt_text,
          is_cover: imageForm.is_cover,
          display_order: imageForm.display_order,
        });
        toast?.success("Image updated successfully");
      }
      setImageModalMode(null);
      fetchEvents();
    } catch {
      toast?.error(`Failed to ${imageModalMode} image`);
    } finally {
      setSavingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await api.deleteGalleryImage(imageId);
      toast?.success("Image deleted");
      fetchEvents();
    } catch {
      toast?.error("Failed to delete image");
    }
  };

  const handleEditEvent = (event: any) => {
    let formattedDate = "";
    if (event.event_date) {
      const date = new Date(event.event_date);
      // Adjust offset if needed, or just use substring if backend sends UTC and frontend is local
      // Simple slice for now matching previous logic
      formattedDate = date.toISOString().slice(0, 16);
    }

    setEventForm({
      title: event.title || "",
      description: event.description || "",
      event_date: formattedDate,
      is_featured: event.is_featured || false,
      display_order: event.display_order || 0,
      // Check if backend returns is_active, default true
      is_active: event.is_active !== undefined ? event.is_active : true,
    });
    setEditingEventId(event.id);
    setShowForm(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !editingEventId) return;
    setUpdating(true);
    try {
      const eventDate = eventForm.event_date
        ? eventForm.event_date.length === 16 ? eventForm.event_date + ":00" : eventForm.event_date
        : new Date().toISOString().slice(0, 19);

      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        event_date: eventDate,
        is_featured: eventForm.is_featured,
        display_order: eventForm.display_order,
        is_active: eventForm.is_active,
      };
      await api.updateGalleryEvent(editingEventId, payload);
      setEventForm(EVENT_FORM_INITIAL);
      setEditingEventId(null);
      setShowForm(false);
      toast?.success("Event updated");
      fetchEvents();
    } catch {
      toast?.error("Failed to update event");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEventId(null);
    setEventForm(EVENT_FORM_INITIAL);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in bg-gray-50 dark:bg-[#1C1D1F] min-h-screen p-6">
      {/* LEFT COLUMN: Event List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recruiter Gallery Events
          </h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#0B6BCB] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Event
            </button>
          )}
        </div>

        {/* Create/Edit Form (Collapsible) */}
        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#313234] w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
              {/* Modal Header */}
              <div className="bg-[#0B172B] px-6 py-4 flex justify-between items-center text-white sticky top-0 z-10">
                <h3 className="text-lg font-medium">
                  {editingEventId ? "Edit Event" : "Create New Event"}
                </h3>
                <button
                  onClick={handleCancelForm}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                <form
                  onSubmit={
                    editingEventId ? handleUpdateEvent : handleCreateEvent
                  }
                  className="space-y-6"
                >
                  {/* Title and Date Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event titke
                      </label>
                      <input
                        name="title"
                        value={eventForm.title}
                        onChange={handleFormChange}
                        placeholder="Enter Event title"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event date
                      </label>
                      <input
                        type="datetime-local"
                        name="event_date"
                        value={eventForm.event_date}
                        onChange={handleFormChange}
                        placeholder="dd/mm/yyyy"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Description
                    </label>
                    <RichTextEditor
                      value={eventForm.description}
                      onChange={(content: string) =>
                        setEventForm((prev) => ({
                          ...prev,
                          description: content,
                        }))
                      }
                      placeholder="Event Description"
                    />
                  </div>

                  {/* Bottom Row: Order, Checkboxes + Buttons */}
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6 pt-2">
                    {/* Order Input and Checkboxes */}
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                      <div className="w-full md:w-32 space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Order
                        </label>
                        <input
                          type="number"
                          name="display_order"
                          value={eventForm.display_order}
                          onChange={handleFormChange}
                          placeholder="Display Order"
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-6 pb-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={eventForm.is_featured}
                            onChange={(e) => setEventForm({ ...eventForm, is_featured: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          Featured Event
                        </label>
                        {editingEventId && (
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              name="is_active"
                              checked={eventForm.is_active}
                              onChange={(e) => setEventForm({ ...eventForm, is_active: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            Active
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={handleCancelForm}
                        className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating || updating}
                        className="flex-1 md:flex-none px-6 py-3 bg-[#007BFF] hover:bg-primary-blue text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70 whitespace-nowrap"
                      >
                        {editingEventId
                          ? updating
                            ? "Saving..."
                            : "Update Event"
                          : creating
                            ? "Creating..."
                            : "Create Event"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Event List Table */}
        <div className="bg-white dark:bg-[#313234] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[87vh]">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 bg-[#2F4269] dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-white uppercase sticky top-0 z-10 backdrop-blur-sm">
            <div className="col-span-6">Event Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                {searchQuery
                  ? "No matching events found."
                  : "No events found in this tab."}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEvents.map((event) => {
                  const isActive = event.is_active !== false;
                  const isPast = new Date(event.event_date) < new Date();
                  // Determine display status based on conditions
                  let statusLabel = "Active";
                  let statusClass =
                    "bg-[#E6F6EC] text-[#037847] dark:bg-green-900/30 dark:text-green-400";

                  if (!isActive) {
                    statusLabel = "Inactive";
                    statusClass =
                      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
                  } else if (isPast) {
                    statusLabel = "Closed";
                    statusClass =
                      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
                  }

                  return (
                    <div key={event.id} className="flex flex-col">
                      <div className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="col-span-6">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {event.title || `Event #${event.id}`}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.event_date
                                ? new Date(event.event_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "No date"}
                            </span>
                            <span>Order: {event.display_order}</span>
                            {event.is_featured && (
                              <span className="text-primary-blue font-medium">Featured</span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="col-span-3 flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeatured(event)}
                            className={`p-2 rounded-full transition-colors ${event.is_featured ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-yellow-500"}`}
                            title={event.is_featured ? "Remove featured" : "Mark as featured"}
                          >
                            <Star className={`w-4 h-4 ${event.is_featured ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                            className={`p-2 rounded-full transition-colors ${expandedEventId === event.id ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500"}`}
                            title="View Images"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-blue transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Event Images Expanded View */}
                      {expandedEventId === event.id && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                              Event Images ({event.images?.length || 0})
                            </h5>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                id={`upload-image-${event.id}`}
                                className="hidden"
                                onChange={(e) => handleSelectUploadImage(e, event.id)}
                              />
                              <label
                                htmlFor={`upload-image-${event.id}`}
                                className={`cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors`}
                              >
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  Upload Image
                                </>
                              </label>
                            </div>
                          </div>

                          {!event.images || event.images.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500 bg-white dark:bg-[#313234] rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                              No images uploaded for this event.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                              {event.images.map((img: any) => (
                                <div
                                  key={img.id}
                                  className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#313234]"
                                >
                                  <img
                                    src={img.image_url}
                                    alt={img.caption || "Event image"}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleEditImageModal(img, event.id)}
                                      className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                                      title="Edit Image"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteImage(img.id)}
                                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                      title="Delete Image"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {img.is_cover && (
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded shadow-sm uppercase">
                                      Cover
                                    </div>
                                  )}
                                </div>
                              ))}
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
        </div>
      </div>

      {/* RIGHT COLUMN: Filters & Calendar */}
      <div className="w-full lg:w-64 space-y-6">
        <div className="bg-white dark:bg-[#313234] mt-10.5 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-[#2F4269] px-4 py-2 ">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Filters
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                Event Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Event Name"
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#313234] border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                />
              </div>
            </div>

            {/* Filter Options */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                Status
              </label>
              <div className="space-y-2">
                {["Active", "Draft", "Closed"].map((tab) => (
                  <div
                    key={tab}
                    className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center justify-between group ${activeTab === tab ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-white dark:bg-[#313234] border-gray-100 dark:border-gray-700 hover:border-blue-200"}`}
                    onClick={() => setActiveTab(tab as any)}
                  >
                    <span
                      className={`text-sm ${activeTab === tab ? "text-blue-700 dark:text-blue-400 font-semibold" : "text-gray-600 dark:text-gray-400"}`}
                    >
                      {tab}
                    </span>
                    {activeTab === tab && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar & Time (Filtering) */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <button
              onClick={() => setFilterTab("dates")}
              className={`text-xs font-bold uppercase transition-colors ${filterTab === "dates" ? "text-[#0B6BCB] dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
            >
              Dates
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={() => setFilterTab("time")}
              className={`text-xs font-bold uppercase transition-colors ${filterTab === "time" ? "text-[#0B6BCB] dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
            >
              Time
            </button>
          </div>
          {filterTab === "dates" ? (
            <CustomCalendar selectedDate={selectedDateFilter} onSelectDate={setSelectedDateFilter} />
          ) : (
            <TimeSelector selectedTimePeriod={selectedTimePeriod} onSelectTimePeriod={setSelectedTimePeriod} />
          )}
        </div>
      </div>


      {/* Image Upload/Edit Modal */}
      {imageModalMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#313234] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0B172B] px-6 py-4 flex justify-between items-center text-white sticky top-0 z-10">
              <h3 className="text-lg font-medium">
                {imageModalMode === "upload" ? "Upload Image Details" : "Edit Image Details"}
              </h3>
              <button
                onClick={() => setImageModalMode(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmitImageForm} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Caption</label>
                  <input
                    type="text"
                    value={imageForm.caption}
                    onChange={(e) => setImageForm({ ...imageForm, caption: e.target.value })}
                    placeholder="Enter image caption"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alt Text</label>
                  <input
                    type="text"
                    value={imageForm.alt_text}
                    onChange={(e) => setImageForm({ ...imageForm, alt_text: e.target.value })}
                    placeholder="Enter image alt text"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imageForm.is_cover}
                      onChange={(e) => setImageForm({ ...imageForm, is_cover: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    Set as Cover Image
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Order</label>
                  <input
                    type="number"
                    value={imageForm.display_order}
                    onChange={(e) => setImageForm({ ...imageForm, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setImageModalMode(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingImage}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingImage ? "Saving..." : "Save Image"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
