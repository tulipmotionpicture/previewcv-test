'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_USERS } from '@/config/mockData';
import config from '@/config';
import Image from 'next/image';

export default function RecruiterLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (email === MOCK_USERS.recruiter.email && password === MOCK_USERS.recruiter.password) {
                router.push('/recruiter/dashboard');
            } else {
                setError('Authentication failed. Check your access credentials.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-indigo-100 uppercase tracking-tight">
            {/* Background Effects */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -z-10" />

            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-[48px] shadow-2xl shadow-indigo-100 mb-8 border border-gray-100 overflow-hidden p-6">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="object-contain" />
                    </div>
                    <p className="text-gray-500 font-medium lowercase first-letter:uppercase">Recruiter access profile. Optimize your hiring pipeline.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Recruiter ID / Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="recruiter@previewcv.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Security Key</label>
                            <input
                                type="password"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-indigo-600 focus:ring-indigo-600" />
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Encrypted Session</span>
                            </label>
                            <a href="#" className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter hover:underline">Forgot Key?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Enter Dashboard
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-500 font-medium normal-case">
                            New recruiter?{' '}
                            <Link href="/recruiter/signup" className="text-indigo-600 font-black hover:underline uppercase tracking-tight">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">Internal Test Access</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">recruiter@example.com · password123</p>
                </div>
            </div>
        </div>
    );
}
