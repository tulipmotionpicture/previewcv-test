import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function RecruiterGalleryEventsSection({
  toast,
}: {
  recruiter: any;
  toast: any;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [creating, setCreating] = useState(false);

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;
    setCreating(true);
    try {
      await api.createGalleryEvent({ name: newEventName });
      setNewEventName("");
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-black mb-8">Recruiter Gallery Events</h1>
      <form onSubmit={handleCreateEvent} className="flex gap-4 mb-8">
        <input
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          placeholder="New Event Name"
          className="px-4 py-2 rounded-lg border"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"
        >
          {creating ? "Creating..." : "Create Event"}
        </button>
      </form>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-400">No gallery events found.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="bg-white rounded-xl p-4 shadow flex items-center justify-between"
            >
              <span className="font-bold text-lg">
                {event.name || event.title || `Event #${event.id}`}
              </span>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
