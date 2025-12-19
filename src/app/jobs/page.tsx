'use client';

import { MOCK_JOBS } from '@/config/mockData';
import config from '@/config';
import Image from 'next/image';

export default function JobBoard() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-2xl h-12 w-auto" />
                    </div>
                    <div className="flex gap-4">
                        <a href="/candidate/login" className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Candidate Login</a>
                        <a href="/recruiter/login" className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all">Recruiter Access</a>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">Active Opportunities</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Connect with the world&apos;s most innovative companies.
                        Use your <span className="text-blue-600 font-bold">PreviewCV</span> profile to apply in one click.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {MOCK_JOBS.map(job => (
                        <div key={job.id} className="group p-10 bg-gray-50 rounded-[48px] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-100/50 transition-all">
                            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">🏢</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                            <p className="text-blue-600 font-black text-sm mb-6">{job.company}</p>
                            <div className="space-y-3 mb-10">
                                <p className="text-gray-500 text-sm flex items-center gap-3">📍 {job.location}</p>
                                <p className="text-gray-500 text-sm flex items-center gap-3">💰 {job.salary}</p>
                                <p className="text-gray-500 text-sm flex items-center gap-3">🕒 {job.type}</p>
                            </div>
                            <a
                                href="/candidate/login"
                                className="block text-center w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
                            >
                                Apply with PreviewCV
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-32 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[56px] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <h2 className="text-4xl font-black mb-8">Ready to showcase your talent?</h2>
                    <p className="text-blue-100 mb-12 text-lg max-w-xl mx-auto">Build your professional profile on LetsMakeCV and sync it here to apply for these roles instantly.</p>
                    <a href="/candidate" className="inline-block px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl">
                        Get Started
                    </a>
                </div>
            </main>
        </div>
    );
}
