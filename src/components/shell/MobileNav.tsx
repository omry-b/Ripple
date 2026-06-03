"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";
import { openCommandPalette } from "@/lib/shell/cmdk";
import { FocusTrap } from "@/components/ui/FocusTrap";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="mobile-nav-wrap">
      <button
        ref={toggleRef}
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "×" : "☰"}
      </button>
      {open && (
        <FocusTrap
          active={open}
          onEscape={() => {
            close();
          }}
        >
          <>
            <button
              type="button"
              className="mobile-nav-backdrop"
              aria-label="Close menu"
              onClick={close}
            />
            <nav
              id="mobile-nav-drawer"
              className="mobile-nav-drawer"
              aria-label="Mobile navigation"
            >
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-nav-link${isActive ? " active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/companies?watchlist=1"
                className="mobile-nav-link"
                onClick={close}
              >
                Watchlist
              </Link>
              <Link href="/pricing" className="mobile-nav-link" onClick={close}>
                Pricing
              </Link>
              <Link href="/sign-in" className="mobile-nav-link" onClick={close}>
                Sign in
              </Link>
              <button
                type="button"
                className="mobile-nav-link mobile-nav-cmdk"
                onClick={() => {
                  close();
                  openCommandPalette();
                }}
              >
                Search (⌘K)
              </button>
            </nav>
          </>
        </FocusTrap>
      )}
    </div>
  );
}
