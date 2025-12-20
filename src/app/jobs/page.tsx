'use client';

import { useState, useEffect } from 'react';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Job } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

export default function JobBoard() {
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.getJobs(new URLSearchParams({ limit: '50' }));
            if (response.items) {
                setJobs(response.items);
            }
        } catch (err) {
            setError('Failed to load jobs. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatSalary = (job: Job) => {
        if (job.salary_min && job.salary_max) {
            return `${formatCurrency(job.salary_min, job.salary_currency || 'USD')} - ${formatCurrency(job.salary_max, job.salary_currency || 'USD')}`;
        }
        return 'Competitive Salary';
    };


    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-2xl h-12 w-auto" />
                        </Link>
                    </div>
                    <div className="flex gap-4">
                        {!isAuthenticated && (
                            <Link href="/candidate/login" className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Candidate Login</Link>
                        )}
                        <Link href="/recruiter/login" className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all">Recruiter Access</Link>
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

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-600 font-bold">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {jobs.map(job => (
                            <div key={job.id} className="group p-10 bg-gray-50 rounded-[48px] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-100/50 transition-all flex flex-col h-full">
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                    {job.company_logo_url ? <Image src={job.company_logo_url} alt={job.company_name} width={40} height={40} className="object-contain" /> : '🏢'}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{job.title}</h3>
                                <p className="text-blue-600 font-black text-sm mb-6 uppercase tracking-wider">{job.company_name}</p>
                                <div className="space-y-3 mb-10 flex-grow">
                                    <p className="text-gray-500 text-sm flex items-center gap-3">📍 {job.location}</p>
                                    <p className="text-gray-500 text-sm flex items-center gap-3">💰 {formatSalary(job)}</p>
                                    <p className="text-gray-500 text-sm flex items-center gap-3 capitalize">🕒 {job.job_type.replace('_', ' ')}</p>
                                </div>
                                <Link
                                    href={`/jobs/${job.slug}`}
                                    className="block text-center w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg mt-auto"
                                >
                                    View Details & Apply
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && jobs.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No active job postings found. Check back later!
                    </div>
                )}

                <div className="mt-32 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[56px] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <h2 className="text-4xl font-black mb-8">Ready to showcase your talent?</h2>
                    <p className="text-blue-100 mb-12 text-lg max-w-xl mx-auto">Build your professional profile on LetsMakeCV and sync it here to apply for these roles instantly.</p>
                    <Link href="/candidate/signup" className="inline-block px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl">
                        Get Started
                    </Link>
                </div>
            </main>
        </div>
    );
}
