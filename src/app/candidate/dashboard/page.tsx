'use client';

import { useState, useEffect } from 'react';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Job, Application } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import ResumeUpload from '@/components/ResumeUpload';

export default function CandidateDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'resumes'>('explore');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Resume state
    const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);

    useEffect(() => {
        if (activeTab === 'explore') {
            fetchJobs();
        } else if (activeTab === 'applications') {
            fetchApplications();
        }
    }, [activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.getJobs(new URLSearchParams({ limit: '50' }));
            if (response.items) {
                setJobs(response.items);
            }
        } catch (error) {
            console.error('Failed to fetch jobs', error);
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
            }
        } catch (error) {
            console.error('Failed to fetch applications', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleResumeUploadSuccess = (resumeId: number) => {
        setUploadedResumeId(resumeId);
        // Persist to local storage as a simple way to access it in JobDetails for now
        // since we don't have a "getResumes" endpoint.
        localStorage.setItem('last_uploaded_resume_id', resumeId.toString());
        alert('Resume uploaded successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-2xl shadow-sm h-12 w-auto" />
                    </div>
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'explore' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Explore Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'applications' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            My Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('resumes')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'resumes' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            My Resumes
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{user?.full_name || 'Candidate'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Job Seeker</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
                    <button onClick={logout} className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">Logout</button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
                {activeTab === 'explore' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Find Your Dream Role</h1>
                            <p className="text-gray-500">Discover opportunities that match your skills and ambitions.</p>
                        </div>

                        <div className="relative mb-10">
                            <input
                                type="text"
                                placeholder="Search by job title, company, or location..."
                                className="w-full px-6 py-4 bg-white shadow-xl shadow-gray-200/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Loading jobs...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredJobs.map(job => (
                                    <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                                                <p className="text-blue-600 font-bold text-sm">{job.company_name}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-full">{job.job_type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
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
                            <h1 className="text-3xl font-black text-gray-900 mb-2">My Applications</h1>
                            <p className="text-gray-500">Track the status of your active job applications.</p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Position</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Applied Date</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={3} className="px-6 py-10 text-center">Loading applications...</td></tr>
                                    ) : applications.map(app => {
                                        // We might need to fetch job details for each app if not provided in application object, 
                                        // but for now let's assume we might lack job title if not in Application response.
                                        // The Application type has `job_id`, but not title. 
                                        // We might need to fetch jobs or get it from elsewhere.
                                        // For MVP, if we don't have it, we show Job ID or "Job Position".
                                        return (
                                            <tr key={app.id}>
                                                <td className="px-6 py-6">
                                                    <p className="font-bold text-gray-900">Job #{app.job_id}</p>
                                                    <Link href={`/jobs/${app.job_id}`} className="text-xs text-blue-500 hover:underline">View Job</Link>
                                                </td>
                                                <td className="px-6 py-6 text-sm text-gray-500 font-medium">{new Date(app.applied_at).toLocaleDateString()}</td>
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
                            <h1 className="text-3xl font-black text-gray-900 mb-2">My Resumes</h1>
                            <p className="text-gray-500">Upload and manage your CVs for job applications.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl">
                            <h3 className="font-bold text-lg mb-6">Upload New Resume</h3>
                            <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />

                            {uploadedResumeId && (
                                <div className="mt-8 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-3">
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <p className="font-bold">Resume Uploaded</p>
                                        <p className="text-xs">ID: {uploadedResumeId} (Ready to use)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
