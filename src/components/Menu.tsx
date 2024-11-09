'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Menu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Image
        src="/menu.png"
        alt=""
        width={28}
        height={28}
        className="cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="menu-items">
            <Link href="/">HomePage</Link>
            <Link href="/">About Us</Link>
            <Link href="/">Courses</Link>
            <Link href="/">Contacts</Link>
        </div>
      )}
    </div>
  );
};

export default Menu;
