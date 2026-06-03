"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommandItem } from "@/types/domain";
import { fetchSearch } from "@/lib/client/api";
import { readApiError } from "@/lib/api/error-body";
import { groupCommandItems } from "@/components/shell/command-palette-groups";
import { getRecentItems, pushRecentItem, type RecentItem } from "@/lib/recent-items";
import { CMDK_OPEN_EVENT } from "@/lib/shell/cmdk";
import { FocusTrap } from "@/components/ui/FocusTrap";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CommandItem[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    const path = q ? `/api/search?q=${encodeURIComponent(q)}` : "/api/search";
    setLoading(true);
    setSearchError(null);
    const timer = window.setTimeout(() => {
      fetch(path)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(await readApiError(res));
          }
          return res.json() as Promise<{ items?: CommandItem[] }>;
        })
        .then((data) => {
          setItems(data.items ?? []);
          setSearchError(null);
        })
        .catch(async (err) => {
          try {
            const data = await fetchSearch();
            setItems(data.items ?? []);
            setSearchError(
              err instanceof Error ? err.message : "Search unavailable — showing cached index"
            );
          } catch {
            setItems([]);
            setSearchError("Search failed. Check your connection and try again.");
          }
        })
        .finally(() => setLoading(false));
    }, q ? 200 : 0);
    return () => window.clearTimeout(timer);
  }, [query, open]);

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
    };
    const onOpen = () => {
      setOpen(true);
      setQuery("");
      setActiveIndex(0);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(CMDK_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(CMDK_OPEN_EVENT, onOpen);
    };
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

  const groupedResults = useMemo(() => {
    if (!query.trim()) return null;
    return groupCommandItems(filtered);
  }, [filtered, query]);

  const go = useCallback(
    (item: CommandItem) => {
      pushRecentItem({
        id: item.id,
        label: item.label,
        href: item.href,
        group: item.group,
      });
      close();
      router.push(item.href);
    },
    [router, close]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const showRecentHeader = !query.trim() && recentAsItems.length > 0;

  const renderItem = (item: CommandItem, i: number) => (
    <li key={`${item.group}-${item.id}-${item.href}`} role="option" aria-selected={i === activeIndex}>
      <button
        type="button"
        id={`cmdk-option-${i}`}
        className={`cmdk-item${i === activeIndex ? " active" : ""}`}
        onClick={() => go(item)}
        onMouseEnter={() => setActiveIndex(i)}
      >
        <span className="cmdk-item-label">{item.label}</span>
        <span className="cmdk-item-meta">
          {item.sublabel === "Recent" ? "Recent" : item.group}
          {item.sublabel && item.sublabel !== "Recent" ? ` · ${item.sublabel}` : ""}
        </span>
      </button>
    </li>
  );

  let flatIndex = 0;

  return (
  <FocusTrap active={open} onEscape={close}>
    <>
      <button
        type="button"
        className="cmdk-backdrop"
        aria-label="Close command palette"
        onClick={close}
      />
      <div
        className="cmdk-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          type="search"
          className="cmdk-input"
          placeholder="Search companies, alerts, pages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Search"
          aria-controls="cmdk-listbox"
          aria-activedescendant={
            filtered.length > 0 ? `cmdk-option-${activeIndex}` : undefined
          }
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
        <p className="cmdk-hint">
          {loading
            ? "Searching…"
            : query.trim()
              ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} · ↑↓ navigate · Enter open`
              : "↑↓ navigate · Enter open · Esc close · ⌘K toggle · ? shortcuts"}
        </p>
        {searchError ? (
          <p className="cmdk-error" role="status">
            {searchError}
          </p>
        ) : null}
        {showRecentHeader && <p className="cmdk-section-label">Recent</p>}
        <ul id="cmdk-listbox" className="cmdk-list" role="listbox">
          {groupedResults
            ? groupedResults.map(({ group, items: groupItems }) => (
                <li key={group} className="cmdk-group" role="presentation">
                  <p className="cmdk-section-label">{group}</p>
                  <ul className="cmdk-group-list">
                    {groupItems.map((item) => {
                      const i = flatIndex++;
                      return renderItem(item, i);
                    })}
                  </ul>
                </li>
              ))
            : filtered.map((item, i) => renderItem(item, i))}
          {!loading && filtered.length === 0 && (
            <li className="cmdk-empty">No matches</li>
          )}
        </ul>
      </div>
    </>
  </FocusTrap>
  );
}
