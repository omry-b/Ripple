"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommandItem } from "@/types/domain";
import { fetchSearch } from "@/lib/client/api";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CommandItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchSearch()
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, []);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 12);
    return items
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.sublabel?.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [items, query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

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
              go(filtered[activeIndex].href);
            }
          }}
        />
        <p className="cmdk-hint">↑↓ navigate · Enter open · Esc close · ⌘K toggle</p>
        <ul className="cmdk-list" role="listbox">
          {filtered.map((item, i) => (
            <li key={`${item.group}-${item.id}`}>
              <button
                type="button"
                className={`cmdk-item${i === activeIndex ? " active" : ""}`}
                onClick={() => go(item.href)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="cmdk-item-label">{item.label}</span>
                <span className="cmdk-item-meta">
                  {item.group}
                  {item.sublabel ? ` · ${item.sublabel}` : ""}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="cmdk-empty">No matches</li>
          )}
        </ul>
      </div>
    </>
  );
}
