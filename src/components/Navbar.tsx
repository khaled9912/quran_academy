import Link from "next/link";
import React from "react";
import Menu from "./Menu";
import Image from "next/image";

import LogoSVG from "/public/logo.svg";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="h-full flex items-center justify-between md:hidden">
        {/* Mobile */}
        <Link href="/" className="flex items-center gap-3">
          <Image src={LogoSVG} alt="Logo" className="w-16 h-16" />
        </Link>
        <Menu />
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        <div className="flex items-center gap-12  ">
          <Link href="/" className="flex items-center gap-3">
            <Image src={LogoSVG} alt="Logo" className="w-16 h-16" />
          </Link>
          {/* LINKS */}
          <div className="hidden md:flex gap-4 ">
            <Link href="/">HomePage</Link>
            <Link href="/courses">Courses</Link>
            <Link href="#about">About Us</Link>
            <Link href="#contacts">Contacts</Link>
          </div>
        </div>
        <Link href="/student-dashboard">
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded font-semibold transition">
            Student Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
