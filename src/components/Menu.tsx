"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { navigationConfig } from "@/constants/navigation";

const Menu = () => {
  const [open, setOpen] = useState(false);
  const { role, logout, isAuthenticated } = useAuth();

  const links =
    isAuthenticated && role && navigationConfig[role]
      ? navigationConfig[role]
      : navigationConfig.anonymous;

  return (
    <div>
      <button
        type="button"
        aria-label="Toggle menu"
        className="menu-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="menu-items" onClick={() => setOpen(false)}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="menu-item-link"
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="menu-item-link">
                Login
              </Link>
              <Link href="/signup" className="menu-item-link">
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="menu-item-button"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
