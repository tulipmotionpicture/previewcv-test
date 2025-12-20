'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';
import { useRecruiterAuth } from '@/context/RecruiterAuthContext';

type RecruiterType = 'company' | 'individual';

export default function RecruiterSignup() {
    const router = useRouter();
    const { register } = useRecruiterAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        recruiterType: 'company' as RecruiterType,
        username: '',
        // Company fields
        companyName: '',
        companyWebsite: '',
        companySize: '',
        industry: '',
        // Individual fields
        specialization: '',
        yearsExperience: '',
        // Common fields
        phone: '',
        location: '',
        agreeToTerms: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!formData.agreeToTerms) {
            setError('You must agree to the terms and conditions');
            return;
        }

        if (formData.recruiterType === 'company' && !formData.companyName) {
            setError('Company name is required');
            return;
        }

        if (formData.recruiterType === 'individual' && !formData.specialization) {
            setError('Specialization is required');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                username: formData.username,
                company_name: formData.companyName,
                company_website: formData.companyWebsite,
                // bio and other fields can be added if API supports them or mapped accordingly
                phone: formData.phone,
                // store other fields in metadata or separate profile update if needed, 
                // but based on API guide, register takes specific fields. 
                // Guide says: { email, password, company_name, full_name, phone, company_website, bio }
                bio: formData.recruiterType === 'individual' ? `Specialization: ${formData.specialization}, Experience: ${formData.yearsExperience}` : `Industry: ${formData.industry}, Size: ${formData.companySize}`
            });
            router.push('/recruiter/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-indigo-100 uppercase tracking-tight">
            {/* Background Effects */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -z-10" />

            <div className="w-full max-w-[900px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-[48px] shadow-2xl shadow-indigo-100 mb-8 border border-gray-100 overflow-hidden p-6">
                        <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Join Our Recruiter Network</h1>
                    <p className="text-gray-500 font-medium lowercase first-letter:uppercase">Create your account and start hiring top talent.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Recruiter Type Selection */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Account Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`relative flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.recruiterType === 'company' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                    <input
                                        type="radio"
                                        name="recruiterType"
                                        value="company"
                                        checked={formData.recruiterType === 'company'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🏢</div>
                                        <div className="font-black text-sm">Company</div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-1 normal-case">Hiring for organization</div>
                                    </div>
                                </label>
                                <label className={`relative flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.recruiterType === 'individual' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                    <input
                                        type="radio"
                                        name="recruiterType"
                                        value="individual"
                                        checked={formData.recruiterType === 'individual'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">👤</div>
                                        <div className="font-black text-sm">Individual</div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-1 normal-case">Independent recruiter</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="recruiter@company.com"
                                />
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Username */}
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Profile Username</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm normal-case">previewcv.com/recruiter/</span>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        className="w-full pl-[240px] pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300 normal-case"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="your-username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Conditional Fields Based on Recruiter Type */}
                        {formData.recruiterType === 'company' ? (
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-black text-gray-900">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Tech Corp Inc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Company Website</label>
                                        <input
                                            type="url"
                                            name="companyWebsite"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300 normal-case"
                                            value={formData.companyWebsite}
                                            onChange={handleChange}
                                            placeholder="https://company.com"
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
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            placeholder="Technology, Finance, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-black text-gray-900">Professional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Specialization</label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            placeholder="Tech Recruiting, Executive Search, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Years of Experience</label>
                                        <input
                                            type="number"
                                            name="yearsExperience"
                                            min="0"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                            value={formData.yearsExperience}
                                            onChange={handleChange}
                                            placeholder="5"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="San Francisco, CA"
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-3 px-1">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                id="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className="w-5 h-5 mt-0.5 rounded border-gray-300 bg-gray-50 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="agreeToTerms" className="text-xs text-gray-500 font-medium normal-case leading-relaxed">
                                I agree to the <a href="#" className="text-indigo-600 font-bold hover:underline">Terms and Conditions</a> and <a href="#" className="text-indigo-600 font-bold hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-500 font-medium normal-case">
                            Already have an account?{' '}
                            <Link href="/recruiter/login" className="text-indigo-600 font-black hover:underline uppercase tracking-tight">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
