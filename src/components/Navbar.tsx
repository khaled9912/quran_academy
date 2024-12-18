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
          <Image src={LogoSVG} alt="Logo" className="rounded w-24 h-auto" />
          <h1 className="text-blue-500">AnaaQuran</h1>
        </Link>
        <Menu />
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        <div className="flex items-center gap-12  ">
          <Link href="/" className="flex items-center gap-3">
            <Image src={LogoSVG} alt="Logo" className="rounded w-24 h-auto" />
            <h1 className="text-blue-500">AnaaQuran</h1>
          </Link>
          {/* LINKS */}
          <div className="hidden md:flex gap-4 ">
            <Link href="/">HomePage</Link>
            <Link href="#about">About Us</Link>
            <Link href="#courses">Courses</Link>
            <Link href="#contacts">Contacts</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
