import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import config from "@/config";
import { BlogCategory, BlogPostsResponse } from "@/types";
import BlogCollection from "@/components/blog/BlogCollection";

const PAGE_SIZE = 12;

/** Find a category by slug. The categories endpoint returns a bare array (not { categories }). */
async function getCategory(slug: string): Promise<BlogCategory | null> {
  try {
    const res = (await api.getBlogCategories()) as unknown;
    const list: BlogCategory[] = Array.isArray(res)
      ? (res as BlogCategory[])
      : ((res as { categories?: BlogCategory[] })?.categories ?? []);
    return list.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

async function getCategoryPosts(
  slug: string,
  page: number,
): Promise<BlogPostsResponse | null> {
  try {
    return await api.getBlogPostsByCategory(slug, { page, limit: PAGE_SIZE });
  } catch {
    return null;
  }
}

function parsePage(value?: string): number {
  return Math.max(1, Number(value) || 1);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category Not Found | PreviewCV Blog" };
  }

  const pageSuffix = page > 1 ? ` — Page ${page}` : "";
  const title = `${category.name} Articles${pageSuffix} | PreviewCV Blog`;
  const description =
    category.description ||
    `Read the latest ${category.name} articles, tips, and insights on the PreviewCV blog.`;
  // Self-referencing canonical (include ?page=N on deeper pages so they aren't deindexed).
  const canonical = config.app.siteUrl
    ? `${config.app.siteUrl}/blog/category/${category.slug}${page > 1 ? `?page=${page}` : ""}`
    : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title, description, type: "website" },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);

  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }

  const data = await getCategoryPosts(slug, page);

  return (
    <BlogCollection
      eyebrow="Category"
      title={category.name}
      description={category.description}
      posts={data?.posts ?? []}
      pagination={{
        page: data?.page ?? page,
        totalPages: data?.total_pages ?? 1,
        basePath: `/blog/category/${slug}`,
      }}
    />
  );
}
