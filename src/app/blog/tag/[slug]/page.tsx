import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import config from "@/config";
import { BlogPostsResponse } from "@/types";
import BlogCollection from "@/components/blog/BlogCollection";

const PAGE_SIZE = 12;

/** "remote-work" -> "Remote Work" — fallback when no post exposes the tag's display name. */
function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getTagPosts(
  slug: string,
  page: number,
): Promise<BlogPostsResponse | null> {
  try {
    return await api.getBlogPosts({ tags: slug, page, limit: PAGE_SIZE });
  } catch {
    return null;
  }
}

/** Prefer the real tag name from a returned post; fall back to the humanized slug. */
function resolveTagName(slug: string, posts: BlogPostsResponse | null): string {
  for (const post of posts?.posts ?? []) {
    const match = post.tags?.find((t) => t.slug === slug);
    if (match) return match.name;
  }
  return humanizeSlug(slug);
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
  const data = await getTagPosts(slug, page);
  const name = resolveTagName(slug, data);

  const pageSuffix = page > 1 ? ` — Page ${page}` : "";
  const title = `${name} Articles${pageSuffix} | PreviewCV Blog`;
  const description = `Browse articles tagged ${name} on the PreviewCV blog.`;
  const canonical = config.app.siteUrl
    ? `${config.app.siteUrl}/blog/tag/${slug}${page > 1 ? `?page=${page}` : ""}`
    : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title, description, type: "website" },
  };
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);
  const data = await getTagPosts(slug, page);

  // A tag with no published articles shouldn't be an indexable page.
  if (!data || data.posts.length === 0) {
    notFound();
  }

  return (
    <BlogCollection
      eyebrow="Tag"
      title={resolveTagName(slug, data)}
      posts={data.posts}
      pagination={{
        page: data.page ?? page,
        totalPages: data.total_pages ?? 1,
        basePath: `/blog/tag/${slug}`,
      }}
    />
  );
}
