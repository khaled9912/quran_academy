"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { navigationConfig } from "@/constants/navigation";

const Menu = () => {
  const [open, setOpen] = useState(false);
  const { role, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const links =
    isAuthenticated && role && navigationConfig[role]
      ? navigationConfig[role]
      : navigationConfig.anonymous;

  const isActiveLink = (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClassName = (href: string) =>
    ["menu-item-link", isActiveLink(href) ? "menu-item-active" : ""]
      .filter(Boolean)
      .join(" ");

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
              onClick={() => setOpen(false)}
              aria-current={isActiveLink(link.href) ? "page" : undefined}
              className={linkClassName(link.href)}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                aria-current={isActiveLink("/login") ? "page" : undefined}
                className={linkClassName("/login")}
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                aria-current={isActiveLink("/signup") ? "page" : undefined}
                className={linkClassName("/signup")}
              >
                Register
              </Link>
            </>
          ) : (
            <button onClick={logout} className="menu-item-button">
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
