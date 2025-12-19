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
                                Connect your professional profile from <span className="font-bold text-gray-900 underline decoration-blue-500 underline-offset-4">LetsMakeCV</span> and apply to premium roles with a single click.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link href="/candidate/login" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 uppercase tracking-tighter">Get Started</Link>
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

            <section className="py-32 bg-white border-b border-gray-100 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
                    <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">Ecosystem Sync</div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tighter uppercase">Sync seamlessly with <span className="italic">LetsMakeCV</span> and take control of your career journey.</h2>
                    <p className="text-gray-500 text-lg font-medium mb-12">Millions of professionals use LetsMakeCV to design their careers. Now, PreviewCV helps you land the job.</p>
                    <Link href="#" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 uppercase tracking-tighter">Build Your Resume Now</Link>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-[120px]" />
            </section>
        </div>
    );
}
