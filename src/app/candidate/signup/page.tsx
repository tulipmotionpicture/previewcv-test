'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CandidateSignup() {
    const router = useRouter();
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await register(email, password, fullName);
            router.push('/candidate/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-blue-100">
            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-[48px] shadow-2xl shadow-blue-200 mb-8 overflow-hidden border border-gray-100 p-4">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="object-contain" />
                    </div>
                    <p className="text-gray-500 font-medium">Create your candidate profile.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-xl shadow-blue-500/5">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none hover:bg-gray-100 transition-all font-medium"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Work Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none hover:bg-gray-100 transition-all font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none hover:bg-gray-100 transition-all font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none hover:bg-gray-100 transition-all font-medium"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400 font-medium">Or sign up with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => api.candidateSocialLogin('google')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-100 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={() => api.candidateSocialLogin('linkedin')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-100 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-400 font-medium">Already have an account? <Link href="/candidate/login" className="text-blue-600 font-bold hover:underline">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
