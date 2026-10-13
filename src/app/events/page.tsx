"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


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

type EventsResponse = {
  success: boolean;
  events: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

const categories: {
  value: EventCategory;
  label: string;
}[] = [
  { value: "MUSIC", label: "Music" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "FOOD", label: "Food" },
  { value: "SPORTS", label: "Sports" },
  { value: "KIDS", label: "Kids" },
];

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

function getCategoryLabel(category: EventCategory) {
  return categories.find((item) => item.value === category)?.label ?? category;
}

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);

  /*
   * Category comes directly from the URL.
   *
   * Example:
   * /events?category=MUSIC
   *
   * category will be "MUSIC".
   */
  const urlCategory = searchParams.get("category");

  const category: EventCategory | "" =
    urlCategory && categories.some((item) => item.value === urlCategory)
      ? (urlCategory as EventCategory)
      : "";

  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * When category changes from the URL,
   * always start from page 1.
   */
  useEffect(() => {
    setPage(1);
  }, [urlCategory]);

  /*
   * Fetch events whenever filters/page change.
   */
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (category) {
          params.set("category", category);
        }

        if (city.trim()) {
          params.set("city", city.trim());
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        params.set("page", String(page));
        params.set("limit", "6");

        const response = await fetch(`/api/events?${params.toString()}`);

        const data: EventsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load events");
        }

        setEvents(data.events);
        setTotalPages(data.pagination.totalPages);
        setTotalEvents(data.pagination.total);
      } catch (error) {
        console.error(error);

        setEvents([]);
        setError("Unable to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    }



    fetchEvents();
  }, [category, city, search, page]);

  /*
   * Category dropdown.
   *
   * Instead of only changing React state,
   * update the URL as well.
   *
   * Example:
   * MUSIC -> /events?category=MUSIC
   * FOOD  -> /events?category=FOOD
   */
  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    // Category change should always start from page 1.
    setPage(1);

    const query = params.toString();

    router.push(query ? `/events?${query}` : "/events");
  }

  function handleCityChange(value: string) {
    setCity(value);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function clearFilters() {
    setCity("");
    setSearch("");
    setPage(1);

    /*
     * Remove category from URL as well.
     */
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");

    const query = params.toString();

    router.push(query ? `/events?${query}` : "/events");
  }

  /*
   * Retry function.
   */
  async function retryFetch() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (category) {
        params.set("category", category);
      }

      if (city.trim()) {
        params.set("city", city.trim());
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      params.set("page", String(page));
      params.set("limit", "6");

      const response = await fetch(`/api/events?${params.toString()}`);

      const data: EventsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load events");
      }

      setEvents(data.events);
      setTotalPages(data.pagination.totalPages);
      setTotalEvents(data.pagination.total);
    } catch (error) {
      console.error(error);

      setEvents([]);
      setError("Unable to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Community Events
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Discover Events
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Find upcoming events happening around your city.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search events, description or city..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All categories</option>

                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                City
              </label>

              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Result count + clear */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {loading
                ? "Loading events..."
                : `${totalEvents} upcoming event${
                    totalEvents === 1 ? "" : "s"
                  } found`}
            </p>

            {(category || city || search) && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="h-48 animate-pulse bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={retryFetch}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🔎</div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No events found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Event Cards */}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
                      {event.title}
                    </h2>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(event.dateTime)}</span>
                      </p>

                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.city}</span>
                      </p>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {event.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-500">Entry price</p>

                        <p className="text-lg font-bold text-indigo-600">
                          {formatPrice(event.price)}
                        </p>
                      </div>

                      <a
                        href={`/events/${event.id}`}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        View Event
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
    export default function EventsPage() {
      return (
        <Suspense fallback={<div className="p-6">Loading events...</div>}>
          <EventsPageContent />
        </Suspense>
      );
    }