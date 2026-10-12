"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type EventCategory = "MUSIC" | "WORKSHOP" | "FOOD" | "SPORTS" | "KIDS";

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

type EventResponse = {
  success: boolean;
  event?: EventItem;
  message?: string;
};

const categoryLabels: Record<EventCategory, string> = {
  MUSIC: "Music",
  WORKSHOP: "Workshop",
  FOOD: "Food",
  SPORTS: "Sports",
  KIDS: "Kids",
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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateTime));
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchEvent() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/events/${id}`);
        const data: EventResponse = await response.json();

        if (!response.ok || !data.success || !data.event) {
          throw new Error(data.message || "Failed to load event");
        }

        setEvent(data.event);

        // Check whether the logged-in user already has a reminder
        const token = localStorage.getItem("token");

        if (token) {
          const reminderResponse = await fetch("/api/reminders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const reminderData = await reminderResponse.json();

          if (reminderResponse.ok && reminderData.success) {
            const savedEventIds: number[] = reminderData.eventIds || [];

            setReminderSaved(savedEventIds.includes(data.event.id));
          }
        }
      } catch (error) {
        console.error(error);
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  async function handleReminder() {
    if (!event) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to set a reminder.");
      return;
    }

    // Optimistic UI update
    const previousState = reminderSaved;

    setReminderSaved(true);
    setReminderLoading(true);
    setReminderError("");

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save reminder");
      }
    } catch (error) {
      console.error(error);

      // Rollback optimistic UI
      setReminderSaved(previousState);

      const errorMessage =
        error instanceof Error ? error.message : "Unable to save reminder.";

      setReminderError(errorMessage);
    } finally {
      setReminderLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-72 bg-slate-200" />

          <div className="space-y-4 p-6">
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="h-5 w-1/2 rounded bg-slate-200" />
            <div className="h-20 w-full rounded bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">😕</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Event not found
          </h1>

          <p className="mt-2 text-slate-500">
            {error || "This event could not be found."}
          </p>

          <Link
            href="/events"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Events
        </Link>

        {/* Event */}
        <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Image */}
          <div className="h-64 overflow-hidden sm:h-80 lg:h-96">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Category */}
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {categoryLabels[event.category]}
            </span>

            {/* Title */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {event.title}
            </h1>

            {/* Event information */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Date & Time
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  📅 {formatDate(event.dateTime)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Location
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  📍 {event.city}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Entry Price
                </p>

                <p className="mt-2 font-semibold text-indigo-600">
                  {formatPrice(event.price)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900">
                About this event
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                {event.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={handleReminder}
                disabled={reminderLoading || reminderSaved}
                className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                  reminderSaved
                    ? "cursor-default bg-green-100 text-green-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                }`}
              >
                {reminderLoading
                  ? "Saving..."
                  : reminderSaved
                    ? "✓ Reminder Saved"
                    : "🔔 Remind Me"}
              </button>

              <Link
                href={`/events/${event.id}/design`}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                🎨 Design Your Card
              </Link>
            </div>
            {reminderError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {reminderError}
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
