import Link from 'next/link';

export default function RecruiterNotFound() {
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

