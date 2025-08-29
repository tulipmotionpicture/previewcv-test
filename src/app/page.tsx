import Image from "next/image";
import config from "@/config";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-6">
            {config.app.logoUrl ? (
              <Image
                src={config.app.logoUrl}
                alt="PreviewCV Logo"
                width={600}
                height={600}
                className="w-80 h-80 object-contain"
                priority
              />
            ) : (
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                📄 PreviewCV
              </h1>
            )}
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Secure PDF Resume Viewer
          </p>
          <p className="text-gray-500 max-w-lg mx-auto">
            Access and view shared resumes securely through permanent links. 
            This application provides a clean, professional interface for viewing PDF resumes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            How to Use
          </h2>
          <div className="text-left space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                1
              </span>
              <span>Receive a resume link from someone (format: previewcv.com/resume/view/[token])</span>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                2
              </span>
              <span>Click the link to access the resume preview page</span>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                3
              </span>
              <span>View the PDF resume directly in your browser or download it</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> If you have a resume token, add it to the URL like this:<br />
            <code className="bg-amber-100 px-2 py-1 rounded text-xs">
              /resume/view/your-token-here
            </code>
          </p>
        </div>

        <div className="text-xs text-gray-400">
          <p>Secure • Fast • Reliable</p>
        </div>
      </div>
    </div>
  );
}
