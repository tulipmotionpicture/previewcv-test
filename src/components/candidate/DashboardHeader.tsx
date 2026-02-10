"use client";

import { Search, FileText, Bookmark, List } from "lucide-react";

interface DashboardHeaderProps {
    applicationCount: number;
}

export default function DashboardHeader({ applicationCount }: DashboardHeaderProps) {
    const stats = [
        {
            icon: <List className="w-6 h-6 text-gray-500 dark:text-gray-400" />,
            count: applicationCount,
            label: "Total Resume",
        },
        {
            icon: <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />,
            count: applicationCount,
            label: "Total Resume",
        },
        {
            icon: <Bookmark className="w-6 h-6 text-gray-500 dark:text-gray-400" />,
            count: applicationCount,
            label: "Total Resume",
        },
    ];

    return (
        <header
            className="relative px-12 py-12 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/candidateDashboardbg.png)' }}
        >
            {/* Optional overlay for better text readability */}

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.count}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
