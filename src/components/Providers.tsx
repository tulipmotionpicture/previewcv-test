'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { RecruiterAuthProvider } from '@/context/RecruiterAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <RecruiterAuthProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </RecruiterAuthProvider>
    );
}
