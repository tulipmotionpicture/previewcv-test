'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    const pathname = usePathname();

    // Auto-generate breadcrumbs from pathname if items not provided
    const breadcrumbItems = items || generateBreadcrumbs(pathname);

    return (
        <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;

                return (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="w-4 h-4 text-gray-400 mx-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                        {isLast || !item.href ? (
                            <span className="font-bold text-gray-900">{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
        currentPath += `/${path}`;
        const label = formatLabel(path);
        
        // Don't add href for the last item (current page)
        if (index === paths.length - 1) {
            breadcrumbs.push({ label });
        } else {
            breadcrumbs.push({ label, href: currentPath });
        }
    });

    return breadcrumbs;
}

function formatLabel(path: string): string {
    // Convert kebab-case and snake_case to Title Case
    return path
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

