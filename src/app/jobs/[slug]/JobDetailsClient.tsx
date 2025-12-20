'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Job, PdfResume, Resume } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import ResumeUpload from '@/components/ResumeUpload';
import { useEffect } from 'react';

interface JobDetailsClientProps {
    job: Job;
    slug: string;
}

export default function JobDetailsClient({ job, slug }: JobDetailsClientProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    // Resume selection state
    const [resumeId, setResumeId] = useState<number | null>(null);
    const [pdfResumes, setPdfResumes] = useState<PdfResume[]>([]);
    const [builderResumes, setBuilderResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchResumes();
        }
    }, [isAuthenticated]);

    const fetchResumes = async () => {
        setLoadingResumes(true);
        try {
            const [pdfRes, builderRes] = await Promise.all([
                api.getPdfResumes().catch(() => ({ total: 0, resumes: [] })),
                api.getResumes().catch(() => [])
            ]);
            setPdfResumes(pdfRes.resumes || []);
            setBuilderResumes(builderRes || []);

            // Try to pre-fill from local storage 
            const storedResumeId = localStorage.getItem('last_uploaded_resume_id');
            if (storedResumeId) {
                const id = parseInt(storedResumeId, 10);
                // Check if it exists in either list
                const exists = (pdfRes.resumes || []).some(r => r.id === id) || (builderRes || []).some(r => r.id === id);
                if (exists) {
                    setResumeId(id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch resumes', error);
        } finally {
            setLoadingResumes(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            router.push(`/candidate/login?redirect=/jobs/${slug}`);
            return;
        }

        if (!resumeId) {
            alert('Please select or upload a resume before applying.');
            return;
        }

        setApplying(true);
        try {
            await api.applyToJob(job.id, {
                resume_id: resumeId,
                cover_letter: coverLetter
            });
            setApplySuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Failed to apply');
            }
        } finally {
            setApplying(false);
        }
    };

    const handleResumeUploadSuccess = (id: number) => {
        setResumeId(id);
        localStorage.setItem('last_uploaded_resume_id', id.toString());
        fetchResumes(); // Refresh list to include new upload
    };

    return (
        <div className="sticky top-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-8 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6">Apply Now</h3>

            {applySuccess ? (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-6 rounded-3xl text-center border border-green-100 dark:border-green-800">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="font-bold mb-2">Application Sent!</p>
                    <p className="text-sm">The recruiter will review your profile shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleApply} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                            Cover Letter (Optional)
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Introduce yourself..."
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                            Resume
                        </label>

                        {loadingResumes ? (
                            <div className="text-xs text-gray-400 dark:text-gray-500">Loading resumes...</div>
                        ) : (
                            <div className="space-y-4">
                                {/* Resume Selection */}
                                {(pdfResumes.length > 0 || builderResumes.length > 0) && (
                                    <div className="space-y-2">
                                        <select
                                            value={resumeId || ''}
                                            onChange={(e) => setResumeId(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="" disabled>Select a resume</option>
                                            {pdfResumes.length > 0 && (
                                                <optgroup label="Uploaded Resumes">
                                                    {pdfResumes.map(r => (
                                                        <option key={`pdf-${r.id}`} value={r.id}>{r.resume_name}</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            {builderResumes.length > 0 && (
                                                <optgroup label="LetsMakeCV Resumes">
                                                    {builderResumes.map(r => (
                                                        <option key={`builder-${r.id}`} value={r.id}>{r.name}</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {/* Upload New */}
                                {!resumeId && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Or upload a new one:</p>
                                        <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                                    </div>
                                )}

                                {resumeId && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setResumeId(null)}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                                        >
                                            Using different resume?
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isAuthenticated ? (
                        <a 
                            href={`/candidate/login?redirect=/jobs/${slug}`} 
                            className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg text-center"
                        >
                            Login to Apply
                        </a>
                    ) : (
                        <button
                            type="submit"
                            disabled={applying || !resumeId}
                            className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {applying ? 'Sending...' : 'Submit Application'}
                        </button>
                    )}

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                        Your PreviewCV profile and resume will be shared with {job.company_name}.
                    </p>
                </form>
            )}
        </div>
    );
}

