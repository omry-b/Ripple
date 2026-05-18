"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import { LiveStatus } from "./LiveStatus";
import { MobileNav } from "./MobileNav";
import { useLiveData } from "@/context/LiveDataContext";
import { getWatchlistIds } from "@/lib/watchlist";

export function NavHeader() {
  const pathname = usePathname();
  const { asOf, isRefreshing } = useLiveData();
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    const sync = () => setWatchlistCount(getWatchlistIds().length);
    sync();
    window.addEventListener("ripple-watchlist-change", sync);
    return () => window.removeEventListener("ripple-watchlist-change", sync);
  }, []);

  return (
    <nav className="nav-header" role="navigation">
      <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
        Ripple
      </Link>
      <MobileNav />
      <div className="nav-tabs nav-tabs-desktop" role="tablist">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-tab-item${isActive ? " active" : ""}`}
              role="tab"
              aria-selected={isActive}
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/companies?watchlist=1"
          className={`nav-tab-item${pathname.startsWith("/companies") && watchlistCount > 0 ? "" : ""}`}
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Watchlist{watchlistCount > 0 ? ` (${watchlistCount})` : ""}
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <kbd className="nav-kbd" title="Command palette">
          ⌘K
        </kbd>
        <LiveStatus asOf={asOf} isRefreshing={isRefreshing} />
      </div>
    </nav>
  );
}
