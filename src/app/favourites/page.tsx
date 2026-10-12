"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category =
  | "MUSIC"
  | "WORKSHOP"
  | "FOOD"
  | "SPORTS"
  | "KIDS";

const categories: {
  value: Category;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "MUSIC",
    label: "Music",
    icon: "🎵",
    description: "Concerts, live music and performances",
  },
  {
    value: "WORKSHOP",
    label: "Workshop",
    icon: "🛠️",
    description: "Learn something new and practical",
  },
  {
    value: "FOOD",
    label: "Food",
    icon: "🍕",
    description: "Food festivals, tastings and experiences",
  },
  {
    value: "SPORTS",
    label: "Sports",
    icon: "🏆",
    description: "Matches, tournaments and activities",
  },
  {
    value: "KIDS",
    label: "Kids",
    icon: "👨‍👩‍👧‍👦",
    description: "Fun activities and events for kids",
  },
];

export default function FavouritesPage() {
  const router = useRouter();

  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadFavourites() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/favourites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load favourite categories."
          );
        }

        setSelectedCategories(data.categories || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your preferences."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFavourites();
  }, [router]);

  function toggleCategory(category: Category) {
    setMessage("");
    setError("");

    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      return [...current, category];
    });
  }

  async function saveFavourites() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories: selectedCategories,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save favourite categories."
        );
      }

      setMessage("Your favourite categories have been saved.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save your preferences."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          href="/events"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Events
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Your Favourite Categories
          </h1>

          <p className="mt-2 text-slate-600">
            Choose the types of events you're interested in. We'll use these
            preferences to build your personalised feed.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {/* Categories */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => {
            const selected = selectedCategories.includes(category.value);

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => toggleCategory(category.value)}
                className={`relative rounded-2xl border p-5 text-left transition-all duration-200 ${
                  selected
                    ? "scale-[1.02] border-indigo-500 bg-indigo-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                }`}
              >
                {/* Selected indicator */}
                <div
                  className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  ✓
                </div>

                <div className="text-4xl">{category.icon}</div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  {category.label}
                </h2>

                <p className="mt-1 pr-8 text-sm leading-5 text-slate-500">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selection count */}
        <div className="mt-6 rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-semibold text-slate-900">
            {selectedCategories.length}
          </span>{" "}
          {selectedCategories.length === 1 ? "category" : "categories"}{" "}
          selected
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={saveFavourites}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving Preferences..." : "Save Preferences"}
        </button>

        {/* Feed link */}
        <div className="mt-4 text-center">
          <Link
            href="/feed"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View My Feed →
          </Link>
        </div>
      </div>
    </main>
  );
}