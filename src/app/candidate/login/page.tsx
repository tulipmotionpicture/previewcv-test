'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_USERS } from '@/config/mockData';
import config from '@/config';
import Image from 'next/image';

export default function CandidateLogin() {
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
            if (email === MOCK_USERS.candidate.email && password === MOCK_USERS.candidate.password) {
                router.push('/candidate/dashboard');
            } else {
                setError('Invalid credentials. Please try again.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-blue-100">
            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-[48px] shadow-2xl shadow-blue-200 mb-8 overflow-hidden border border-gray-100 p-4">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="object-contain" />
                    </div>
                    <p className="text-gray-500 font-medium">Welcome back, Job Seeker. Your next move starts here.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-xl shadow-blue-500/5">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
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

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                <span className="text-xs text-gray-500 font-bold">Keep me signed in</span>
                            </label>
                            <a href="#" className="text-xs text-blue-600 font-bold hover:underline">Forgot?</a>
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
                                    Sign In
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-400 font-medium">New to {config.app.name}? <a href="/candidate" className="text-blue-600 font-bold hover:underline">Create an account</a></p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">Demo Credentials</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">candidate@example.com · password123</p>
                </div>
            </div>
        </div>
    );
}
