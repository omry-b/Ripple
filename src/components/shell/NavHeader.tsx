"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { LiveStatus } from "./LiveStatus";
import { MobileNav } from "./MobileNav";
import { useLiveData } from "@/context/LiveDataContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { UserMenu } from "@/components/shell/UserMenu";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { OrgSwitcher } from "@/components/shell/OrgSwitcher";
import { openCommandPalette } from "@/lib/shell/cmdk";
import {
  LayoutDashboard,
  Radio,
  FlaskConical,
  Building2,
  BookOpen,
  Newspaper,
  Bell,
} from "lucide-react";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/": <LayoutDashboard size={14} aria-hidden />,
  "/intelligence": <Newspaper size={14} aria-hidden />,
  "/alerts": <Bell size={14} aria-hidden />,
  "/signals": <Radio size={14} aria-hidden />,
  "/scenario": <FlaskConical size={14} aria-hidden />,
  "/companies": <Building2 size={14} aria-hidden />,
  "/methodology": <BookOpen size={14} aria-hidden />,
};

export function NavHeader() {
  const pathname = usePathname();
  const { asOf, isRefreshing } = useLiveData();
  const { ids: watchlistIds, isSyncing, syncError } = useWatchlist();
  const watchlistCount = watchlistIds.size;

  return (
    <header className="nav-header" role="banner">
      <Link href="/" className="nav-brand nav-brand-link">
        Ripple
      </Link>
      <MobileNav />
      <nav className="nav-tabs nav-tabs-desktop" aria-label="Primary">
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
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-tab-inner">
                {NAV_ICONS[item.href]}
                {item.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/companies?watchlist=1"
          className={`nav-tab-item${pathname.includes("watchlist=1") ? " active" : ""}`}
          aria-current={pathname.includes("watchlist=1") ? "page" : undefined}
        >
          <span className="nav-tab-inner">
            Watchlist{watchlistCount > 0 ? ` (${watchlistCount})` : ""}
            {isSyncing ? " · syncing" : syncError ? " · sync issue" : ""}
          </span>
        </Link>
        {syncError ? (
          <span className="nav-sync-error" title={syncError} role="status">
            !
          </span>
        ) : null}
      </nav>
      <div className="nav-actions">
        <ThemeToggle />
        <OrgSwitcher />
        <button
          type="button"
          className="nav-kbd"
          title="Open command palette"
          aria-label="Open command palette"
          onClick={openCommandPalette}
        >
          ⌘K
        </button>
        <LiveStatus asOf={asOf} isRefreshing={isRefreshing} />
        <UserMenu />
      </div>
    </header>
  );
}
