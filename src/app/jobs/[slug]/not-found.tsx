import Link from 'next/link';

export default function JobNotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-500 mb-8">The job you are looking for could not be found.</p>
            <Link href="/jobs" className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all">
                Browse All Jobs
            </Link>
        </div>
    );
}

