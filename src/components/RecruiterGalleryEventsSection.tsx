
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Search, Calendar, ChevronLeft, ChevronRight, Edit2, Trash2, X } from "lucide-react";
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

// --- Calendar Component (Mock) ---
const CustomCalendar = () => {
  // This is a visual mock to match the screenshot. 
  // In a real app, use a library like react-day-picker or build full logic.
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm">Januari 2022</span>
        <div className="flex gap-2">
          <ChevronLeft className="w-4 h-4 text-gray-400" />
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
        <div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div><div>MIN</div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs gap-y-3 font-medium text-gray-600">
        {/* Mock dates */}
        <div className="bg-[#0B6BCB] text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">1</div>
        <div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
        <div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div>
        <div>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div>
        <div>22</div><div>23</div><div>24</div><div>25</div><div>26</div><div>27</div><div>28</div>
        <div>29</div><div>30</div><div>31</div>
      </div>
    </div>
  )
}

export default function RecruiterGalleryEventsSection({
  toast,
}: {
  recruiter: any;
  toast: any;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventForm, setEventForm] = useState<EventFormState>(EVENT_FORM_INITIAL);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState<"Active" | "Draft" | "Closed">("Active");
  const [searchQuery, setSearchQuery] = useState("");

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
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status Logic
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const isPast = eventDate < now;
    const isActive = event.is_active !== false; // Default to true if undefined

    let matchesTab = false;
    if (activeTab === "Active") {
      // Show active future events (or all active if you prefer)
      // For "Active" tab, let's show active future events
      matchesTab = isActive && !isPast;
    } else if (activeTab === "Closed") {
      // Show past events regardless of active status, or maybe just active past ones?
      // Usually "Closed" means past.
      matchesTab = isPast;
    } else if (activeTab === "Draft") {
      // Show inactive events
      matchesTab = !isActive;
    }

    return matchesSearch && matchesTab;
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        ? eventForm.event_date.replace("T", " ") + ":00"
        : new Date().toISOString().slice(0, 19).replace("T", " ");

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
      fetchEvents();
    } catch {
      toast?.error("Failed to delete event");
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
        ? eventForm.event_date.replace("T", " ") + ":00"
        : new Date().toISOString().slice(0, 19).replace("T", " ");

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Gallery Events</h1>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#313234] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="bg-[#0B172B] px-6 py-4 flex justify-between items-center text-white">
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
              <div className="p-8">
                <form onSubmit={editingEventId ? handleUpdateEvent : handleCreateEvent} className="space-y-6">

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
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={handleFormChange}
                      placeholder="Event Description"
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Bottom Row: Order + Buttons */}
                  <div className="flex flex-col md:flex-row items-end justify-between gap-6 pt-2">

                    {/* Order Input */}
                    <div className="w-full md:w-1/3 space-y-2">
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
                        className="flex-1 md:flex-none px-6 py-3 bg-[#007BFF] hover:bg-blue-600 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70 whitespace-nowrap"
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

                  {/* Hidden/Extra Fields if functional but not in screenshot design focus */}
                  <div className="hidden">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={eventForm.is_featured}
                        onChange={handleFormChange}
                      />
                      Featured
                    </label>
                    {editingEventId && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={eventForm.is_active}
                          onChange={handleFormChange}
                        />
                        Active
                      </label>
                    )}
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* Event List Table */}
        <div className="bg-white dark:bg-[#313234] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[600px]">

          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 bg-[#0B172B] text-white dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
            <div className="col-span-6">Event Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                {searchQuery ? "No matching events found." : "No events found in this tab."}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEvents.map((event) => {
                  const isActive = event.is_active !== false;
                  const isPast = new Date(event.event_date) < new Date();
                  // Determine display status based on conditions
                  let statusLabel = "Active";
                  let statusClass = "bg-[#E6F6EC] text-[#037847] dark:bg-green-900/30 dark:text-green-400";

                  if (!isActive) {
                    statusLabel = "Inactive";
                    statusClass = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
                  } else if (isPast) {
                    statusLabel = "Closed";
                    statusClass = "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
                  }

                  return (
                    <div key={event.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="col-span-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{event.title || `Event #${event.id}`}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.event_date ? new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No date"}
                          </span>
                          <span>Order: {event.display_order}</span>
                          {event.is_featured && <span className="text-blue-600 font-medium">Featured</span>}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="col-span-3 flex justify-end gap-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors"
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Filters & Calendar */}
      <div className="w-full lg:w-64 space-y-6">

        <div className="bg-white dark:bg-[#313234] rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-[#0B172B] px-4 py-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Event Name</label>
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
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Status</label>
              <div className="space-y-2">
                {["Active", "Draft", "Closed"].map((tab) => (
                  <div
                    key={tab}
                    className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center justify-between group ${activeTab === tab ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-[#313234] border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}
                    onClick={() => setActiveTab(tab as any)}
                  >
                    <span className={`text-sm ${activeTab === tab ? 'text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                      {tab}
                    </span>
                    {activeTab === tab && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar (Visual Only) */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Dates</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Time</span>
          </div>
          <CustomCalendar />
        </div>

      </div>

    </div>
  );
}
