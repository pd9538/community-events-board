import Link from "next/link";

const categories = [
  {
    name: "Music",
    icon: "🎵",
    description: "Concerts, live performances and music events",
  },
  {
    name: "Workshop",
    icon: "🛠️",
    description: "Learn new skills and explore your interests",
  },
  {
    name: "Food",
    icon: "🍕",
    description: "Food festivals, tastings and local experiences",
  },
  {
    name: "Sports",
    icon: "🏆",
    description: "Games, tournaments and sporting activities",
  },
  {
    name: "Kids",
    icon: "👨‍👩‍👧‍👦",
    description: "Fun and engaging events for children and families",
  },
];

export default function Home() {
  return (
    <main className="flex-1 bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 ring-1 ring-white/20">
              Discover what's happening around you
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find events.
              <br />
              Make memories.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-indigo-100 sm:text-xl">
              Discover music, workshops, food festivals, sports and family
              events happening in your city.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                Explore Events
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 right-20 h-80 w-80 rounded-full bg-purple-400/20" />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            Explore by interest
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Something for everyone
          </h2>

          <p className="mt-2 max-w-2xl text-slate-600">
            Choose a category and discover upcoming events that match your
            interests.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/events?category=${category.name.toUpperCase()}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100">
                {category.icon}
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-indigo-600">
              Simple & easy
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              How it works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                1
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Discover
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Browse upcoming events and use filters to find exactly what
                interests you.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                2
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Personalize
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose your favourite categories and get a personalized feed
                of upcoming events.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                3
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Never miss out
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Set reminders for events you don't want to miss and design your
                own event card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to discover your next event?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Explore upcoming events happening in your community.
          </p>

          <Link
            href="/events"
            className="mt-7 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
          >
            Browse Events
          </Link>
        </div>
      </section>
    </main>
  );
}