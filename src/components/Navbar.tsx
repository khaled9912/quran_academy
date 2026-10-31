"use client";

import Link from "next/link";
import React from "react";
import Menu from "./Menu";
import { useAuth } from "@/providers/auth-provider";
import { navigationConfig } from "@/constants/navigation";
import { Avatar } from "@/components/ui/avatar";

const Navbar = () => {
  const { role, profile, logout, isAuthenticated } = useAuth();
  const displayName =
    profile?.fullName ?? profile?.full_name ?? role?.replace("_", " ") ?? "";

  // Choose links based on authentication and role
  const links =
    isAuthenticated && role && navigationConfig[role]
      ? navigationConfig[role]
      : navigationConfig.anonymous;

  return (
    <div className="navbar bg-[#0d3d4b] text-white backdrop-blur">
      <div className="h-full flex items-center justify-between md:hidden">
        <Link href="/" className="flex items-center gap-3 rounded-full bg-[#e7efe7]/90 p-2 shadow-sm ring-1 ring-white/10">
          <img
            src="/logo-ana-quran.svg?v=2026-10-31-2"
            alt="Logo"
            width={28}
            height={28}
            className="h-8 w-8"
          />
          <span className="text-base font-semibold text-[#173d3f]">Ana Quran</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-sm"
          >
            ☾
          </button>
          <Menu />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between gap-8 h-full w-full">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 rounded-full bg-[#edf1eb]/90 px-2 py-1.5 shadow-sm ring-1 ring-white/10">
            <img
              src="/logo-ana-quran.svg?v=2026-10-31-2"
              alt="Ana Quran logo"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="text-lg font-semibold text-[#173d3f]">Ana Quran</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            <Link href="/" className="transition hover:text-white">Home</Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle color theme"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-sm"
          >
            ☾
          </button>

          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="rounded-xl bg-[#f1d1a1] px-4 py-2 text-sm font-semibold text-[#173d3f] transition hover:bg-[#f6d9a8]">
                  Register
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="mr-2 flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
              >
                <Avatar
                  name={displayName}
                  src={profile?.avatarUrl}
                  className="h-9 w-9 rounded-full text-xs"
                  fallbackClassName="bg-[#f1d1a1] text-[#173d3f]"
                />
                <span className="text-sm">
                  <span className="block text-[11px] uppercase tracking-wide text-white/60">
                    {role?.replace("_", " ")}
                  </span>
                  <strong className="block max-w-[14ch] truncate text-white">
                    {displayName}
                  </strong>
                </span>
              </Link>
              <button
                onClick={logout}
                className="rounded-xl border border-[#f5c3c3] bg-[#f7dfe0] px-4 py-2 text-sm font-semibold text-[#b74343] transition hover:bg-[#f8d7d7]"
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
