"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
};

type Theme = "SUNSET" | "MIDNIGHT" | "MINT";

const themes: { value: Theme; label: string; className: string }[] = [
  {
    value: "SUNSET",
    label: "Sunset",
    className: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",
  },
  {
    value: "MIDNIGHT",
    label: "Midnight",
    className: "bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900",
  },
  {
    value: "MINT",
    label: "Mint",
    className: "bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500",
  },
];

const stickers = ["🎵", "🎉", "🍕", "🏆", "👨‍👩‍👧‍👦"];

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

export default function CardDesignerPage() {
  const params = useParams();
  const eventId = String(params.id);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [theme, setTheme] = useState<Theme>("SUNSET");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();

        if (!eventResponse.ok || !eventData.success) {
          throw new Error(eventData.message || "Unable to load event");
        }

        setEvent(eventData.event);

        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const designResponse = await fetch(
          `/api/card-design/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const designData = await designResponse.json();

        if (designResponse.ok && designData.success && designData.design) {
          setTheme(designData.design.theme as Theme);
          setSelectedStickers(
            Array.isArray(designData.design.stickers)
              ? designData.design.stickers
              : []
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId]);

  function selectSticker(sticker: string) {
    setMessage("");
    setError("");

    if (selectedStickers.includes(sticker)) {
      return;
    }

    if (selectedStickers.length >= 3) {
      setError("You can select maximum 3 stickers.");
      return;
    }

    setSelectedStickers((current) => [...current, sticker]);
  }

  function removeSticker(sticker: string) {
    setMessage("");
    setError("");

    setSelectedStickers((current) =>
      current.filter((item) => item !== sticker)
    );
  }

  async function saveDesign() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before saving your card design.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`/api/card-design/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theme,
          stickers: selectedStickers,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save design");
      }

      setMessage("Card design saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save design"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="h-[500px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-[500px] animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Event not found
          </h1>

          <Link
            href="/events"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const activeTheme =
    themes.find((item) => item.value === theme) || themes[0];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/events/${event.id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Event
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Design Your Card
          </h1>

          <p className="mt-2 text-slate-600">
            Choose a background and up to 3 stickers for your event card.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Preview */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Live Preview
            </h2>

            <div
              className={`relative min-h-[520px] overflow-hidden rounded-3xl p-6 shadow-xl transition-all duration-500 sm:p-8 ${activeTheme.className}`}
            >
              {/* Decorative circles */}
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10" />

              {/* Stickers */}
              <div className="relative z-10 flex min-h-12 flex-wrap gap-2">
                {selectedStickers.map((sticker, index) => (
                  <div
                    key={`${sticker}-${index}`}
                    className="animate-[pulse_1.5s_ease-in-out_1] text-4xl transition-all duration-300"
                  >
                    {sticker}
                  </div>
                ))}
              </div>

              {/* Event image */}
              <div className="relative z-10 mt-4 overflow-hidden rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-52 w-full object-cover sm:h-60"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 mt-6 rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-500">
                <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
                  {categoryLabels[event.category]}
                </span>

                <h3 className="mt-3 text-2xl font-bold text-slate-900">
                  {event.title}
                </h3>

                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>📅 {formatDate(event.dateTime)}</p>
                  <p>📍 {event.city}</p>
                  <p className="font-semibold">
                    💰 {formatPrice(event.price)}
                  </p>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {event.description}
                </p>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Background Theme
              </h2>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {themes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setTheme(item.value);
                      setMessage("");
                      setError("");
                    }}
                    className={`relative h-24 overflow-hidden rounded-xl ${item.className} transition-all duration-300 ${
                      theme === item.value
                        ? "scale-[1.03] ring-4 ring-indigo-500 ring-offset-2"
                        : "hover:scale-[1.02]"
                    }`}
                  >
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 text-xs font-semibold text-white">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stickers */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Stickers
                </h2>

                <span className="text-sm text-slate-500">
                  {selectedStickers.length}/3 selected
                </span>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {stickers.map((sticker) => {
                  const selected = selectedStickers.includes(sticker);

                  return (
                    <button
                      key={sticker}
                      type="button"
                      onClick={() => selectSticker(sticker)}
                      className={`flex h-16 items-center justify-center rounded-xl border text-3xl transition-all duration-200 ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 scale-105"
                          : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      {sticker}
                    </button>
                  );
                })}
              </div>

              {/* Selected stickers */}
              {selectedStickers.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Selected stickers
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedStickers.map((sticker) => (
                      <div
                        key={sticker}
                        className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xl transition-all duration-300"
                      >
                        <span>{sticker}</span>

                        <button
                          type="button"
                          onClick={() => removeSticker(sticker)}
                          className="text-sm font-bold text-slate-500 hover:text-red-600"
                          aria-label={`Remove ${sticker}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {/* Save */}
            <button
              type="button"
              onClick={saveDesign}
              disabled={saving}
              className="mt-8 w-full rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Design..." : "Save Design"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Your design is saved specifically for this event.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}