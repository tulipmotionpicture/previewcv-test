import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BlogPost } from "@/types";
import FloatingHeader from "@/components/FloatingHeader";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogPagination from "@/components/blog/BlogPagination";

interface Pagination {
  page: number;
  totalPages: number;
  basePath: string;
}

const HEADER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Blog", href: "/blog" },
];
const HEADER_CTA = {
  label: "Get Started",
  href: "/candidate/signup",
  variant: "primary" as const,
};

/**
 * Server-rendered listing shell shared by the category and tag landing pages: hero with an
 * eyebrow + title + optional description, then the post grid (or an empty state).
 */
export default function BlogCollection({
  eyebrow,
  title,
  description,
  posts,
  pagination,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
  posts: BlogPost[];
  pagination?: Pagination;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <FloatingHeader links={HEADER_LINKS} cta={HEADER_CTA} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-blue-400 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-blue mb-2">
            {eyebrow}
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No articles yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for new content.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
              {pagination && (
                <BlogPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  basePath={pagination.basePath}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
