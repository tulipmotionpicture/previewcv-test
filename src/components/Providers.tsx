'use client';

import { ThemeProvider } from 'next-themes';
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { RecruiterAuthProvider } from '@/context/RecruiterAuthContext';
import { ToastProvider } from '@/context/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
                <RecruiterAuthProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </RecruiterAuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
