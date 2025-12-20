'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Job, Application, PdfResume, Resume } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ResumeUpload from '@/components/ResumeUpload';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function CandidateDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'resumes'>('explore');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Resume state
    const [pdfResumes, setPdfResumes] = useState<PdfResume[]>([]);
    const [builderResumes, setBuilderResumes] = useState<Resume[]>([]);

    useEffect(() => {
        if (activeTab === 'explore') {
            fetchJobs();
        } else if (activeTab === 'applications') {
            fetchApplications();
        } else if (activeTab === 'resumes') {
            fetchResumes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.getJobs(new URLSearchParams({ limit: '50' }));
            if (response.items) {
                setJobs(response.items);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error('Failed to fetch jobs', error);
            setJobs([]);
            // Silently fail for database errors
            const errorMsg = error instanceof Error ? error.message : 'Failed to load jobs';
            if (!errorMsg.includes('Database service error')) {
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.getMyApplications();
            if (response.success && response.applications) {
                setApplications(response.applications);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error('Failed to fetch applications', error);
            setApplications([]);
            // Only show toast if it's not a database error (which is expected if backend is down)
            const errorMsg = error instanceof Error ? error.message : 'Failed to load applications';
            if (!errorMsg.includes('Database service error')) {
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchResumes = async () => {
        setLoading(true);
        try {
            // Fetch both types in parallel
            const [pdfRes, builderRes] = await Promise.all([
                api.getPdfResumes().catch(() => ({ total: 0, resumes: [] })),
                api.getResumes().catch(() => [])
            ]);

            setPdfResumes(pdfRes.resumes || []);
            setBuilderResumes(builderRes || []);
        } catch (error) {
            console.error('Failed to fetch resumes', error);
            setPdfResumes([]);
            setBuilderResumes([]);
            // Silently fail for database errors
            const errorMsg = error instanceof Error ? error.message : 'Failed to load resumes';
            if (!errorMsg.includes('Database service error')) {
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteResume = async (id: number) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;
        try {
            await api.deletePdfResume(id);
            fetchResumes(); // Refresh list
        } catch {
            alert('Failed to delete resume');
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleResumeUploadSuccess = (resumeId: number) => {
        localStorage.setItem('last_uploaded_resume_id', resumeId.toString());
        alert('Resume uploaded successfully!');
        fetchResumes(); // Refresh list
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
            {/* Top Header */}
            <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-2xl shadow-sm h-12 w-auto" />
                    </div>
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'explore' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            Explore Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            My Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('resumes')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'resumes' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            My Resumes
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/candidate/resumes')}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="My Resumes"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => router.push('/candidate/settings')}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Settings"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user?.full_name || 'Candidate'}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Job Seeker</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-lg">👤</div>
                    <button onClick={logout} className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">Logout</button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-6" />

                {activeTab === 'explore' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">Find Your Dream Role</h1>
                            <p className="text-gray-500 dark:text-gray-400">Discover opportunities that match your skills and ambitions.</p>
                        </div>

                        <div className="relative mb-10">
                            <input
                                type="text"
                                placeholder="Search by job title, company, or location..."
                                className="w-full px-6 py-4 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Loading jobs...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredJobs.map(job => (
                                    <div key={job.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{job.title}</h4>
                                                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">{job.company_name}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase rounded-full">{job.job_type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                                            <span>📍 {job.location}</span>
                                            <span>💰 {job.salary_min ? `${job.salary_currency || '$'}${job.salary_min} - ${job.salary_max}` : 'Competitive'}</span>
                                        </div>
                                        <Link
                                            href={`/jobs/${job.slug}`}
                                            className="block w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-center"
                                        >
                                            View Details & Apply
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">My Applications</h1>
                            <p className="text-gray-500 dark:text-gray-400">Track the status of your active job applications.</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Position</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Applied Date</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={3} className="px-6 py-10 text-center">Loading applications...</td></tr>
                                    ) : applications.map(app => {
                                        return (
                                            <tr key={app.id}>
                                                <td className="px-6 py-6">
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">Job #{app.job_id}</p>
                                                    <Link href={`/jobs/${app.job_id}`} className="text-xs text-blue-500 hover:underline">View Job</Link>
                                                </td>
                                                <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-400 font-medium">{new Date(app.applied_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-600`}>
                                                        {app.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!loading && applications.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic">No applications found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'resumes' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">My Resumes</h1>
                            <p className="text-gray-500 dark:text-gray-400">Upload and manage your CVs for job applications.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Upload Section */}
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-6">Upload New PDF Resume</h3>
                                <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                            </div>

                            {/* Resume List */}
                            <div className="space-y-8">
                                {/* PDF Resumes */}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                        Uploaded Resumes
                                    </h3>
                                    {loading ? (
                                        <div className="text-gray-400 text-sm">Loading...</div>
                                    ) : pdfResumes.length > 0 ? (
                                        <div className="space-y-3">
                                            {pdfResumes.map(resume => (
                                                <div key={resume.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">📄</div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{resume.resume_name}</p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(resume.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteResume(resume.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                                        title="Delete Resume"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center text-gray-400 dark:text-gray-500 text-sm">
                                            No PDF resumes uploaded yet.
                                        </div>
                                    )}
                                </div>

                                {/* Builder Resumes */}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                        LetsMakeCV Resumes
                                    </h3>
                                    {loading ? (
                                        <div className="text-gray-400 text-sm">Loading...</div>
                                    ) : builderResumes.length > 0 ? (
                                        <div className="space-y-3">
                                            {builderResumes.map(resume => (
                                                <div key={resume.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center text-lg">📝</div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{resume.name}</p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">Template: {resume.template_name || 'Standard'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center text-gray-400 dark:text-gray-500 text-sm">
                                            No resumes found from LetsMakeCV builder.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
