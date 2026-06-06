"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Menu = () => {
  const [open, setOpen] = useState(false);

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
          <Link href="/">HomePage</Link>
          <Link href="/courses">Courses</Link>
          <Link href="/schedule">Schedule</Link>
          <Link href="#about">About Us</Link>
          <Link href="#contacts">Contacts</Link>
          <Link href="/student-dashboard">Dashboard</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/login">Login</Link>
          <Link href="/logout">Logout</Link>
        </div>
      )}
    </div>
  );
};

export default Menu;
