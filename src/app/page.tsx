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
            Share Your Resume <br />
            with a <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Single Link.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop sending PDF attachments. Create your resume on LetsMakeCV, then share it instantly with recruiters using a live PreviewCV link.
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

      {/* How It Works Section */}
      <section className="py-32 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">Simple Process</div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">How It <span className="italic text-blue-600">Works</span></h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Get started in minutes with our seamless workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200" />

            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative z-10">
                <div className="absolute -top-6 left-10 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">1</div>
                <div className="mt-8 mb-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 text-center uppercase tracking-tight">Create Resume</h3>
                <p className="text-gray-500 text-center font-medium leading-relaxed">Build your professional resume on <span className="font-bold text-gray-900">LetsMakeCV.com</span> with our easy-to-use builder</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative z-10">
                <div className="absolute -top-6 left-10 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">2</div>
                <div className="mt-8 mb-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 text-center uppercase tracking-tight">Get Your Link</h3>
                <p className="text-gray-500 text-center font-medium leading-relaxed">Receive your unique <span className="font-bold text-gray-900">PreviewCV link</span> automatically - same login on both platforms</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative z-10">
                <div className="absolute -top-6 left-10 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">3</div>
                <div className="mt-8 mb-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 text-center uppercase tracking-tight">Share & Track</h3>
                <p className="text-gray-500 text-center font-medium leading-relaxed">Share your link anywhere - email, LinkedIn, applications. Updates automatically when you edit</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/candidate" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-tight">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Expanded Benefits Section */}
      <section className="py-32 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">Why <span className="italic text-indigo-600">PreviewCV?</span></h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">The modern way to share your professional profile</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 hover:border-blue-200 transition-all">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">No More PDFs</h4>
              <p className="text-gray-600 font-medium leading-relaxed">Stop attaching bulky PDF files. Share a clean, professional link instead.</p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 hover:border-indigo-200 transition-all">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Always Up-to-Date</h4>
              <p className="text-gray-600 font-medium leading-relaxed">Edit your resume once on LetsMakeCV - your PreviewCV link updates automatically.</p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 hover:border-blue-200 transition-all">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Track Views</h4>
              <p className="text-gray-600 font-medium leading-relaxed">See who&apos;s viewing your resume and when they&apos;re engaging with your profile.</p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 hover:border-indigo-200 transition-all">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Mobile Optimized</h4>
              <p className="text-gray-600 font-medium leading-relaxed">Perfect viewing experience on any device - desktop, tablet, or mobile.</p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 hover:border-blue-200 transition-all">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                <LockClosedIcon />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Secure & Private</h4>
              <p className="text-gray-600 font-medium leading-relaxed">Your data is encrypted and secure. Control who sees your information.</p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 hover:border-indigo-200 transition-all">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6">
                <LightningBoltIcon />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Instant Loading</h4>
              <p className="text-gray-600 font-medium leading-relaxed">Lightning-fast preview with our optimized rendering engine. No downloads needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-100 mb-8">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />
              </div>
              <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Trusted by Professionals</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase">Join Thousands of <span className="italic text-blue-600">Happy Users</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 font-medium mb-6 leading-relaxed">&quot;PreviewCV made sharing my resume so much easier. No more worrying about outdated PDFs!&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600" />
                <div>
                  <p className="font-black text-gray-900 text-sm uppercase tracking-tight">Sarah Chen</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 font-medium mb-6 leading-relaxed">&quot;As a recruiter, I love how quickly I can view candidate profiles. Game changer!&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600" />
                <div>
                  <p className="font-black text-gray-900 text-sm uppercase tracking-tight">Michael Torres</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Talent Acquisition Lead</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 font-medium mb-6 leading-relaxed">&quot;The integration with LetsMakeCV is seamless. One account, two powerful tools!&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
                <div>
                  <p className="font-black text-gray-900 text-sm uppercase tracking-tight">Priya Patel</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">UX Designer</p>
                </div>
              </div>
            </div>
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

      {/* FAQ Section */}
      <section className="py-32 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">Got Questions?</div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">Frequently Asked <span className="italic text-indigo-600">Questions</span></h2>
            <p className="text-xl text-gray-500 font-medium">Everything you need to know about PreviewCV</p>
          </div>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <details className="group bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Is PreviewCV free to use?</h3>
                <svg className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8">
                <p className="text-gray-600 font-medium leading-relaxed">Yes! PreviewCV is completely free for candidates. Create your resume on LetsMakeCV and share your PreviewCV link at no cost. Recruiters can access basic features for free as well.</p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Do I need a LetsMakeCV account?</h3>
                <svg className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8">
                <p className="text-gray-600 font-medium leading-relaxed">Yes, you&apos;ll need to create your resume on LetsMakeCV.com first. Once you have a LetsMakeCV account, you automatically get a PreviewCV link. Both platforms use the same login credentials for seamless access.</p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">How do I get my PreviewCV link?</h3>
                <svg className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8">
                <p className="text-gray-600 font-medium leading-relaxed">After creating your resume on LetsMakeCV, your unique PreviewCV link is generated automatically. You can find it in your candidate dashboard and share it anywhere - email, LinkedIn, job applications, or your portfolio.</p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">What happens when I update my resume?</h3>
                <svg className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8">
                <p className="text-gray-600 font-medium leading-relaxed">Your PreviewCV link updates automatically whenever you edit your resume on LetsMakeCV. No need to send new files - everyone who has your link will always see the latest version.</p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Is my data secure?</h3>
                <svg className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8">
                <p className="text-gray-600 font-medium leading-relaxed">Absolutely. We use industry-standard encryption and secure token-based access. Your resume is only accessible via your unique link, and you maintain full control over your data at all times.</p>
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Can I track who views my resume?</h3>
                <svg className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8">
                <p className="text-gray-600 font-medium leading-relaxed">Yes! You can see analytics on who&apos;s viewing your resume, when they viewed it, and how long they spent on your profile. This helps you understand recruiter engagement and follow up effectively.</p>
              </div>
            </details>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500 font-medium mb-6">Still have questions?</p>
            <Link href="/candidate" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-lg uppercase tracking-tight">
              Get Started Now →
            </Link>
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
