import Image from "next/image";
import Link from 'next/link';
import config from "@/config";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .245-.2.438-.456.438l-4.544.012c-.118 0-.23-.047-.314-.131l-1.428-1.428a.434.434 0 0 0-.612 0l-1.428 1.428c-.084.084-.196.13-.314.13l-4.544-.01a.44.44 0 0 1-.456-.44v-4.25m13.125-4.5h-13.125a1.125 1.125 0 0 0-1.125 1.125v4.125c0 .621.504 1.125 1.125 1.125h13.125c.621 0 1.125-.504 1.125-1.125v-4.125c0-.621-.504-1.125-1.125-1.125Zm-3.75-1.5v-1.125c0-.621-.504-1.125-1.125-1.125H11.25c-.621 0-1.125.504-1.125 1.125V8.15" />
  </svg>
);

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const LightningBoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src={config.app.logoUrl} alt={config.app.name} width={120} height={120} className="rounded-2xl shadow-sm h-12 w-auto" />
          </div>
          <div className="flex gap-4">
            <Link href="/candidate/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Candidate Login</Link>
            <Link href="/recruiter/login" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Recruiter Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl lg:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9]">
            The World&apos;s Most <br />
            Modern <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Resume Viewer.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop sending static PDFs. Send a live, trackable link to your professional profile powered by LetsMakeCV&apos;s advanced engine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/candidate"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
            >
              <span className="text-blue-600"><UserIcon /></span>
              I&apos;m a Job Seeker
            </Link>
            <Link
              href="/recruiter"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-gray-400"><BriefcaseIcon /></span>
              I&apos;m a Recruiter
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: Marketing Pulse Teaser Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4 italic uppercase">Direct Market Pulse</h2>
            <p className="text-gray-500 font-medium">Live activity from our recruitment engine. Verified matching in progress.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Jobs Teaser */}
            <div className="bg-blue-50/50 rounded-[40px] p-8 border border-blue-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Trending Roles</h3>
                <Link href="/jobs" className="text-sm font-bold text-blue-600 hover:underline">View All Jobs →</Link>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Senior React Developer", company: "TechCorp", loc: "Remote", salary: "$120k - $160k" },
                  { title: "UI/UX Designer", company: "Creative Studio", loc: "New York", salary: "$80/hr - $100/hr" },
                  { title: "Backend Engineer", company: "FastData", loc: "Austin", salary: "$130k - $170k" }
                ].map((job, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 uppercase text-sm tracking-tight">{job.title}</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-black uppercase tracking-widest">{job.loc}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{job.company}</p>
                      <div className="relative">
                        <span className="text-sm font-black text-gray-900 blur-[4px] select-none">{job.salary}</span>
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Sign in to view</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidates Teaser */}
            <div className="bg-indigo-50/50 rounded-[40px] p-8 border border-indigo-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-indigo-900 uppercase tracking-tight">Featured Talent</h3>
                <Link href="/recruiter/login" className="text-sm font-bold text-indigo-600 hover:underline">Source Talent →</Link>
              </div>
              <div className="space-y-4">
                {[
                  { role: "Fullstack Developer", exp: "5 years", skills: ["React", "Go"], img: "/images/profile1.png" },
                  { role: "Product Designer", exp: "7 years", skills: ["Figma", "UX"], img: "/images/profile2.png" },
                  { role: "Mobile Engineer", exp: "4 years", skills: ["Swift", "Native"], img: "/images/profile3.png" }
                ].map((can, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl relative overflow-hidden border border-gray-100">
                        <Image src={can.img} alt={can.role} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="h-4 w-32 bg-gray-100 rounded-full mb-2 blur-[2px]" />
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-tight">{can.role}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {can.skills.map(s => <span key={s} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-lg border border-gray-100 font-black uppercase tracking-tighter">{s}</span>)}
                      </div>
                      <span className="text-xs font-black text-indigo-600 italic uppercase">{can.exp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <LockClosedIcon />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter leading-none">Secure Sharing</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Encrypted token-based access ensures only the right eyes see your professional profile.</p>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <LightningBoltIcon />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter leading-none">Live Preview</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Proprietary PDF rendering engine for a seamless, fast viewing experience on any device.</p>
            </div>
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <TargetIcon />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter leading-none">Smart Matching</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Integrated with letsmakecv.com to match candidates with their dream jobs instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">© 2025 {config.app.name}.</p>
          <div className="flex gap-8 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-gray-100 mt-10">
          <Link href="/resume/view/test-token" className="text-sm font-black text-blue-600 hover:underline uppercase tracking-tight">
            View Sample Live Resume Profile →
          </Link>
        </div>
      </footer>
    </div>
  );
}
