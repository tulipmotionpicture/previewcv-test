'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import config from '@/config';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
  variant?: 'candidate' | 'recruiter';
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  variant = 'candidate'
}: AuthLayoutProps) {
  const accentColor = variant === 'candidate' ? 'blue' : 'indigo';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
      {/* Background decorations */}
      <div className={`fixed top-0 right-0 w-[500px] h-[500px] bg-${accentColor}-50 dark:bg-${accentColor}-950/20 rounded-full blur-[120px] -z-10 opacity-50`} />
      <div className={`fixed bottom-0 left-0 w-[400px] h-[400px] bg-${accentColor}-100 dark:bg-${accentColor}-900/10 rounded-full blur-[100px] -z-10 opacity-30`} />

      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4 hover:opacity-90 transition-opacity">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-${accentColor}-200/50 dark:shadow-${accentColor}-900/20 overflow-hidden border border-gray-100 dark:border-gray-800 p-3`}>
              <Image 
                src={config.app.logoUrl} 
                alt={config.app.name} 
                width={80} 
                height={80} 
                className="object-contain" 
              />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1.5 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl shadow-gray-200/50 dark:shadow-gray-950/50">
          {children}
        </div>

        {/* Footer */}
        {footerText && footerLink && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {footerText}{' '}
              <Link 
                href={footerLink.href} 
                className={`text-${accentColor}-600 dark:text-${accentColor}-400 font-bold hover:underline`}
              >
                {footerLink.text}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
