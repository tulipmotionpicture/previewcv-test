'use client';

import { useState } from 'react';
import { MOCK_USERS, MOCK_JOBS, MOCK_CANDIDATES, MOCK_APPLICATIONS, Job, Candidate, Application } from '@/config/mockData';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';

export default function RecruiterDashboard() {
    const [activeTab, setActiveTab] = useState<'jobs' | 'ats' | 'search'>('jobs');
    const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
    const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Interview Modal State
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [selectedAppForInterview, setSelectedAppForInterview] = useState<string | null>(null);

    const handleUpdateStatus = (appId: string, newStatus: Application['status']) => {
        setApplications(prev => prev.map(app =>
            app.id === appId ? { ...app, status: newStatus } : app
        ));
    };

    const handleScheduleInterview = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAppForInterview) {
            handleUpdateStatus(selectedAppForInterview, 'Interview Scheduled');
            setIsInterviewModalOpen(false);
            setSelectedAppForInterview(null);
            alert('Interview scheduled successfully! Invitation sent to candidate.');
        }
    };

    const handleCreateJob = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const location = (form.elements.namedItem('location') as HTMLInputElement).value;

        if (title && location) {
            const newJob: Job = {
                id: `j${Date.now()}`,
                title,
                company: MOCK_USERS.recruiter.company,
                location,
                type: 'Full-time',
                salary: '$100k - $140k',
                description: 'Newly posted job.',
                postedDate: new Date().toISOString().split('T')[0],
            };
            setJobs([newJob, ...jobs]);
            form.reset();
        }
    };

    const getJobApplications = (jobId: string) => {
        return applications.filter(app => app.jobId === jobId);
    };

    const getCandidateById = (id: string) => {
        return candidates.find(c => c.id === id);
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredApplications = applications.filter(app => {
        const jobMatch = !selectedJobId || app.jobId === selectedJobId;
        const statusMatch = statusFilter === 'All' || app.status === statusFilter;
        return jobMatch && statusMatch;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 text-gray-900 min-h-screen p-6 sticky top-0 h-screen shadow-sm">
                <div className="mb-10 flex items-center justify-center">
                    <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-3xl" />
                </div>
                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-tight ${activeTab === 'jobs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Manage Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab('ats')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-tight ${activeTab === 'ats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Application Review
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-tight ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Talent Search
                    </button>
                </nav>
                <div className="absolute bottom-10 left-6 right-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-1 font-black uppercase tracking-widest">Signed in as</p>
                        <p className="font-bold text-sm truncate text-gray-900">{MOCK_USERS.recruiter.name}</p>
                        <Link href="/" className="text-[10px] text-indigo-600 hover:underline mt-4 block font-black uppercase tracking-tight">Sign out</Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto">
                {activeTab === 'jobs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-black text-gray-900 mb-10">Manage Career Opportunities</h1>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
                            <h3 className="text-lg font-bold mb-6">Post New Opportunity</h3>
                            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input name="title" placeholder="Job Title" className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-colors" required />
                                <input name="location" placeholder="Location (e.g. Remote)" className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-colors" required />
                                <button type="submit" className="bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all">Post Job</button>
                            </form>
                        </section>

                        <div className="grid grid-cols-1 gap-6">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-1 uppercase tracking-tight">{job.title}</h4>
                                        <p className="text-gray-400 text-xs font-black uppercase tracking-tight">{job.location} • {job.type} • {job.salary}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setSelectedJobId(job.id); setActiveTab('ats'); }}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                                        >
                                            {getJobApplications(job.id).length} Applications
                                        </button>
                                        <button className="p-2 text-gray-300 hover:text-red-500 font-bold text-sm">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ats' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Application Review System</h1>
                        <p className="text-gray-500 mb-10">Review and manage candidate applications for your active roles.</p>

                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setSelectedJobId(null)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold ${!selectedJobId ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                >
                                    All Jobs
                                </button>
                                {jobs.map(job => (
                                    <button
                                        key={job.id}
                                        onClick={() => setSelectedJobId(job.id)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold ${selectedJobId === job.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                    >
                                        {job.title}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Filter Status:</span>
                                <select
                                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer hover:border-indigo-300 transition-colors"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option>All</option>
                                    <option>Pending</option>
                                    <option>Shortlisted</option>
                                    <option>Interview Scheduled</option>
                                    <option>Declined</option>
                                    <option>Hired</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Candidate</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Position</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredApplications.map(app => {
                                            const candidate = getCandidateById(app.candidateId);
                                            const job = jobs.find(j => j.id === app.jobId);
                                            return (
                                                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-6 border-b border-gray-50">
                                                        <p className="font-bold text-gray-900">{candidate?.name}</p>
                                                        <p className="text-[10px] text-gray-400">{candidate?.email}</p>
                                                    </td>
                                                    <td className="px-6 py-6 text-gray-600 text-sm border-b border-gray-50">{job?.title}</td>
                                                    <td className="px-6 py-6 border-b border-gray-50">
                                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${app.status === 'Hired' ? 'bg-green-100 text-green-600' :
                                                            app.status === 'Declined' || app.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                                app.status === 'Shortlisted' ? 'bg-indigo-100 text-indigo-600' :
                                                                    app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-600' :
                                                                        'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-right border-b border-gray-50">
                                                        <div className="flex justify-end gap-2">
                                                            <a
                                                                href={`/resume/view/${candidate?.resumeToken}`}
                                                                target="_blank"
                                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 font-bold text-[10px] rounded-lg hover:bg-gray-200 transition-colors"
                                                            >
                                                                View
                                                            </a>
                                                            {app.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                                                                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-[10px] rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                                                                >
                                                                    Shortlist
                                                                </button>
                                                            )}
                                                            {app.status === 'Shortlisted' && (
                                                                <button
                                                                    onClick={() => { setSelectedAppForInterview(app.id); setIsInterviewModalOpen(true); }}
                                                                    className="px-3 py-1.5 bg-purple-600 text-white font-bold text-[10px] rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200"
                                                                >
                                                                    Call Interview
                                                                </button>
                                                            )}
                                                            {(app.status !== 'Declined' && app.status !== 'Hired' && app.status !== 'Rejected') && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(app.id, 'Declined')}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-[10px] rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    Decline
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredApplications.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium italic">No applications found matching the criteria.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Global Talent Search</h1>
                        <p className="text-gray-500 mb-10">Discover active candidates directly from the database.</p>

                        <div className="relative mb-12">
                            <input
                                type="text"
                                placeholder="Search by name, role, or skills (e.g. React, Node.js)..."
                                className="w-full px-6 py-5 bg-white shadow-xl shadow-gray-200/50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredCandidates.map(candidate => (
                                <div key={candidate.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors border border-indigo-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-gray-900 mb-1">{candidate.name}</h4>
                                            <p className="text-indigo-500 font-bold text-sm">{candidate.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {candidate.skills.map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-full">{skill}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <p className="text-xs text-gray-400">Experience: <span className="font-bold text-gray-900">{candidate.experience}</span></p>
                                        <a
                                            href={`/resume/view/${candidate.resumeToken}`}
                                            target="_blank"
                                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                        >
                                            Preview Profile
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Backdrop */}
            {isInterviewModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Schedule Interview</h2>
                        <p className="text-gray-500 mb-8 font-medium">Set the date and time for the candidate interview.</p>

                        <form onSubmit={handleScheduleInterview} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Interview Date</label>
                                <input type="date" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none hover:bg-gray-100 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Interview Time</label>
                                <input type="time" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none hover:bg-gray-100 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Notes for Candidate</label>
                                <textarea placeholder="e.g. Please bring your portfolio..." className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none hover:bg-gray-100 transition-all min-h-[100px]" />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsInterviewModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                                >
                                    Confirm & Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
