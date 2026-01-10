import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

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

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMyGalleryEvents();
      setEvents(res?.events || res || []);
    } catch {
      toast?.error("Failed to load gallery events");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
      // Format datetime without timezone for backend compatibility
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
    // Format datetime for input field (YYYY-MM-DDTHH:MM)
    let formattedDate = "";
    if (event.event_date) {
      const date = new Date(event.event_date);
      formattedDate = date.toISOString().slice(0, 16);
    }

    setEventForm({
      title: event.title || "",
      description: event.description || "",
      event_date: formattedDate,
      is_featured: event.is_featured || false,
      display_order: event.display_order || 0,
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          Recruiter Gallery Events
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Event
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={editingEventId ? handleUpdateEvent : handleCreateEvent}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {editingEventId ? "Edit Event" : "Create New Event"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              value={eventForm.title}
              onChange={handleFormChange}
              placeholder="Event Title"
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <input
              type="datetime-local"
              name="event_date"
              value={eventForm.event_date}
              onChange={handleFormChange}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <textarea
            name="description"
            value={eventForm.description}
            onChange={handleFormChange}
            placeholder="Event Description"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="display_order"
                value={eventForm.display_order}
                onChange={handleFormChange}
                min="0"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={eventForm.is_featured}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Featured Event
              </label>
            </div>
          </div>

          {editingEventId && (
            <div className="flex items-center">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={eventForm.is_active}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Active Event
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              {editingEventId
                ? updating
                  ? "Updating..."
                  : "Update Event"
                : creating
                ? "Creating..."
                : "Create Event"}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-400 dark:text-gray-500 font-medium mb-4">
            No gallery events found.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {event.title || event.name || `Event #${event.id}`}
                    </h3>
                    {event.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-lg">
                        Featured
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    {event.event_date && (
                      <span className="flex items-center gap-1">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    )}
                    {event.display_order !== undefined && (
                      <span className="text-gray-400 dark:text-gray-600">
                        Order: {event.display_order}
                      </span>
                    )}
                    {event.is_active === false && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Edit Event"
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
                    onClick={() => handleDeleteEvent(event.id)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete Event"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
