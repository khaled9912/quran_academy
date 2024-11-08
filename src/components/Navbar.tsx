import Link from 'next/link';
import React from 'react';
import Menu from './Menu';
import Image from 'next/image';
<<<<<<< Updated upstream
import SearchBar from './SearchBar';
import NavIcons from './NavIcons';
=======

import LogoSVG from '/public/logo.svg';

>>>>>>> Stashed changes

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="h-full flex items-center justify-between md:hidden">
        {/* Mobile */}
        <Link href="/">
          <div className="text-2xl tracking-wide">ABC</div>
        </Link>
        <Menu />
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 xl:w-1/2 flex items-center gap-12 ">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" width={24} height={24} alt={'logo icon'} />
            <div className="text-2xl tracking-wide">ABC</div>
          </Link>
          {/* LINKS */}
          <div className="hidden xl:flex gap-4">
            <Link href="/">HomePage</Link>
<<<<<<< Updated upstream
            <Link href="/">Shope</Link>
            <Link href="/">Deals</Link>
            <Link href="/">About</Link>
            <Link href="/">Contacts</Link>
=======
            <Link href="#about">About Us</Link>
            <Link href="#courses">Courses</Link>
            <Link href="#contacts">Contacts</Link>
>>>>>>> Stashed changes
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-2/3 xl:w-1/2 flex items-center justify-between gap-8">
          <SearchBar />
          <NavIcons />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
