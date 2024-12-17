'use client';

import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">ECUCONDOR S.A.S</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Perfil
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
