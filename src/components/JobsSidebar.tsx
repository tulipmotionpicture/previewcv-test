import React from "react";

const recruiters = [
  { name: "EMAAR", logo: "/images/emaar.png" },
  { name: "DAMAC", logo: "/images/damac.png" },
  { name: "Careem", logo: "/images/careem.png" },
  { name: "Talabat", logo: "/images/talabat.png" },
  { name: "Noon", logo: "/images/noon.png" },
  { name: "Aramex", logo: "/images/aramex.png" },
];

export default function JobsSidebar() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-900">
          Top Hiring Partners
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {recruiters.map((rec, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <img
                src={rec.logo}
                alt={rec.name}
                className="h-10 w-10 object-contain mb-2"
              />
              <span className="text-xs font-medium text-gray-700">
                {rec.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue-100 rounded-2xl p-6 text-center flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-lg text-blue-900">Post a Job</h3>
        <p className="text-sm text-blue-900 mb-4">
          Reach our pool of verified specialists directly. Zero agency
          commission.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </div>
  );
}
