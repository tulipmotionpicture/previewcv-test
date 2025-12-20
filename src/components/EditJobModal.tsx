'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types/api';
import Button from './ui/Button';

interface EditJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (jobId: number, data: Partial<Job>) => Promise<void>;
    job: Job | null;
}

export default function EditJobModal({ isOpen, onClose, onSave, job }: EditJobModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        job_type: 'full_time' as Job['job_type'],
        experience_level: 'mid' as Job['experience_level'],
        description: '',
        requirements: '',
        responsibilities: '',
        salary_min: '',
        salary_max: '',
        is_remote: false,
        status: 'active' as Job['status'],
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                location: job.location || '',
                job_type: job.job_type || 'full_time',
                experience_level: job.experience_level || 'mid',
                description: job.description || '',
                requirements: job.requirements || '',
                responsibilities: job.responsibilities || '',
                salary_min: job.salary_min?.toString() || '',
                salary_max: job.salary_max?.toString() || '',
                is_remote: job.is_remote || false,
                status: job.status || 'active',
            });
        }
    }, [job]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job) return;

        setLoading(true);
        try {
            const updateData: Partial<Job> = {
                title: formData.title,
                location: formData.location,
                job_type: formData.job_type,
                experience_level: formData.experience_level,
                description: formData.description,
                requirements: formData.requirements || undefined,
                responsibilities: formData.responsibilities || undefined,
                salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
                salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
                is_remote: formData.is_remote,
                status: formData.status,
            };

            await onSave(job.id, updateData);
            onClose();
        } catch (error) {
            console.error('Failed to update job:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 my-8 animate-slide-in-right max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Job Posting</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Job Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Job Type</label>
                            <select
                                value={formData.job_type}
                                onChange={(e) => setFormData({ ...formData, job_type: e.target.value as Job['job_type'] })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                            >
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="freelance">Freelance</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Experience Level</label>
                            <select
                                value={formData.experience_level}
                                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value as Job['experience_level'] })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                            >
                                <option value="entry">Entry</option>
                                <option value="mid">Mid</option>
                                <option value="senior">Senior</option>
                                <option value="executive">Executive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                            >
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_remote"
                            checked={formData.is_remote}
                            onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
                        />
                        <label htmlFor="is_remote" className="text-sm font-bold text-gray-900">Remote Position</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Min Salary (USD)</label>
                            <input
                                type="number"
                                value={formData.salary_min}
                                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                placeholder="80000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Max Salary (USD)</label>
                            <input
                                type="number"
                                value={formData.salary_max}
                                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                placeholder="120000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Requirements</label>
                        <textarea
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            rows={3}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Responsibilities</label>
                        <textarea
                            value={formData.responsibilities}
                            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                            rows={3}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-100">
                        <Button type="button" variant="ghost" fullWidth onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth loading={loading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

