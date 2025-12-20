'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRecruiterAuth } from '@/context/RecruiterAuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Recruiter } from '@/types/api';

export default function RecruiterProfileEdit() {
    const router = useRouter();
    const { recruiter, updateProfile, logout, isAuthenticated, loading: authLoading } = useRecruiterAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        phone: '',
        location: '',
        linkedin_url: '',
        company_website: '',
        company_size: '',
        industry: '',
        specialization: '',
        years_experience: '',
        company_logo_url: '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/recruiter/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (recruiter) {
            setFormData({
                display_name: recruiter.display_name || '',
                bio: recruiter.bio || '',
                phone: recruiter.phone || '',
                location: recruiter.location || '',
                linkedin_url: recruiter.linkedin_url || '',
                company_website: recruiter.company_website || '',
                company_size: recruiter.company_size || '',
                industry: recruiter.industry || '',
                specialization: recruiter.specialization || '',
                years_experience: recruiter.years_experience?.toString() || '',
                company_logo_url: recruiter.company_logo_url || '',
            });
        }
    }, [recruiter]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.display_name.trim()) {
            newErrors.display_name = 'Display name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const newErrors: Record<string, string> = {};

        if (!passwordData.current_password) {
            newErrors.current_password = 'Current password is required';
        }

        if (!passwordData.new_password) {
            newErrors.new_password = 'New password is required';
        } else if (passwordData.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters';
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // Convert years_experience to number if provided
            const profileData: Partial<Recruiter> = {
                display_name: formData.display_name,
                bio: formData.bio,
                phone: formData.phone,
                location: formData.location,
                linkedin_url: formData.linkedin_url,
                company_website: formData.company_website,
                company_size: formData.company_size,
                industry: formData.industry,
                specialization: formData.specialization,
                company_logo_url: formData.company_logo_url,
            };

            if (formData.years_experience) {
                profileData.years_experience = parseInt(formData.years_experience, 10);
            }

            await updateProfile(profileData);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setPasswordLoading(true);
        try {
            // TODO: Implement password change API
            toast.info('Password change feature coming soon!');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
        } catch {
            toast.error('Failed to logout');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <LoadingSkeleton className="h-12 w-64" />
                    <LoadingSkeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const publicProfileUrl = `https://previewcv.com/recruiter/${recruiter?.id || ''}`;

    return (
        <div className="min-h-screen bg-gray-50 selection:bg-indigo-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Profile Settings</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1 normal-case">Manage your recruiter profile information</p>
                    </div>
                    <Link href="/recruiter/dashboard" className="px-6 py-3 bg-gray-100 text-gray-900 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-tight text-sm">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-12 space-y-8">
                {/* Breadcrumb */}
                <Breadcrumb />

                {/* Public Profile URL */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-[32px]">
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
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicProfileUrl);
                                        toast.success('Link copied to clipboard!');
                                    }}
                                    className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-tight text-sm whitespace-nowrap"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Display Name</label>
                                <input
                                    type="text"
                                    name="display_name"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                />
                                {errors.display_name && <p className="mt-2 text-sm text-red-600 ml-1">{errors.display_name}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    value={recruiter?.email || ''}
                                    disabled
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium text-gray-500"
                                />
                                <p className="text-xs text-gray-500 mt-2 ml-1">Email cannot be changed</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bio / Description</label>
                            <textarea
                                name="bio"
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 resize-none"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell candidates about yourself or your company..."
                            />
                        </div>

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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Website</label>
                                <input
                                    type="url"
                                    name="company_website"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    value={formData.company_website}
                                    onChange={handleChange}
                                    placeholder="https://yourcompany.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    value={formData.linkedin_url}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Size</label>
                                <select
                                    name="company_size"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    value={formData.company_size}
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
                                    placeholder="e.g., Technology, Healthcare"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="e.g., Technical Recruiting, Executive Search"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Years of Experience</label>
                                <input
                                    type="number"
                                    name="years_experience"
                                    min="0"
                                    max="50"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    value={formData.years_experience}
                                    onChange={handleChange}
                                    placeholder="e.g., 5"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Logo URL</label>
                            <input
                                type="url"
                                name="company_logo_url"
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                value={formData.company_logo_url}
                                onChange={handleChange}
                                placeholder="https://yourcompany.com/logo.png"
                            />
                            <p className="text-xs text-gray-500 mt-2 ml-1">Direct URL to your company logo image</p>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <Button type="submit" loading={isSaving} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Password Change */}
                <form onSubmit={handlePasswordChange} className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                placeholder="••••••••"
                            />
                            {errors.current_password && <p className="mt-2 text-sm text-red-600 ml-1">{errors.current_password}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    placeholder="••••••••"
                                />
                                {errors.new_password && <p className="mt-2 text-sm text-red-600 ml-1">{errors.new_password}</p>}
                                <p className="text-xs text-gray-500 mt-2 ml-1">Minimum 8 characters</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900"
                                    placeholder="••••••••"
                                />
                                {errors.confirm_password && <p className="mt-2 text-sm text-red-600 ml-1">{errors.confirm_password}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <Button type="submit" loading={passwordLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                Update Password
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="bg-white border border-red-200 rounded-[40px] p-10 shadow-sm">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-gray-600 mb-6">Irreversible actions that affect your account</p>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                        <div>
                            <h3 className="font-bold text-gray-900">Logout from all devices</h3>
                            <p className="text-sm text-gray-600">This will sign you out from all active sessions</p>
                        </div>
                        <Button variant="danger" onClick={() => setShowLogoutDialog(true)}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                variant="danger"
            />
        </div>
    );
}
