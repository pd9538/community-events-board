"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
};

type FeedResponse = {
  success: boolean;
  categories?: EventCategory[];
  events?: EventItem[];
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

export default function FeedPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeed() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/feed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: FeedResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load your feed.");
        }

        setEvents(data.events || []);
        setCategories(data.categories || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your feed."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Unable to load your feed
          </h1>

          <p className="mt-2 text-slate-500">{error}</p>

          <Link
            href="/events"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Browse Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/events"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              ← Browse Events
            </Link>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              My Feed
            </h1>

            <p className="mt-2 text-slate-600">
              Upcoming events based on your favourite categories.
            </p>
          </div>

          <Link
            href="/favourites"
            className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ⚙️ Edit Preferences
          </Link>
        </div>

        {/* Favourite categories */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
              >
                {categoryLabels[category]}
              </span>
            ))}
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="text-5xl">📅</div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No upcoming events found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              {categories.length === 0
                ? "Choose your favourite categories to get personalised event recommendations."
                : "There are currently no upcoming events in your favourite categories."}
            </p>

            <Link
              href="/favourites"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Choose Categories
            </Link>
          </div>
        )}

        {/* Event cards */}
        {events.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {categoryLabels[event.category]}
                  </span>

                  <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-900">
                    {event.title}
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>📅 {formatDate(event.dateTime)}</p>
                    <p>📍 {event.city}</p>
                    <p className="font-semibold text-indigo-600">
                      💰 {formatPrice(event.price)}
                    </p>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                    {event.description}
                  </p>

                  <Link
                    href={`/events/${event.id}`}
                    className="mt-5 block rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}