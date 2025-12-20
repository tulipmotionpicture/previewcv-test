'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import config from '@/config';

interface HeaderLink {
  label: string;
  href: string;
}

interface HeaderProps {
  links?: HeaderLink[];
  cta?: {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'dark';
  };
  logoHref?: string;
}

export default function Header({ 
  links = [], 
  cta, 
  logoHref = '/' 
}: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Check initial scroll
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-gray-100 dark:border-gray-800 shadow-sm py-3' 
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href={logoHref} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image
            src={config.app.logoUrl}
            alt={config.app.name}
            width={120}
            height={120}
            className=" h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {cta && (
            <Link
              href={cta.href}
              className={`px-6 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                cta.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                cta.variant === 'dark' ? 'bg-gray-900 hover:bg-gray-800 shadow-gray-900/20' :
                cta.variant === 'secondary' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' :
                'bg-blue-600'
              }`}
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
