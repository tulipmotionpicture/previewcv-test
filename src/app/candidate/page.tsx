'use client';

import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';

export default function CandidateLanding() {
    return (
        <div className="min-h-screen bg-white text-gray-950 selection:bg-teal-100">
            <nav className="h-24 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-3xl shadow-xl h-20 w-auto" />
                </div>
                <div className="flex items-center gap-8">
                    <Link href="/jobs" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Browse Jobs</Link>
                    <Link href="/candidate/login" className="px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">Candidate Login</Link>
                </div>
            </nav>

            <section className="relative pt-32 pb-48 px-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,#f0f9ff_0%,#ffffff_100%)]" />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <div className="flex-1">
                            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full mb-8">Ready for your next move?</div>
                            <h1 className="text-6xl lg:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">
                                Showcase Your <br />
                                <span className="text-blue-600 bg-blue-50 px-4 rounded-3xl italic">Work.</span>
                            </h1>
                            <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-medium">
                                Connect your professional profile from <span className="font-bold text-gray-900 underline decoration-blue-500">LetsMakeCV</span> and apply to premium roles with a single click.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link href="/candidate/login" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200">Get Started</Link>
                                <Link href="/jobs" className="px-10 py-5 bg-white border border-gray-200 text-gray-900 font-black rounded-2xl hover:border-gray-900 transition-all">Explore Opportunities</Link>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-[60px] blur-3xl opacity-50 -z-10 animate-pulse" />
                            <div className="bg-white border border-gray-100 rounded-[56px] p-10 shadow-2xl relative overflow-hidden group">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                                    <div>
                                        <div className="h-4 w-32 bg-gray-100 rounded-full mb-2" />
                                        <div className="h-3 w-48 bg-gray-50 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-4 mb-12">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-2 w-full bg-gray-50 rounded-full" />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="h-10 w-32 border border-gray-100 rounded-xl" />
                                    <div className="h-10 w-10 bg-blue-600 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-32 bg-gray-900 text-white rounded-[64px] mx-4 mb-4 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
                    <h2 className="text-4xl font-black mb-8 leading-tight">Sync seamlessly with LetsMakeCV and take control of your career journey.</h2>
                    <p className="text-gray-400 text-lg mb-12">Millions of professionals use LetsMakeCV to design their careers. Now, PreviewCV helps you land the job.</p>
                    <Link href="#" className="px-10 py-5 bg-white text-gray-900 font-black rounded-2xl hover:bg-blue-50 transition-all">Build Your Resume Now</Link>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px]" />
            </section>
        </div>
    );
}
