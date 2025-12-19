import Image from "next/image";
import Link from 'next/link';
import config from "@/config";

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
            <Link href="/recruiter/login" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm">Recruiter Login</Link>
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
              <span className="text-2xl">👤</span>
              I&apos;m a Job Seeker
            </Link>
            <Link
              href="/recruiter"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-2xl">💼</span>
              I&apos;m a Recruiter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-6">🔒</div>
              <h3 className="text-xl font-bold mb-4">Secure Sharing</h3>
              <p className="text-gray-600">Encrypted token-based access ensures only the right eyes see your professional profile.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-6">⚡</div>
              <h3 className="text-xl font-bold mb-4">Live Preview</h3>
              <p className="text-gray-600">Proprietary PDF rendering engine for a seamless, fast viewing experience on any device.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-2xl mb-6">🎯</div>
              <h3 className="text-xl font-bold mb-4">Smart Matching</h3>
              <p className="text-gray-600">Integrated with letsmakecv.com to match candidates with their dream jobs instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm">© 2025 {config.app.name}. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-gray-100 mt-10">
          <Link href="/resume/view/test-token" className="text-sm font-bold text-blue-600 hover:underline">
            View Sample Live Resume Profile →
          </Link>
        </div>
      </footer>
    </div>
  );
}
