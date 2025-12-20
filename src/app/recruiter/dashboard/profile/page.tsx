'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type RecruiterType = 'company' | 'individual';

export default function RecruiterProfileEdit() {
    const [formData, setFormData] = useState({
        recruiterType: 'company' as RecruiterType,
        username: 'techcorp',
        // Company fields
        companyName: 'TechCorp Inc.',
        companyWebsite: 'https://techcorp.com',
        companySize: '201-500',
        industry: 'Technology',
        // Individual fields
        fullName: '',
        specialization: '',
        yearsExperience: '',
        // Common fields
        bio: 'Leading technology company specializing in innovative software solutions.',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/company/techcorp',
        logoUrl: '/images/profile1.png'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    const publicProfileUrl = `https://previewcv.com/recruiter/profile/${formData.username}`;

    return (
        <div className="min-h-screen bg-gray-50 selection:bg-indigo-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Edit Profile</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1 normal-case">Manage your recruiter profile information</p>
                    </div>
                    <Link href="/recruiter/dashboard" className="px-6 py-3 bg-gray-100 text-gray-900 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-tight text-sm">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-12">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-8 p-4 bg-green-50 text-green-600 text-sm font-bold rounded-2xl border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {successMessage}
                    </div>
                )}

                {/* Public Profile URL */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-[32px] mb-8">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Your Public Profile URL</h3>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={publicProfileUrl}
                                    readOnly
                                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 text-sm normal-case"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(publicProfileUrl)}
                                    className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-tight text-sm whitespace-nowrap"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                        <Link
                            href={`/recruiter/profile/${formData.username}`}
                            target="_blank"
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-900 font-black rounded-xl hover:border-gray-900 transition-all uppercase tracking-tight text-sm whitespace-nowrap"
                        >
                            View Profile →
                        </Link>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
                    <div className="space-y-8">
                        {/* Account Type (Read-only) */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Account Type</label>
                            <div className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                <span className="font-black text-gray-900 uppercase tracking-tight">
                                    {formData.recruiterType === 'company' ? '🏢 Company' : '👤 Individual Recruiter'}
                                </span>
                                <p className="text-xs text-gray-500 mt-1 normal-case">Account type cannot be changed</p>
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Profile Username</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm normal-case">previewcv.com/recruiter/</span>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full pl-[240px] pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 normal-case"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Conditional Fields */}
                        {formData.recruiterType === 'company' ? (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight pt-6 border-t border-gray-100">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Website</label>
                                        <input
                                            type="url"
                                            name="companyWebsite"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 normal-case"
                                            value={formData.companyWebsite}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Size</label>
                                        <select
                                            name="companySize"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                            value={formData.companySize}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="501-1000">501-1000 employees</option>
                                            <option value="1000+">1000+ employees</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Industry</label>
                                        <input
                                            type="text"
                                            name="industry"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                            value={formData.industry}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight pt-6 border-t border-gray-100">Professional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Specialization</label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Years of Experience</label>
                                        <input
                                            type="number"
                                            name="yearsExperience"
                                            min="0"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                            value={formData.yearsExperience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        <div className="pt-6 border-t border-gray-100">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bio / Description</label>
                            <textarea
                                name="bio"
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 resize-none normal-case"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell candidates about yourself or your company..."
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 normal-case"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="pt-6 border-t border-gray-100">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Profile Logo / Avatar</label>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-gray-200 overflow-hidden">
                                    {formData.logoUrl && (
                                        <Image src={formData.logoUrl} alt="Logo" width={96} height={96} className="object-cover" />
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-gray-100 text-gray-900 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-tight text-sm"
                                    >
                                        Upload New Logo
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2 normal-case">Recommended: Square image, at least 400x400px</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 uppercase tracking-tight"
                            >
                                {isSaving ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Save Changes
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
