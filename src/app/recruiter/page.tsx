'use client';

import Link from 'next/link';
import config from '@/config';
import Image from 'next/image';

export default function RecruiterLanding() {
    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500">
            {/* SaaS Nav */}
            <nav className="h-20 flex items-center justify-between px-8 bg-gray-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-3xl ring-2 ring-white/10 h-16 w-auto" />
                </div>
                <div className="flex items-center gap-10">
                    <Link href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link href="/recruiter/login" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">Recruiter Login</Link>
                </div>
            </nav>

            <section className="relative pt-32 pb-40 px-8 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h1 className="text-5xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                            Hire Smarter, <br /> Not <span className="text-indigo-500 italic">Harder.</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed">
                            Find, track, and engage with top-tier talent effortlessly. Preview candidate profiles with live resumes and automated ATS integration.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-16">
                            <Link href="/recruiter/login" className="px-8 py-4 bg-white text-gray-950 font-black rounded-xl hover:bg-indigo-50 transition-all">
                                Start Hiring Now
                            </Link>
                            <a href="#demo" className="px-8 py-4 bg-gray-900 border border-white/10 text-white font-black rounded-xl hover:bg-gray-800 transition-all">
                                Watch Demo
                            </a>
                        </div>

                        <div className="flex items-center gap-8 border-t border-white/5 pt-12">
                            <div>
                                <div className="text-3xl font-black mb-1">500+</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Companies</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div>
                                <div className="text-3xl font-black mb-1">10k+</div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Hires Made</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
                            {/* Mock Recruiter Dashboard */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-32 h-4 bg-gray-800 rounded" />
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-gray-800 rounded-lg" />
                                    <div className="w-8 h-8 bg-gray-800 rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500/20 rounded-full" />
                                            <div>
                                                <div className="w-24 h-3 bg-gray-700 rounded mb-2" />
                                                <div className="w-16 h-2 bg-gray-800 rounded" />
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-tighter">Reviewing</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-32 px-8 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black mb-10 tracking-tighter italic text-indigo-400">Search Beyond the Post.</h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Why wait for applications? Our Global Talent Search allows you to browse active resumes even if you haven&apos;t posted a job.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="text-indigo-500">→</span> Advanced filter by skills & experience
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="text-indigo-500">→</span> Real-time resume preview (No downloads)
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="text-indigo-500">→</span> Direct reach-out via secure messaging
                                </li>
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-8 bg-gray-900 border border-white/5 rounded-3xl">
                                <div className="text-3xl mb-6">🔍</div>
                                <h4 className="font-bold mb-2">Global Search</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">Access 100k+ active job seeker profiles instantly.</p>
                            </div>
                            <div className="p-8 bg-gray-900 border border-white/5 rounded-3xl mt-8">
                                <div className="text-3xl mb-6">📈</div>
                                <h4 className="font-bold mb-2">ATS Pro</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">Track candidate lifecycle from application to offer.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
