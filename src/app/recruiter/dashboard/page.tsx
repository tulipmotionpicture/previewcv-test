'use client';

import { useState, useEffect } from 'react';
import config from '@/config';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Job, Application } from '@/types/api';
import { useRecruiterAuth } from '@/context/RecruiterAuthContext';
import { useToast } from '@/context/ToastContext';
import EditJobModal from '@/components/EditJobModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function RecruiterDashboard() {
    const { recruiter, logout } = useRecruiterAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState<'jobs' | 'ats'>('jobs');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);

    // Loading states
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingApps, setLoadingApps] = useState(false);

    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

    // Action Menu State
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

    // Create Job State
    const [creatingJob, setCreatingJob] = useState(false);
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobLocation, setNewJobLocation] = useState('');

    // Edit Job State
    const [editJobModalOpen, setEditJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    // Delete Job State
    const [deleteJobId, setDeleteJobId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        // Auth check handled by context/protected route logic mostly
        fetchJobs();
    }, []);

    useEffect(() => {
        if (activeTab === 'ats' || selectedJobId) {
            if (jobs.length > 0 && !selectedJobId) {
                setSelectedJobId(jobs[0].id);
            }
        }
    }, [activeTab, jobs, selectedJobId]);

    useEffect(() => {
        if (selectedJobId) {
            fetchApplications(selectedJobId);
        }
    }, [selectedJobId]);

    const fetchJobs = async () => {
        setLoadingJobs(true);
        try {
            const response = await api.getRecruiterJobs();
            if (response.success && response.jobs) {
                setJobs(response.jobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchApplications = async (jobId: number) => {
        setLoadingApps(true);
        setApplications([]); // Clear prev
        try {
            const response = await api.getJobApplications(jobId);
            if (response.success && response.applications) {
                // augment applications with correct job_id if missing (though it should be there)
                const apps = response.applications.map(app => ({ ...app, job_id: jobId }));
                setApplications(apps);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJobTitle || !newJobLocation) return;

        setCreatingJob(true);
        try {
            await api.createJob({
                title: newJobTitle,
                location: newJobLocation,
                company_name: recruiter?.company_name || 'My Company',
                job_type: 'full_time', // default
                experience_level: 'mid', // default
                description: 'Description not provided.', // default
                requirements: 'Requirements not provided.', // default
                responsibilities: 'Responsibilities not provided.', // default
                salary_currency: 'USD',
                is_remote: false,
                required_skills: [],
                categories: []
            });
            await fetchJobs();
            setNewJobTitle('');
            setNewJobLocation('');
            toast.success('Job posted successfully!');
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || 'Failed to create job');
            } else {
                toast.error('Failed to create job');
            }
        } finally {
            setCreatingJob(false);
        }
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setEditJobModalOpen(true);
    };

    const handleSaveJob = async (jobId: number, data: Partial<Job>) => {
        try {
            await api.updateJob(jobId, data);
            await fetchJobs();
            toast.success('Job updated successfully!');
        } catch (error) {
            toast.error('Failed to update job');
            throw error;
        }
    };

    const handleDeleteJob = async () => {
        if (!deleteJobId) return;

        setDeleteLoading(true);
        try {
            await api.deleteJob(deleteJobId, false); // soft delete
            await fetchJobs();
            toast.success('Job deactivated successfully');
            setDeleteJobId(null);
            // If the deleted job was selected, clear selection
            if (selectedJobId === deleteJobId) {
                setSelectedJobId(null);
            }
        } catch {
            toast.error('Failed to delete job');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUpdateStatus = async (appId: number, newStatus: string) => {
        try {
            await api.updateApplicationStatus(appId, newStatus);
            // Optimistic update
            setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus as Application['status'] } : app));
            if (selectedApplication?.id === appId) {
                setSelectedApplication(prev => prev ? { ...prev, status: newStatus as Application['status'] } : null);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || 'Failed to update status');
            } else {
                alert('Failed to update status');
            }
        }
    };

    const filteredApplications = applications.filter(app => {
        return statusFilter === 'All' || app.status === statusFilter.toLowerCase().replace(' ', '_');
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
                </nav>
                <div className="absolute bottom-10 left-6 right-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-1 font-black uppercase tracking-widest">Signed in as</p>
                        <p className="font-bold text-sm truncate text-gray-900">{recruiter?.full_name}</p>
                        <button onClick={logout} className="text-[10px] text-indigo-600 hover:underline mt-4 block font-black uppercase tracking-tight">Sign out</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 max-w-6xl mx-auto overflow-x-hidden">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-6" />

                {activeTab === 'jobs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-black text-gray-900 mb-10">Manage Career Opportunities</h1>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
                            <h3 className="text-lg font-bold mb-6">Post New Opportunity</h3>
                            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input
                                    value={newJobTitle}
                                    onChange={e => setNewJobTitle(e.target.value)}
                                    placeholder="Job Title"
                                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-colors"
                                    required
                                />
                                <input
                                    value={newJobLocation}
                                    onChange={e => setNewJobLocation(e.target.value)}
                                    placeholder="Location (e.g. Remote)"
                                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={creatingJob}
                                    className="bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-70"
                                >
                                    {creatingJob ? 'Posting...' : 'Post Job'}
                                </button>
                            </form>
                        </section>

                        <div className="grid grid-cols-1 gap-6">
                            {loadingJobs ? (
                                <div className="text-center py-10">Loading jobs...</div>
                            ) : jobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-1 uppercase tracking-tight">{job.title}</h4>
                                        <p className="text-gray-400 text-xs font-black uppercase tracking-tight">
                                            {job.location} • {job.job_type.replace('_', ' ')} •
                                            <span className={`ml-1 ${job.status === 'active' ? 'text-green-600' : job.status === 'closed' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEditJob(job)}
                                            className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-100 transition-colors"
                                            title="Edit Job"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeleteJobId(job.id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100 transition-colors"
                                            title="Delete Job"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => { setSelectedJobId(job.id); setActiveTab('ats'); }}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                                        >
                                            View Applications
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!loadingJobs && jobs.length === 0 && <p className="text-gray-400 text-center">No jobs posted yet.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'ats' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Application Review System</h1>
                        <p className="text-gray-500 mb-10">Review and manage candidate applications for your active roles.</p>

                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
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
                                    <option>Applied</option>
                                    <option>Under Review</option>
                                    <option>Interview Scheduled</option>
                                    <option>Offered</option>
                                    <option>Accepted</option>
                                    <option>Rejected</option>
                                    <option>Withdrawn</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Candidate</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loadingApps ? (
                                            <tr><td colSpan={3} className="px-6 py-10 text-center">Loading applications...</td></tr>
                                        ) : filteredApplications.map(app => (
                                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-6 border-b border-gray-50">
                                                    <p className="font-bold text-gray-900">{app.candidate_name}</p>
                                                    <p className="text-[10px] text-gray-400">{app.candidate_email}</p>
                                                </td>
                                                <td className="px-6 py-6 border-b border-gray-50">
                                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-gray-100 text-gray-600`}>
                                                        {app.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right border-b border-gray-50">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedApplication(app); setIsDetailModalOpen(true); setActionMenuOpen(null); }}
                                                            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors uppercase tracking-tight shadow-sm shadow-blue-200"
                                                        >
                                                            View Details
                                                        </button>
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setActionMenuOpen(actionMenuOpen === app.id ? null : app.id)}
                                                                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors uppercase tracking-tight shadow-sm shadow-indigo-200"
                                                            >
                                                                Actions ▼
                                                            </button>
                                                            {actionMenuOpen === app.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                                                    {app.status === 'applied' && (
                                                                        <button
                                                                            onClick={() => { handleUpdateStatus(app.id, 'under_review'); setActionMenuOpen(null); }}
                                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                                        >
                                                                            Mark Under Review
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => { handleUpdateStatus(app.id, 'interview_scheduled'); setActionMenuOpen(null); }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                                    >
                                                                        Schedule Interview
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { handleUpdateStatus(app.id, 'rejected'); setActionMenuOpen(null); }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {!loadingApps && filteredApplications.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-20 text-center text-gray-400 font-medium italic">No applications found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {/* Candidate Detail Modal - Simply showing Application Details for now */}
            {isDetailModalOpen && selectedApplication && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsDetailModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Application Details</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase">Candidate</h3>
                                <p className="font-bold text-lg">{selectedApplication.candidate_name}</p>
                                <p className="text-gray-500">{selectedApplication.candidate_email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase">Cover Letter</h3>
                                <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-xl mt-1">
                                    {selectedApplication.cover_letter || 'No cover letter provided.'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase">Resume</h3>
                                <p className="text-gray-500">Resume ID: {selectedApplication.resume_id}</p>
                                {/* Future: Link to resume preview */}
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Job Modal */}
            <EditJobModal
                isOpen={editJobModalOpen}
                onClose={() => setEditJobModalOpen(false)}
                onSave={handleSaveJob}
                job={editingJob}
            />

            {/* Delete Job Confirmation */}
            <ConfirmDialog
                isOpen={deleteJobId !== null}
                onClose={() => setDeleteJobId(null)}
                onConfirm={handleDeleteJob}
                title="Delete Job Posting"
                message="Are you sure you want to deactivate this job posting? It will no longer be visible to candidates."
                confirmText="Delete Job"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
