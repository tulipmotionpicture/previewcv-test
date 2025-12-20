'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import config from '@/config';

// Type definitions
interface BaseRecruiterProfile {
    recruiterType: 'company' | 'individual';
    username: string;
    bio: string;
    logoUrl: string;
    location: string;
    phone: string;
    linkedinUrl: string;
    isVerified: boolean;
    stats: {
        jobsPosted: number;
        hiresMade: number;
        activeJobs: number;
    };
    activeJobs: Array<{
        id: number;
        title: string;
        location: string;
        type: string;
        postedDays: number;
    }>;
}

interface CompanyRecruiterProfile extends BaseRecruiterProfile {
    recruiterType: 'company';
    companyName: string;
    companyWebsite: string;
    companySize: string;
    industry: string;
}

interface IndividualRecruiterProfile extends BaseRecruiterProfile {
    recruiterType: 'individual';
    fullName: string;
    specialization: string;
    yearsExperience: number;
}

type RecruiterProfile = CompanyRecruiterProfile | IndividualRecruiterProfile;

// Mock data - replace with actual API call
const MOCK_RECRUITER_PROFILES: Record<string, RecruiterProfile> = {
    'techcorp': {
        recruiterType: 'company',
        companyName: 'TechCorp Inc.',
        username: 'techcorp',
        bio: 'Leading technology company specializing in innovative software solutions. We\'re building the future of cloud computing and AI.',
        logoUrl: '/images/profile1.png',
        location: 'San Francisco, CA',
        companyWebsite: 'https://techcorp.com',
        companySize: '201-500',
        industry: 'Technology',
        phone: '+1 (555) 123-4567',
        linkedinUrl: 'https://linkedin.com/company/techcorp',
        isVerified: true,
        stats: {
            jobsPosted: 45,
            hiresMade: 120,
            activeJobs: 8
        },
        activeJobs: [
            { id: 1, title: 'Senior Software Engineer', location: 'Remote', type: 'Full-time', postedDays: 3 },
            { id: 2, title: 'Product Manager', location: 'San Francisco, CA', type: 'Full-time', postedDays: 7 },
            { id: 3, title: 'UX Designer', location: 'Hybrid', type: 'Full-time', postedDays: 12 }
        ]
    },
    'john-recruiter': {
        recruiterType: 'individual',
        fullName: 'John Smith',
        username: 'john-recruiter',
        bio: 'Experienced tech recruiter with 10+ years of experience placing top talent at Fortune 500 companies. Specializing in executive search and technical roles.',
        logoUrl: '/images/profile2.png',
        location: 'New York, NY',
        specialization: 'Tech & Executive Recruiting',
        yearsExperience: 10,
        phone: '+1 (555) 987-6543',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        isVerified: true,
        stats: {
            jobsPosted: 28,
            hiresMade: 85,
            activeJobs: 5
        },
        activeJobs: [
            { id: 4, title: 'VP of Engineering', location: 'New York, NY', type: 'Full-time', postedDays: 5 },
            { id: 5, title: 'Senior Data Scientist', location: 'Remote', type: 'Full-time', postedDays: 10 }
        ]
    }
};

export default function RecruiterProfile() {
    const params = useParams();
    const username = params.username as string;

    const profile = MOCK_RECRUITER_PROFILES[username as keyof typeof MOCK_RECRUITER_PROFILES];

    if (!profile) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Recruiter Not Found</h1>
                    <p className="text-gray-500 mb-8">The recruiter profile you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/" className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-tight">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = profile.recruiterType === 'company'
        ? (profile as CompanyRecruiterProfile).companyName
        : (profile as IndividualRecruiterProfile).fullName;

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100">
            {/* Navigation */}
            <nav className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3">
                    <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-3xl shadow-sm h-16 w-auto" />
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/jobs" className="text-sm font-black text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-tight">Browse Jobs</Link>
                    <Link href="/candidate/login" className="px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-tight">For Candidates</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 px-8 overflow-hidden border-b border-gray-100">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10" />

                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start gap-10">
                        {/* Logo/Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-white rounded-[32px] border-4 border-white shadow-2xl shadow-indigo-100 overflow-hidden">
                                <Image src={profile.logoUrl} alt={displayName} fill className="object-cover" />
                            </div>
                            {profile.isVerified && (
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3 uppercase tracking-tight">{displayName}</h1>
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                            {profile.recruiterType === 'company' ? '🏢 Company' : '👤 Individual Recruiter'}
                                        </span>
                                        {profile.isVerified && (
                                            <span className="px-4 py-2 bg-green-50 text-green-600 text-xs font-black uppercase tracking-widest rounded-full border border-green-100">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl normal-case">{profile.bio}</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {profile.location && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                        </svg>
                                        <span className="font-medium text-sm">{profile.location}</span>
                                    </div>
                                )}
                                {profile.recruiterType === 'company' && (profile as CompanyRecruiterProfile).companyWebsite && (
                                    <a href={(profile as CompanyRecruiterProfile).companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                                        </svg>
                                        <span className="font-bold text-sm normal-case">Visit Website</span>
                                    </a>
                                )}
                                {profile.linkedinUrl && (
                                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                        <span className="font-bold text-sm normal-case">LinkedIn Profile</span>
                                    </a>
                                )}
                            </div>

                            {/* Additional Info */}
                            {profile.recruiterType === 'company' && (
                                <div className="flex flex-wrap gap-6 text-sm">
                                    {(profile as CompanyRecruiterProfile).companySize && (
                                        <div>
                                            <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Company Size</span>
                                            <p className="text-gray-900 font-bold mt-1">{(profile as CompanyRecruiterProfile).companySize} employees</p>
                                        </div>
                                    )}
                                    {(profile as CompanyRecruiterProfile).industry && (
                                        <div>
                                            <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Industry</span>
                                            <p className="text-gray-900 font-bold mt-1">{(profile as CompanyRecruiterProfile).industry}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {profile.recruiterType === 'individual' && (
                                <div className="flex flex-wrap gap-6 text-sm">
                                    {(profile as IndividualRecruiterProfile).specialization && (
                                        <div>
                                            <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Specialization</span>
                                            <p className="text-gray-900 font-bold mt-1">{(profile as IndividualRecruiterProfile).specialization}</p>
                                        </div>
                                    )}
                                    {(profile as IndividualRecruiterProfile).yearsExperience && (
                                        <div>
                                            <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Experience</span>
                                            <p className="text-gray-900 font-bold mt-1">{(profile as IndividualRecruiterProfile).yearsExperience} years</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-8 bg-gray-50/50 border-b border-gray-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
                            <div className="text-4xl font-black text-indigo-600 mb-2">{profile.stats.jobsPosted}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Jobs Posted</div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
                            <div className="text-4xl font-black text-green-600 mb-2">{profile.stats.hiresMade}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Successful Hires</div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
                            <div className="text-4xl font-black text-blue-600 mb-2">{profile.stats.activeJobs}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Openings</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Jobs Section */}
            <section className="py-20 px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 uppercase tracking-tight">Active Job Openings</h2>
                        <Link href="/jobs" className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-tight">View All →</Link>
                    </div>

                    <div className="space-y-6">
                        {profile.activeJobs.map(job => (
                            <div key={job.id} className="bg-white border border-gray-100 p-8 rounded-[32px] hover:shadow-xl transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <span className="flex items-center gap-2 text-gray-600 font-medium">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                </svg>
                                                {job.location}
                                            </span>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full">{job.type}</span>
                                            <span className="text-gray-400 text-xs font-medium">Posted {job.postedDays} days ago</span>
                                        </div>
                                    </div>
                                    <Link href={`/jobs/${job.id}`} className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 uppercase tracking-tight text-sm whitespace-nowrap">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {profile.activeJobs.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-400 font-medium text-lg">No active job openings at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 px-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-t border-gray-100">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 uppercase tracking-tight">Interested in Working Together?</h2>
                    <p className="text-gray-600 font-medium text-lg mb-10 normal-case">Browse our open positions or get in touch to discuss opportunities.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/jobs" className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 uppercase tracking-tight">
                            Browse All Jobs
                        </Link>
                        <Link href="/candidate/login" className="px-10 py-5 bg-white border border-gray-200 text-gray-900 font-black rounded-2xl hover:border-gray-900 transition-all uppercase tracking-tight">
                            Candidate Login
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
