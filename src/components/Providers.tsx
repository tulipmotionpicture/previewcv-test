'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { RecruiterAuthProvider } from '@/context/RecruiterAuthContext';
import { ToastProvider } from '@/context/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <RecruiterAuthProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </RecruiterAuthProvider>
        </ToastProvider>
    );
}
