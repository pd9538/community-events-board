"use client";

import { FormEvent, useEffect, useState } from "react";

type EventCategory =
  | "MUSIC"
  | "WORKSHOP"
  | "FOOD"
  | "SPORTS"
  | "KIDS";

type EventItem = {
  id: number;
  title: string;
  category: EventCategory;
  city: string;
  dateTime: string;
  price: string | number;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const categories: { value: EventCategory; label: string }[] = [
  { value: "MUSIC", label: "Music" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "FOOD", label: "Food" },
  { value: "SPORTS", label: "Sports" },
  { value: "KIDS", label: "Kids" },
];

const emptyForm = {
  title: "",
  category: "MUSIC" as EventCategory,
  city: "",
  dateTime: "",
  price: "",
  description: "",
  imageUrl: "",
};

function formatPrice(price: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatDate(dateTime: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateTime));
}

function toDateTimeLocal(dateTime: string) {
  const date = new Date(dateTime);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      window.location.href = "/login";
      return;
    }

    try {
      const user = JSON.parse(userJson);

      if (user.role !== "ADMIN") {
        window.location.href = "/events";
        return;
      }
    } catch {
      window.location.href = "/login";
      return;
    }

    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/admin/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load events");
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startEdit(event: EventItem) {
    setEditingId(event.id);

    setForm({
      title: event.title,
      category: event.category,
      city: event.city,
      dateTime: toDateTimeLocal(event.dateTime),
      price: String(event.price),
      description: event.description,
      imageUrl: event.imageUrl,
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        city: form.city.trim(),
        dateTime: new Date(form.dateTime).toISOString(),
        price: Number(form.price),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      const url = editingId
        ? `/api/admin/events/${editingId}`
        : "/api/admin/events";

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save event");
      }

      setSuccess(
        editingId
          ? "Event updated successfully."
          : "Event created successfully."
      );

      setForm(emptyForm);
      setEditingId(null);

      await fetchEvents();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(event: EventItem) {
    setUpdatingId(event.id);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !event.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update event");
      }

      setSuccess(
        event.isActive
          ? "Event deactivated."
          : "Event activated."
      );

      await fetchEvents();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update event."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Event Management
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Add, edit and activate/deactivate community events.
            </p>
          </div>

          <a
            href="/events"
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View Public Events
          </a>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Form */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Event" : "Add New Event"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update the event information below."
                  : "Create a new community event."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Event Title
                </label>

                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    handleInputChange("title", e.target.value)
                  }
                  placeholder="e.g. Pune Music Festival"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    handleInputChange(
                      "category",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {categories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  City
                </label>

                <input
                  required
                  value={form.city}
                  onChange={(e) =>
                    handleInputChange("city", e.target.value)
                  }
                  placeholder="e.g. Pune"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Date & Time
                </label>

                <input
                  required
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(e) =>
                    handleInputChange(
                      "dateTime",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Price (₹)
                </label>

                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    handleInputChange(
                      "price",
                      e.target.value
                    )
                  }
                  placeholder="499"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Image URL
                </label>

                <input
                  required
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    handleInputChange(
                      "imageUrl",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the event..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Event"
                : "Add Event"}
            </button>
          </form>
        </section>

        {/* Events */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-xl font-bold text-slate-900">
              All Events
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {events.length} event{events.length === 1 ? "" : "s"}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No events found.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-5 transition hover:bg-slate-50 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {
                            categories.find(
                              (category) =>
                                category.value === event.category
                            )?.label
                          }
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            event.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {event.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">
                        {event.title}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <p>📍 {event.city}</p>
                        <p>📅 {formatDate(event.dateTime)}</p>
                        <p>💰 {formatPrice(event.price)}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(event)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === event.id}
                        onClick={() => toggleActive(event)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                          event.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {updatingId === event.id
                          ? "Updating..."
                          : event.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}