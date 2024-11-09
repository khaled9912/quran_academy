import Link from 'next/link';
import React from 'react';
import Menu from './Menu';
import Image from 'next/image';

import LogoSVG from '/public/logo.svg';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="h-full flex items-center justify-between md:hidden">
        {/* Mobile */}
        <Link href="/">
          <div className="text-2xl tracking-wide">AnaaQuran</div>
        </Link>
        <Menu />
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 xl:w-1/2 flex items-center gap-12 h-14 justify-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src={LogoSVG} alt="Logo" className="rounded w-24 h-auto"  />
          <h1 className='text-blue-500'>AnaaQuran</h1>
          </Link>
          {/* LINKS */}
          <div className="hidden xl:flex gap-4">
            <Link href="/">HomePage</Link>
            <Link href="#about">About Us</Link>
            <Link href="#courses">Courses</Link>
            <Link href="#contacts">Contacts</Link>
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-2/3 xl:w-1/2 flex items-center justify-between gap-8">

        </div>
      </div>
    </div>
  );
};

export default Navbar;
