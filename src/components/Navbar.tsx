"use client";

import Link from "next/link";
import React from "react";
import Menu from "./Menu";
import Image from "next/image";
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
    <div className="navbar bg-[#fbfaf6]/95 text-[#23483c] backdrop-blur">
      <div className="h-full flex items-center justify-between md:hidden">
        {/* Mobile */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </Link>
        <Menu />
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full w-full">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </Link>
          {/* LINKS */}
          <div className="hidden md:flex gap-4">
            <Link href="/">Home</Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <button className="rounded-xl border border-[#cbd8ca] px-4 py-2 text-[#244c40] transition hover:bg-[#edf3e9] font-semibold">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="rounded-xl bg-[#1c5145] px-4 py-2 text-white transition hover:bg-[#163f36] font-semibold">
                  Register
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="mr-2 flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[#edf3e9]"
              >
                <Avatar
                  name={displayName}
                  src={profile?.avatarUrl}
                  className="h-9 w-9 rounded-full text-xs"
                  fallbackClassName="bg-[#1c5145] text-white"
                />
                <span className="text-sm">
                  <span className="block text-[11px] uppercase tracking-wide opacity-60">
                    {role?.replace("_", " ")}
                  </span>
                  <strong className="block max-w-[14ch] truncate">
                    {displayName}
                  </strong>
                </span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded font-semibold transition"
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
