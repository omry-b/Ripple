"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { LiveStatus } from "./LiveStatus";
import { useLiveData } from "@/context/LiveDataContext";

export function NavHeader() {
  const pathname = usePathname();
  const { asOf, isRefreshing } = useLiveData();

  return (
    <nav className="nav-header" role="navigation">
      <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
        Ripple
      </Link>
      <div className="nav-tabs" role="tablist">
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
      </div>
      <LiveStatus asOf={asOf} isRefreshing={isRefreshing} />
    </nav>
  );
}
