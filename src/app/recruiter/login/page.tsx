'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 selection:bg-indigo-500">
            {/* Background Effects */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />

            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-[48px] shadow-2xl shadow-indigo-500/30 mb-8 border border-white/10 overflow-hidden p-6">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="object-contain" />
                    </div>
                    <p className="text-gray-400 font-medium">Recruiter Access Profile. Optimize your hiring pipeline.</p>
                </div>

                <div className="bg-gray-900 border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 text-red-400 text-sm font-bold rounded-2xl border border-red-500/20 flex items-center gap-3">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Recruiter ID / Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-6 py-4 bg-gray-800 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-800/80 transition-all font-medium text-white placeholder-gray-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="recruiter@previewcv.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Security Key</label>
                            <input
                                type="password"
                                required
                                className="w-full px-6 py-4 bg-gray-800 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-800/80 transition-all font-medium text-white placeholder-gray-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-gray-800 text-indigo-600 focus:ring-indigo-600" />
                                <span className="text-xs text-gray-400 font-bold">Encrypted Session</span>
                            </label>
                            <a href="#" className="text-xs text-indigo-400 font-bold hover:underline">Forgot Key?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-white text-gray-950 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                            ) : (
                                <>
                                    Enter Dashboard
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-500 font-medium italic">Restricted to authorized recruitment partners.</p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Internal Test Access</p>
                    <p className="text-xs text-gray-500 font-bold mt-1">recruiter@example.com · password123</p>
                </div>
            </div>
        </div>
    );
}
