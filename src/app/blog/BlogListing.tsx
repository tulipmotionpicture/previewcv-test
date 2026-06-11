"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { BlogPost, BlogCategory } from "@/types";
import FloatingHeader from "@/components/FloatingHeader";
import BlogPostCard from "@/components/blog/BlogPostCard";
import {
  Search,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

function BlogListingContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category");
  const tagParam = searchParams?.get("tag");
  const searchQuery = searchParams?.get("q");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam,
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam);
  const [searchTerm, setSearchTerm] = useState(searchQuery || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const POSTS_PER_PAGE = 12;

  // Horizontal scroll arrows for the category tabs (shown only when there's overflow).
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollArrows = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollArrows();
    const el = tabsRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollArrows, { passive: true });
    window.addEventListener("resize", updateScrollArrows);
    return () => {
      el.removeEventListener("scroll", updateScrollArrows);
      window.removeEventListener("resize", updateScrollArrows);
    };
  }, [updateScrollArrows, categories]);

  const scrollTabs = (direction: number) => {
    tabsRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getBlogCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        if (searchTerm) {
          const response = await api.searchBlog(searchTerm, {
            page: currentPage,
            limit: POSTS_PER_PAGE,
          });
          setPosts(response.results);
          setTotalPages(Math.ceil(response.total / POSTS_PER_PAGE));
        } else if (selectedTag) {
          // Tag filtering (previously read from the URL but never applied).
          const response = await api.getBlogPosts({
            tags: selectedTag,
            page: currentPage,
            limit: POSTS_PER_PAGE,
            sort_by: "published_at",
            sort_order: "desc",
          });
          setPosts(response.posts);
          setTotalPages(response.total_pages);
        } else if (selectedCategory) {
          const response = await api.getBlogPostsByCategory(selectedCategory, {
            page: currentPage,
            limit: POSTS_PER_PAGE,
          });
          setPosts(response.posts);
          setTotalPages(response.total_pages);
        } else {
          const response = await api.getBlogPosts({
            page: currentPage,
            limit: POSTS_PER_PAGE,
            sort_by: "published_at",
            sort_order: "desc",
          });
          setPosts(response.posts);
          setTotalPages(response.total_pages);
        }
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchPosts();
  }, [currentPage, selectedCategory, selectedTag, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1);
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setSelectedTag(null);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <FloatingHeader links={HEADER_LINKS} cta={HEADER_CTA} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Career Insights &amp; Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Expert advice, tips, and insights to help you succeed in your career
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scrollTabs(-1)}
                aria-label="Scroll categories left"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
            <div
              ref={tabsRef}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
            >
              <button
                onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                !selectedCategory
                  ? "bg-primary-blue text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Articles
            </button>
            {categories
              .filter((category) => (category.post_count ?? 0) > 0)
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                    selectedCategory === category.slug
                      ? "bg-primary-blue text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scrollTabs(1)}
                aria-label="Scroll categories right"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {selectedTag && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Showing articles tagged{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                #{selectedTag}
              </span>
            </p>
          )}
          {loading || isSearching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? "bg-primary-blue text-white"
                                : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-gray-400 dark:text-gray-600"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    },
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BlogListing() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <FloatingHeader links={HEADER_LINKS} cta={HEADER_CTA} />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
          </div>
        </div>
      }
    >
      <BlogListingContent />
    </Suspense>
  );
}
