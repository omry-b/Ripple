"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommandItem } from "@/types/domain";
import { fetchSearch } from "@/lib/client/api";
import { getRecentItems, pushRecentItem, type RecentItem } from "@/lib/recent-items";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CommandItem[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const q = query.trim();
    const path = q ? `/api/search?q=${encodeURIComponent(q)}` : "/api/search";
    const timer = window.setTimeout(() => {
      fetch(path)
        .then((res) => (res.ok ? res.json() : fetchSearch()))
        .then((data) => setItems(data.items ?? []))
        .catch(() => fetchSearch().then((d) => setItems(d.items)).catch(() => setItems([])));
    }, q ? 200 : 0);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (open) setRecent(getRecentItems());
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActiveIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const recentAsItems: CommandItem[] = useMemo(
    () =>
      recent.map((r) => ({
        id: r.id,
        label: r.label,
        sublabel: "Recent",
        href: r.href,
        group: r.group as CommandItem["group"],
      })),
    [recent]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recentIds = new Set(recentAsItems.map((r) => r.href));
      const rest = items.filter((i) => !recentIds.has(i.href)).slice(0, 8);
      return [...recentAsItems, ...rest].slice(0, 12);
    }
    return items.slice(0, 12);
  }, [items, query, recentAsItems]);

  const go = useCallback(
    (item: CommandItem) => {
      pushRecentItem({
        id: item.id,
        label: item.label,
        href: item.href,
        group: item.group,
      });
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const showRecentHeader = !query.trim() && recentAsItems.length > 0;

  return (
    <>
      <button
        type="button"
        className="cmdk-backdrop"
        aria-label="Close command palette"
        onClick={() => setOpen(false)}
      />
      <div className="cmdk-panel" role="dialog" aria-label="Command palette">
        <input
          type="search"
          className="cmdk-input"
          placeholder="Search companies, alerts, pages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Search"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter" && filtered[activeIndex]) {
              go(filtered[activeIndex]);
            }
          }}
        />
        <p className="cmdk-hint">↑↓ navigate · Enter open · Esc close · ⌘K toggle · ? shortcuts</p>
        {showRecentHeader && (
          <p className="cmdk-section-label">Recent</p>
        )}
        <ul className="cmdk-list" role="listbox">
          {filtered.map((item, i) => (
            <li key={`${item.group}-${item.id}-${item.href}`}>
              <button
                type="button"
                className={`cmdk-item${i === activeIndex ? " active" : ""}`}
                onClick={() => go(item)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="cmdk-item-label">{item.label}</span>
                <span className="cmdk-item-meta">
                  {item.sublabel === "Recent" ? "Recent" : item.group}
                  {item.sublabel && item.sublabel !== "Recent"
                    ? ` · ${item.sublabel}`
                    : ""}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="cmdk-empty">No matches</li>}
        </ul>
      </div>
    </>
  );
}
