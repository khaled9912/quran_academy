"use client";

import Image from "next/image";
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
      : navigationConfig.anonymous.filter(
          (l) => l.label !== "Login" && l.label !== "Register"
        );

  return (
    <div>
      <Image
        src="/menu.png"
        alt="Menu"
        width={28}
        height={28}
        className="menu-icon cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="menu-items" onClick={() => setOpen(false)}>
          <Link href="/">Home</Link>
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="text-left w-full text-red-500 font-semibold"
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
