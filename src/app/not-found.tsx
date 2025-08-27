/**
 * 404 Not Found Page
 * Shown when a resume link is invalid or not found
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Resume Not Found
          </h1>
          <p className="text-gray-600">
            The resume you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What can you do?
          </h2>
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Double-check the resume link URL</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Contact the person who shared the resume</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Verify the link hasn&apos;t expired</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Go to Homepage
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          <p>PreviewCV • Resume Viewer</p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Resume Not Found - PreviewCV',
  description: 'The requested resume could not be found.',
};
