'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (isProcessing) return;
            setIsProcessing(true);

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(decodeURIComponent(errorParam));
                setTimeout(() => router.push('/candidate/login'), 3000);
                return;
            }

            if (!code) {
                setError('No authorization code received');
                setTimeout(() => router.push('/candidate/login'), 3000);
                return;
            }

            try {
                // Exchange code for tokens
                const response = await api.exchangeSocialAuthCode('google', code, state || '');

                // Clear any existing recruiter tokens to prevent role confusion
                localStorage.removeItem('recruiter_access_token');
                localStorage.removeItem('recruiter_refresh_token');

                // Store tokens
                localStorage.setItem('access_token', response.access_token);
                if (response.refresh_token) {
                    localStorage.setItem('refresh_token', response.refresh_token);
                }

                // Redirect to dashboard
                window.location.href = '/candidate/dashboard';
            } catch (err: any) {
                setError(err.message || 'Failed to authenticate with Google');
                setTimeout(() => router.push('/candidate/login'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Failed</h3>
                        <p className="mt-2 text-sm text-gray-500">{error}</p>
                        <p className="mt-2 text-xs text-gray-400">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <svg className="animate-spin h-6 w-6 text-primary-blue" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Completing Sign In</h3>
                    <p className="mt-2 text-sm text-gray-500">Please wait while we log you in...</p>
                </div>
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                            <svg className="animate-spin h-6 w-6 text-primary-blue" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Loading...</h3>
                    </div>
                </div>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
