import Link from "next/link";
import Image from "next/image";
import config from "@/config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Link href="/">
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={120}
              height={120}
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-12 border border-gray-100 dark:border-gray-800">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
            Job Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Sorry, the job you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Browse All Jobs
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold rounded-xl transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
