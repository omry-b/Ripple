"use client";

import { useCallback, useEffect, useState } from "react";
import type { WatchlistRecord } from "@/lib/data/types";
import { useWatchlist } from "@/context/WatchlistContext";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import Link from "next/link";

const DIGEST_KEY = "ripple-watchlist-digest";

type WatchlistManagerProps = {
  selectedCompanyIds?: string[];
};

export function WatchlistManager({ selectedCompanyIds = [] }: WatchlistManagerProps) {
  const { ids, isSignedIn, addMany } = useWatchlist();
  const [lists, setLists] = useState<WatchlistRecord[]>([]);
  const [name, setName] = useState("My portfolio");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [digestFrequency, setDigestFrequency] = useState<"off" | "daily" | "weekly">("off");

  useEffect(() => {
    const stored = localStorage.getItem(DIGEST_KEY);
    if (stored === "daily" || stored === "weekly") setDigestFrequency(stored);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlists");
      if (!res.ok) return;
      const data = (await res.json()) as { watchlists: WatchlistRecord[] };
      setLists(data.watchlists);
    } catch {
      /* demo mode */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createList = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const companyIds =
        selectedCompanyIds.length > 0 ? selectedCompanyIds : [...ids];
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Watchlist", companyIds }),
      });
      if (!res.ok) throw new Error("Failed to create watchlist");
      const data = (await res.json()) as { watchlist: WatchlistRecord };
      setLists((prev) => [...prev, data.watchlist]);
      if (companyIds.length) {
        addMany(companyIds);
      }
      setMessage(`Created “${data.watchlist.name}” with ${data.watchlist.companyIds.length} companies.`);
    } catch {
      setMessage("Could not save watchlist (API unavailable). Stars still saved locally.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="workbench-card watchlist-manager">
      <h3 className="supplier-tier-title">Saved watchlists</h3>
      <p className="watchlist-manager-hint">
        {isSignedIn
          ? "Your watchlist syncs to your account when you star companies."
          : isClerkConfigured()
            ? (
                <>
                  Sign in with Google to save watchlists across devices.{" "}
                  <Link href="/sign-in">Sign in</Link>
                </>
              )
            : "Stars are stored in this browser until Clerk auth is configured."}
      </p>
      <div className="watchlist-create-row">
        <input
          type="text"
          className="watchlist-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Watchlist name"
          aria-label="Watchlist name"
        />
        <button
          type="button"
          className="filter-export-btn"
          onClick={() => void createList()}
          disabled={loading}
        >
          {loading ? "Saving…" : "Create watchlist"}
        </button>
      </div>
      <label className="watchlist-digest-pref">
        <span>Email digest</span>
        <select
          value={digestFrequency}
          onChange={(e) => {
            const value = e.target.value as "off" | "daily" | "weekly";
            setDigestFrequency(value);
            if (value === "off") localStorage.removeItem(DIGEST_KEY);
            else localStorage.setItem(DIGEST_KEY, value);
          }}
          aria-label="Digest email frequency"
        >
          <option value="off">Off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      {message && <p className="watchlist-manager-msg">{message}</p>}
      {lists.length > 0 && (
        <ul className="watchlist-server-list">
          {lists.map((wl) => (
            <li key={wl.id}>
              <strong>{wl.name}</strong>
              <span>{wl.companyIds.length} companies</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
