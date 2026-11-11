"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Menu from "./Menu";
import WhatsAppButton from "./WhatsAppButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers/auth-provider";
import { navigationConfig } from "@/constants/navigation";
import { Avatar } from "@/components/ui/avatar";
import { NotificationsBell } from "@/components/NotificationsBell";

const LINK_GAP_PX = 8; // matches the gap-2 between nav links

const Navbar = () => {
  const { role, profile, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [foldedCount, setFoldedCount] = useState(0);
  const moreWrapper = useRef<HTMLDivElement>(null);
  const linksRow = useRef<HTMLDivElement>(null);
  const linksMeasure = useRef<HTMLDivElement>(null);
  const moreMeasure = useRef<HTMLSpanElement>(null);
  const displayName =
    profile?.fullName ?? profile?.full_name ?? role?.replace("_", " ") ?? "";

  // Anchor links point at a section, so they never become the active route
  const isActiveLink = (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClasses = (active: boolean) =>
    [
      "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navbar-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navbar-bg)]",
      active
        ? "bg-[var(--nav-active-bg)] font-semibold text-[var(--nav-active-text)]"
        : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--navbar-text)]",
    ].join(" ");

  // Choose links based on authentication and role
  const links =
    isAuthenticated && role && navigationConfig[role]
      ? navigationConfig[role]
      : navigationConfig.anonymous;

  const candidateLinks = links.filter((link) => !link.inMore);
  const moreLinks = links.filter((link) => link.inMore);
  const inlineLinks = candidateLinks.slice(
    0,
    candidateLinks.length - foldedCount
  );
  const overflowLinks = [
    ...candidateLinks.slice(candidateLinks.length - foldedCount),
    ...moreLinks,
  ];
  const moreActive = overflowLinks.some((link) => isActiveLink(link.href));

  // The links row only gets the space between the brand and the account
  // cluster, so anything that no longer fits folds into "More" instead of
  // sliding underneath it.
  useLayoutEffect(() => {
    const row = linksRow.current;
    const measure = linksMeasure.current;
    if (!row || !measure) return;

    const relayout = () => {
      const available = row.clientWidth;
      const widths = Array.from(measure.children).map(
        (child) => (child as HTMLElement).offsetWidth
      );
      if (!available || !widths.length) return;

      const total =
        widths.reduce((sum, width) => sum + width, 0) +
        LINK_GAP_PX * (widths.length - 1);

      if (total <= available) {
        setFoldedCount(0);
        return;
      }

      let used = moreMeasure.current?.offsetWidth ?? 0;
      let fit = 0;
      widths.forEach((width, index) => {
        used += width + LINK_GAP_PX;
        if (used <= available) fit = index + 1;
      });
      setFoldedCount(widths.length - fit);
    };

    relayout();
    const observer = new ResizeObserver(relayout);
    observer.observe(row);
    return () => observer.disconnect();
  }, [role, pathname, candidateLinks.length]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!moreWrapper.current?.contains(event.target as Node))
        setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <div className="navbar bg-[var(--navbar-bg)] text-[var(--navbar-text)] backdrop-blur">
      <div className="h-full flex items-center justify-between md:hidden">
        <Link
          href="/"
          aria-label="Ana Quran home"
          className="flex items-center"
        >
          <img
            src="/logo-ana-quran.svg?v=2026-11-06-1"
            alt="Ana Quran logo"
            width={40}
            height={56}
            className="navbar-brand-logo h-16 w-auto dark:hidden"
          />
          <img
            src="/logo-ana-quran-light.svg?v=2026-11-06-1"
            alt="Ana Quran logo"
            width={40}
            height={56}
            className="navbar-brand-logo hidden h-16 w-auto dark:block"
          />
        </Link>
        <div className="flex items-center gap-2">
          <WhatsAppButton className="h-9 w-9" />
          <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[var(--toggle-bg)] text-[var(--toggle-icon)] shadow-sm" />
          <NotificationsBell />
          <Menu />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 h-full w-full">
        <Link
          href="/"
          aria-label="Ana Quran home"
          className="flex shrink-0 items-center gap-6"
        >
          <img
            src="/logo-ana-quran-mark.svg?v=2026-11-07-1"
            alt=""
            width={34}
            height={48}
            className="navbar-brand-logo h-12 w-auto dark:hidden"
          />
          <img
            src="/logo-ana-quran-mark-light.svg?v=2026-11-07-1"
            alt=""
            width={34}
            height={48}
            className="navbar-brand-logo hidden h-12 w-auto dark:block"
          />
          <span className="hidden flex-col leading-none lg:flex">
            <span className="text-[1.05rem] font-extrabold tracking-[-0.02em]">
              Ana Quran
            </span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--nav-text-muted)]">
              Academy
            </span>
          </span>
        </Link>

        <div
          ref={linksRow}
          className="relative hidden min-w-0 flex-1 items-center gap-2 text-sm font-medium md:flex"
        >
          <div
            aria-hidden
            className="pointer-events-none invisible absolute left-0 top-0 flex"
          >
            <div ref={linksMeasure} className="flex shrink-0 gap-2">
              {candidateLinks.map((link) => (
                <span
                  key={link.href}
                  className={linkClasses(isActiveLink(link.href))}
                >
                  {link.label}
                </span>
              ))}
            </div>
            <span ref={moreMeasure} className={linkClasses(moreActive)}>
              More
            </span>
          </div>

          {inlineLinks.map((link) => {
            const active = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={linkClasses(active)}
              >
                {link.label}
              </Link>
            );
          })}

          {overflowLinks.length ? (
            <div ref={moreWrapper} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={linkClasses(moreActive)}
              >
                More
              </button>

              {moreOpen ? (
                <ul className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-card-border bg-card-bg py-1.5 text-sm shadow-2xl">
                  {overflowLinks.map((link) => {
                    const active = isActiveLink(link.href);

                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMoreOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "block px-4 py-2.5 transition-colors",
                            active
                              ? "bg-[var(--nav-active-bg)] font-semibold text-[var(--nav-active-text)]"
                              : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--navbar-text)]",
                          ].join(" ")}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <WhatsAppButton className="h-8 w-8" />
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[var(--toggle-bg)] text-[var(--toggle-icon)] shadow-sm" />
          <NotificationsBell />

          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <button className="rounded-xl border border-[#173d3f]/15 bg-[#eaf2ec] px-4 py-2 text-sm font-semibold text-[#173d3f] shadow-sm transition hover:bg-[#dfeee2] dark:border-white/15 dark:bg-white/10 dark:text-[var(--navbar-text)] dark:hover:bg-white/15">
                  Login
                </button>
              </Link>
              <Link href="/signup" className="registration-cta">
                <button className="rounded-xl bg-[#f1d1a1] px-4 py-2 text-sm font-semibold text-[#173d3f] transition hover:bg-[#f6d9a8]">
                  Start a free trial
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="mr-2 flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[var(--nav-hover-bg)]"
              >
                <Avatar
                  name={displayName}
                  src={profile?.avatarUrl}
                  className="h-9 w-9 rounded-full text-xs"
                  fallbackClassName="bg-[#f1d1a1] text-[#173d3f]"
                />
                <span className="text-sm">
                  <span className="block text-[11px] uppercase tracking-wide text-[var(--nav-text-muted)]">
                    {role?.replace("_", " ")}
                  </span>
                  <strong className="block max-w-[14ch] truncate text-[var(--navbar-text)]">
                    {displayName}
                  </strong>
                </span>
              </Link>
              <button
                onClick={logout}
                className="rounded-xl border border-[#f5c3c3] bg-[#f7dfe0] px-4 py-2 text-sm font-semibold text-[#b74343] transition hover:bg-[#f8d7d7] dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/20"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
