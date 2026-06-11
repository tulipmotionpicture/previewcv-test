import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import config from "@/config";
import { BlogPost } from "@/types";
import BlogCollection from "@/components/blog/BlogCollection";

/** "remote-work" -> "Remote Work" — fallback when no post exposes the tag's display name. */
function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getTagPosts(slug: string): Promise<BlogPost[]> {
  try {
    const res = await api.getBlogPosts({ tags: slug, limit: 24 });
    return res.posts || [];
  } catch {
    return [];
  }
}

/** Prefer the real tag name from a returned post; fall back to the humanized slug. */
function resolveTagName(slug: string, posts: BlogPost[]): string {
  for (const post of posts) {
    const match = post.tags?.find((t) => t.slug === slug);
    if (match) return match.name;
  }
  return humanizeSlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getTagPosts(slug);
  const name = resolveTagName(slug, posts);

  const title = `${name} Articles | PreviewCV Blog`;
  const description = `Browse articles tagged ${name} on the PreviewCV blog.`;

  return {
    title,
    description,
    alternates: config.app.siteUrl
      ? { canonical: `${config.app.siteUrl}/blog/tag/${slug}` }
      : undefined,
    openGraph: { title, description, type: "website" },
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getTagPosts(slug);

  // A tag with no published articles shouldn't be an indexable page.
  if (posts.length === 0) {
    notFound();
  }

  return (
    <BlogCollection
      eyebrow="Tag"
      title={resolveTagName(slug, posts)}
      posts={posts}
    />
  );
}
