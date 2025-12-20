import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import config from '@/config';
import { Job } from '@/types/api';
import JobDetailsClient from './JobDetailsClient';
import { notFound } from 'next/navigation';

// Server-side data fetching function
async function getJobBySlug(slug: string): Promise<Job | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://letsmakecv.tulip-software.com';
        const response = await fetch(`${apiUrl}/api/v1/jobs/slug/${slug}`, {
            cache: 'no-store', // Always fetch fresh data for job details
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.success && data.job ? data.job : null;
    } catch (error) {
        console.error('Failed to fetch job:', error);
        return null;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const job = await getJobBySlug(slug);

    if (!job) {
        return {
            title: 'Job Not Found | PreviewCV',
            description: 'The job you are looking for could not be found.',
        };
    }

    const title = `${job.title} at ${job.company_name} | PreviewCV`;
    const description = job.description.substring(0, 160) + '...';
    const imageUrl = job.company_logo_url || config.app.logoUrl;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${job.company_name} logo`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const job = await getJobBySlug(slug);

    if (!job) {
        notFound();
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Image 
                                src={config.app.logoUrl} 
                                alt={config.app.name} 
                                width={120} 
                                height={120} 
                                className="h-12 w-auto" 
                            />
                        </Link>
                    </div>
                    <div className="flex gap-4">
                        <Link 
                            href="/jobs" 
                            className="px-6 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            ← Back to Jobs
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-[40px] p-10 mb-10 border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-5xl flex-shrink-0">
                            {job.company_logo_url ? (
                                <Image 
                                    src={job.company_logo_url} 
                                    alt={job.company_name} 
                                    width={64} 
                                    height={64} 
                                    className="object-contain" 
                                />
                            ) : (
                                <span>🏢</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-4">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">
                                <span className="text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    {job.company_name}
                                </span>
                                <span>•</span>
                                <span>{job.location}</span>
                                <span>•</span>
                                <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                            </div>

                            {/* Salary Tag */}
                            {(job.salary_min || job.salary_max) && (
                                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-bold border border-green-200 dark:border-green-800">
                                    💰 {job.salary_min ? formatCurrency(job.salary_min, job.salary_currency || 'USD') : ''}
                                    {job.salary_max ? ` - ${formatCurrency(job.salary_max, job.salary_currency || 'USD')}` : ''}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                                About the Role
                            </h2>
                            <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </div>
                        </section>

                        {job.responsibilities && (
                            <section>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                                    Responsibilities
                                </h2>
                                <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                    {job.responsibilities}
                                </div>
                            </section>
                        )}

                        {job.requirements && (
                            <section>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
                                    Requirements
                                </h2>
                                <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <JobDetailsClient job={job} slug={slug} />
                    </div>
                </div>
            </main>
        </div>
    );
}

