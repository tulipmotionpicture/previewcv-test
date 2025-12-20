import React from "react";

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Flexible plans for everyone
        </h1>
        <p className="text-xl text-gray-600">
          Whether you're looking for a job or looking for talent, we've got you
          covered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Seeker Plan */}
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-blue-600 mb-2 uppercase tracking-widest">
            For Seekers
          </h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-extrabold text-gray-900">$0</span>
            <span className="text-gray-500 font-medium">Free Forever</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {[
              "Unlimited Job Searches",
              "AI Recommendations",
              "Resume Sync with LetsMakeCV",
              "Application Tracking",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-gray-600 font-medium"
              >
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate("signup")}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
          >
            Start Building Profile
          </button>
        </div>

        {/* Recruiter Pro */}
        <div className="bg-white p-10 rounded-3xl border-2 border-blue-600 shadow-2xl flex flex-col relative scale-105 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Recommended
          </div>
          <h3 className="text-lg font-bold text-blue-600 mb-2 uppercase tracking-widest">
            Recruiter Pro
          </h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-extrabold text-gray-900">$199</span>
            <span className="text-gray-500 font-medium">/month</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {[
              "5 Active Job Listings",
              "100 Resume Unlocks",
              "AI Matching Engine",
              "Company Branding",
              "Email Integration",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-gray-600 font-medium"
              >
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate("signup")}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start Hiring Now
          </button>
        </div>

        {/* Enterprise */}
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-blue-600 mb-2 uppercase tracking-widest">
            Enterprise
          </h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-extrabold text-gray-900">
              Custom
            </span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {[
              "Unlimited Listings",
              "API Access",
              "Dedicated Account Manager",
              "Custom AI Fine-tuning",
              "White-labeled Portal",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-gray-600 font-medium"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate("contact")}
            className="w-full py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
