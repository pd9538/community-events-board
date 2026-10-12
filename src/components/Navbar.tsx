"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    function loadUser() {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");

      // No token or user means logged out
      if (!token || !userJson) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(userJson);

        setUser(parsedUser);
      } catch {
        // Invalid user data
        localStorage.removeItem("user");
        setUser(null);
      }
    }

    // Load current user when Navbar mounts
    loadUser();

    // Detect changes from another browser tab
    window.addEventListener("storage", loadUser);

    // Detect login/logout changes from the same browser tab
    window.addEventListener("auth-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    // Tell Navbar and other components that auth changed
    window.dispatchEvent(new Event("auth-change"));

    window.location.href = "/events";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold text-indigo-600 sm:text-xl"
        >
          Community Events
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/events"
            className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Events
          </Link>

          {user ? (
            <>
              <Link
                href="/favourites"
                className="hidden rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block"
              >
                Favourites
              </Link>

              <Link
                href="/feed"
                className="hidden rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block"
              >
                My Feed
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin/events"
                  className="hidden rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 sm:block"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile logged-in navigation */}
      {user && (
        <div className="border-t border-slate-100 sm:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
            <Link
              href="/favourites"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Favourites
            </Link>

            <Link
              href="/feed"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              My Feed
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin/events"
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}