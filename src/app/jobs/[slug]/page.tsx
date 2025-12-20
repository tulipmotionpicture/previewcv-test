'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Job } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import ResumeUpload from '@/components/ResumeUpload';

export default function JobDetails({ params }: { params: Promise<{ slug: string }> }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [slug, setSlug] = useState<string>('');

    // Unwrap params
    useEffect(() => {
        params.then(unwrappedParams => {
            setSlug(unwrappedParams.slug);
        });
    }, [params]);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.getJobBySlug(slug);
                if (response.success && response.job) {
                    setJob(response.job);
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                setError('Failed to load job details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchJob();
        }
    }, [slug]);

    const [resumeId, setResumeId] = useState<number | null>(null);

    useEffect(() => {
        // Try to pre-fill from local storage if available
        const storedResumeId = localStorage.getItem('last_uploaded_resume_id');
        if (storedResumeId) {
            setResumeId(parseInt(storedResumeId, 10));
        }
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            router.push(`/candidate/login?redirect=/jobs/${slug}`);
            return;
        }

        if (!job) return;

        if (!resumeId) {
            alert('Please upload a resume before applying.');
            return;
        }

        setApplying(true);
        try {
            await api.applyToJob(job.id, {
                resume_id: resumeId,
                cover_letter: coverLetter
            });
            setApplySuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Failed to apply');
            }
        } finally {
            setApplying(false);
        }
    };

    const handleResumeUploadSuccess = (id: number) => {
        setResumeId(id);
        localStorage.setItem('last_uploaded_resume_id', id.toString());
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-black text-gray-900 mb-4">Job Not Found</h1>
                <Link href="/jobs" className="text-blue-600 font-bold hover:underline">Browse all jobs</Link>
            </div>
        );
    }

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
                        <Link href="/jobs" className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">← Back to Jobs</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <div className="bg-gray-50 rounded-[56px] p-12 mb-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-5xl flex-shrink-0">
                            {job.company_logo_url ? <Image src={job.company_logo_url} alt={job.company_name} width={64} height={64} className="object-contain" /> : '🏢'}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{job.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 mb-6">
                                <span className="text-blue-600 uppercase tracking-widest">{job.company_name}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                                <span>•</span>
                                <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                            </div>

                            {/* Salary Tag */}
                            {(job.salary_min || job.salary_max) && (
                                <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold">
                                    💰 {job.salary_min ? formatCurrency(job.salary_min, job.salary_currency || 'USD') : ''}
                                    {job.salary_max ? ` - ${formatCurrency(job.salary_max, job.salary_currency || 'USD')}` : ''}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-6">About the Role</h2>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </div>
                        </section>

                        {job.responsibilities && (
                            <section>
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Responsibilities</h2>
                                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                    {job.responsibilities}
                                </div>
                            </section>
                        )}

                        {job.requirements && (
                            <section>
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Requirements</h2>
                                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-32 bg-white border border-gray-100 rounded-[40px] p-8 shadow-xl">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Apply Now</h3>

                            {applySuccess ? (
                                <div className="bg-green-50 text-green-700 p-6 rounded-3xl text-center">
                                    <div className="text-4xl mb-4">🎉</div>
                                    <p className="font-bold mb-2">Application Sent!</p>
                                    <p className="text-sm">The recruiter will review your profile shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Cover Letter (Optional)</label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none hover:bg-gray-100 transition-all font-medium text-sm"
                                            placeholder="Introduce yourself..."
                                            value={coverLetter}
                                            onChange={e => setCoverLetter(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Resume</label>

                                        {!resumeId ? (
                                            <div className="mb-4">
                                                <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">📄</div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">Resume attached</p>
                                                        <p className="text-xs text-blue-600">ID: {resumeId}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setResumeId(null)}
                                                    className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-tight"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!isAuthenticated ? (
                                        <Link href={`/candidate/login?redirect=/jobs/${slug}`} className="block w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg text-center">
                                            Login to Apply
                                        </Link>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={applying || !resumeId}
                                            className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {applying ? 'Sending...' : 'Submit Application'}
                                        </button>
                                    )}

                                    <p className="text-center text-xs text-gray-400 mt-4">
                                        Your PreviewCV profile and resume will be shared with {job.company_name}.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
