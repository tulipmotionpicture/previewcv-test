'use client';

import { useState } from 'react';
import { MOCK_USERS, MOCK_JOBS, MOCK_APPLICATIONS, Job, Application } from '@/config/mockData';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';

export default function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState<'explore' | 'applications'>('explore');
    const [jobs] = useState<Job[]>(MOCK_JOBS);
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS.filter(app => app.candidateId === 'c1'));
    const [searchQuery, setSearchQuery] = useState('');

    const handleApply = (jobId: string) => {
        const alreadyApplied = applications.some(app => app.jobId === jobId);
        if (alreadyApplied) {
            alert('You have already applied for this position.');
            return;
        }

        const newApplication: Application = {
            id: `app-${Date.now()}`,
            jobId,
            candidateId: 'c1',
            status: 'Pending',
            appliedDate: new Date().toISOString().split('T')[0]
        };

        setApplications([newApplication, ...applications]);
        alert('Application submitted successfully!');
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{MOCK_USERS.candidate.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Job Seeker</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
                    <Link href="/" className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors">Logout</Link>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredJobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                                            <p className="text-blue-600 font-bold text-sm">{job.company}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-full">{job.type}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                                        <span>📍 {job.location}</span>
                                        <span>💰 {job.salary}</span>
                                    </div>
                                    <button
                                        onClick={() => handleApply(job.id)}
                                        className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">My Applications</h1>
                            <p className="text-gray-500">Track the status of your active job applications.</p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left order-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Position</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Applied Date</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {applications.map(app => {
                                        const job = jobs.find(j => j.id === app.jobId);
                                        return (
                                            <tr key={app.id}>
                                                <td className="px-6 py-6">
                                                    <p className="font-bold text-gray-900">{job?.title}</p>
                                                    <p className="text-xs text-gray-400">{job?.company}</p>
                                                </td>
                                                <td className="px-6 py-6 text-sm text-gray-500 font-medium">{app.appliedDate}</td>
                                                <td className="px-6 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${app.status === 'Hired' ? 'bg-green-100 text-green-600' :
                                                        app.status === 'Declined' ? 'bg-red-100 text-red-600' :
                                                            app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-600' :
                                                                app.status === 'Shortlisted' ? 'bg-indigo-100 text-indigo-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {applications.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic">No applications found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
