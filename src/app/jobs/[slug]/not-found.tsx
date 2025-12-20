import Link from 'next/link';

export default function JobNotFound() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
            <div className="max-w-md">
                <div className="text-6xl mb-6">💼</div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
                    Job Not Found
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    The job you are looking for could not be found or may have been removed.
                </p>
                <Link 
                    href="/jobs" 
                    className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-lg"
                >
                    Browse All Jobs
                </Link>
            </div>
        </div>
    );
}
