import { Metadata } from "next";
import config from "@/config";
import { api } from "@/lib/api";
import type { BlogPost, BlogCategory } from "@/types";
import BlogListing from "./BlogListing";
import { BLOG_POSTS_PER_PAGE } from "./constants";

// ISR: cache the render in KV + revalidate every 5 min. fetchCache makes the
// server-side data fetches cacheable (they default to no-store in Next 15) so the
// page is served from cache instead of re-rendering (SSR) on every request.
export const revalidate = 300;
export const fetchCache = "default-cache";

export const metadata: Metadata = {
  title: { absolute: "Career Insights & Resources | PreviewCV Blog" },
  description:
    "Expert advice, tips, and insights to help you succeed in your career — resume writing, job search, interviews, and more.",
  alternates: config.app.siteUrl
    ? { canonical: `${config.app.siteUrl}/blog` }
    : undefined,
  openGraph: {
    title: "Career Insights & Resources | PreviewCV Blog",
    description:
      "Expert advice, tips, and insights to help you succeed in your career.",
    type: "website",
    url: config.app.siteUrl ? `${config.app.siteUrl}/blog` : undefined,
  },
};

// The unfiltered first page is fetched on the server so the article cards — and the
// links to each post — are in the initial HTML. Previously the whole list was
// client-only, so crawlers saw an empty listing with no internal links to any post.
// Each fetch degrades to an empty result independently: a failure costs the initial
// render, never the page, because the client still fetches on mount.
async function getInitialBlogData(): Promise<{
  posts: BlogPost[];
  totalPages: number;
  categories: BlogCategory[];
}> {
  const [postsResult, categoriesResult] = await Promise.allSettled([
    api.getBlogPosts({
      page: 1,
      limit: BLOG_POSTS_PER_PAGE,
      sort_by: "published_at",
      sort_order: "desc",
    }),
    api.getBlogCategories(),
  ]);

  return {
    posts:
      postsResult.status === "fulfilled" ? (postsResult.value.posts ?? []) : [],
    totalPages:
      postsResult.status === "fulfilled"
        ? (postsResult.value.total_pages ?? 1)
        : 1,
    categories:
      categoriesResult.status === "fulfilled"
        ? (categoriesResult.value.categories ?? [])
        : [],
  };
}

export default async function BlogListingPage() {
  const { posts, totalPages, categories } = await getInitialBlogData();

  return (
    <BlogListing
      initialPosts={posts}
      initialTotalPages={totalPages}
      initialCategories={categories}
    />
  );
}
