'use client';

import { ThemeProvider } from 'next-themes';
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { RecruiterAuthProvider } from '@/context/RecruiterAuthContext';
import { ToastProvider } from '@/context/ToastContext';
import RecruiterVerificationBanner from '@/components/recruiter/RecruiterVerificationBanner';
import CandidateVerificationBanner from '@/components/candidate/CandidateVerificationBanner';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
                <RecruiterAuthProvider>
                    <RecruiterVerificationBanner />
                    <AuthProvider>
                        <CandidateVerificationBanner />
                        {children}
                    </AuthProvider>
                </RecruiterAuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
