import config from '@/config';
import Image from 'next/image';
import Link from 'next/link';

const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

export default function CandidateLanding() {
    return (
        <div className="min-h-screen bg-white text-gray-950 selection:bg-teal-100">
            <nav className="h-24 px-8 flex items-center justify-between sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-3xl shadow-xl h-20 w-auto" />
                </div>
                <div className="flex items-center gap-8">
                    <Link href="/jobs" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-tight">Browse Jobs</Link>
                    <Link href="/candidate/login" className="px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 uppercase tracking-tighter">Candidate Login</Link>
                </div>
            </nav>

            <section className="relative pt-32 pb-48 px-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,#f0f9ff_0%,#ffffff_100%)]" />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <div className="flex-1">
                            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">Ready for your next move?</div>
                            <h1 className="text-6xl lg:text-8xl font-black mb-10 leading-[0.9] tracking-tighter uppercase">
                                Showcase Your <br />
                                <span className="text-blue-600 italic">Work.</span>
                            </h1>
                            <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-medium">
                                Already have a resume on <span className="font-bold text-gray-900 underline decoration-blue-500 underline-offset-4">LetsMakeCV</span>? Share it with recruiters using your unique PreviewCV link. Same login, seamless experience.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link href="/candidate/signup" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 uppercase tracking-tighter">Get Started</Link>
                                <Link href="/jobs" className="px-10 py-5 bg-white border border-gray-200 text-gray-900 font-black rounded-2xl hover:border-gray-900 transition-all uppercase tracking-tighter">Explore Opportunities</Link>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-[60px] blur-3xl opacity-50 -z-10 animate-pulse" />
                            <div className="bg-white border border-gray-100 rounded-[56px] p-10 shadow-2xl relative overflow-hidden group">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <DocumentTextIcon />
                                    </div>
                                    <div>
                                        <div className="h-4 w-32 bg-gray-100 rounded-full mb-2" />
                                        <div className="h-3 w-48 bg-gray-50 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-4 mb-12">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-2 w-full bg-gray-50 rounded-full" />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="h-10 w-32 border border-gray-100 rounded-xl" />
                                    <div className="h-10 w-10 bg-blue-600 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Trending Opportunities Teaser */}
            <section className="py-32 bg-gray-50/50 border-y border-gray-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-4 italic uppercase">Trending Opportunities</h2>
                            <p className="text-gray-500 font-medium max-w-xl text-lg">Verified roles from high-growth companies. Connect your profile to get matched instantly.</p>
                        </div>
                        <Link href="/jobs" className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-black rounded-2xl hover:border-gray-900 transition-all shadow-sm uppercase tracking-tight">Explore All Jobs</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Senior React Developer", company: "TechCorp", loc: "Remote", type: "Full-time", salary: "$120k - $160k" },
                            { title: "UI/UX Designer", company: "Creative Boutique", loc: "SF / Hybrid", type: "Contract", salary: "$90k - $130k" },
                            { title: "Lead Frontend Engineer", company: "InnovateAI", loc: "New York", type: "Full-time", salary: "$150k - $200k" }
                        ].map((job, i) => (
                            <div key={i} className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                                    <SparklesIcon />
                                </div>
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{job.type}</span>
                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{job.loc}</span>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h4>
                                <p className="text-gray-500 font-black mb-8 uppercase text-[10px] tracking-[0.2em]">{job.company}</p>

                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="relative">
                                        <span className="text-sm font-black text-gray-100 blur-[5px] select-none">{job.salary}</span>
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter cursor-help whitespace-nowrap">Sign in to unlock</span>
                                        </div>
                                    </div>
                                    <Link href="/candidate/login" className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold hover:bg-blue-600 transition-colors">→</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition Grid */}
            <section className="py-32 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">Why Candidates <span className="italic text-blue-600">Love Us</span></h2>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">Everything you need to stand out in your job search</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Value 1 */}
                        <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-[40px] border border-blue-100 hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Share Anywhere</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-6">Add your PreviewCV link to email signatures, LinkedIn profiles, job applications, and networking messages. One link works everywhere.</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white border border-blue-100 text-blue-700 text-xs font-black rounded-lg uppercase">Email</span>
                                <span className="px-3 py-1 bg-white border border-blue-100 text-blue-700 text-xs font-black rounded-lg uppercase">LinkedIn</span>
                                <span className="px-3 py-1 bg-white border border-blue-100 text-blue-700 text-xs font-black rounded-lg uppercase">Portfolio</span>
                            </div>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-10 rounded-[40px] border border-indigo-100 hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Always Current</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-6">Update your resume once on LetsMakeCV and your PreviewCV link reflects changes instantly. No more sending updated versions to everyone.</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="uppercase tracking-tight">Real-time sync</span>
                            </div>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-[40px] border border-blue-100 hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Track Engagement</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-6">See who viewed your resume, when they viewed it, and how long they spent. Understand recruiter interest and follow up strategically.</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="uppercase tracking-tight">View analytics</span>
                            </div>
                        </div>

                        {/* Value 4 */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-10 rounded-[40px] border border-indigo-100 hover:shadow-xl transition-all">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Professional Presentation</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-6">Beautiful, mobile-optimized viewing experience. Your resume looks perfect on any device, making a great first impression every time.</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="uppercase tracking-tight">Mobile-ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PDF vs PreviewCV Comparison */}
            <section className="py-32 bg-gray-50 border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">PDF vs <span className="italic text-blue-600">PreviewCV</span></h2>
                        <p className="text-xl text-gray-500 font-medium">See why thousands are making the switch</p>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-xl">
                        <div className="grid grid-cols-3 gap-px bg-gray-100">
                            {/* Header */}
                            <div className="bg-white p-6"></div>
                            <div className="bg-gray-50 p-6 text-center">
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">PDF Attachment</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
                                <p className="text-sm font-black text-blue-600 uppercase tracking-widest">PreviewCV Link</p>
                            </div>

                            {/* Row 1 */}
                            <div className="bg-white p-6">
                                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">Easy to Share</p>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">✅</span>
                            </div>

                            {/* Row 2 */}
                            <div className="bg-white p-6">
                                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">Auto-Updates</p>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">✅</span>
                            </div>

                            {/* Row 3 */}
                            <div className="bg-white p-6">
                                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">Track Views</p>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">✅</span>
                            </div>

                            {/* Row 4 */}
                            <div className="bg-white p-6">
                                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">Mobile Optimized</p>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">✅</span>
                            </div>

                            {/* Row 5 */}
                            <div className="bg-white p-6">
                                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">Professional Look</p>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">✅</span>
                            </div>

                            {/* Row 6 */}
                            <div className="bg-white p-6">
                                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">No Downloads</p>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div className="bg-white p-6 text-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/candidate/login" className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 uppercase tracking-tight">
                            Make the Switch Today →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-32 bg-white border-b border-gray-100 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
                    <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">Two Platforms, One Login</div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tighter uppercase">Create on <span className="italic">LetsMakeCV</span>, Share on <span className="italic">PreviewCV</span></h2>
                    <p className="text-gray-500 text-lg font-medium mb-12">Build your professional resume on LetsMakeCV, then instantly share it with recruiters using your PreviewCV link. One account works on both platforms.</p>
                    <Link href="https://letsmakecv.com" target="_blank" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 uppercase tracking-tighter">Create Resume on LetsMakeCV →</Link>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-[120px]" />
            </section>
        </div>
    );
}
