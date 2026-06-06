"use client";

import Link from "next/link";
import React from "react";
import Menu from "./Menu";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { navigationConfig } from "@/constants/navigation";

const Navbar = () => {
  const { role, logout, isAuthenticated } = useAuth();

  // Choose links based on authentication and role
  const links =
    isAuthenticated && role && navigationConfig[role]
      ? navigationConfig[role]
      : navigationConfig.anonymous.filter(
          (l) => l.label !== "Login" && l.label !== "Register"
        );

  return (
    <div className="navbar">
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
                <button className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded font-semibold transition">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition">
                  Register
                </button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm opacity-75 mr-2">
                Logged in as{" "}
                <strong className="capitalize">
                  {role?.replace("_", " ")}
                </strong>
              </span>
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
