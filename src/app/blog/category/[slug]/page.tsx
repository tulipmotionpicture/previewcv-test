import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import config from "@/config";
import { BlogCategory, BlogPost } from "@/types";
import BlogCollection from "@/components/blog/BlogCollection";

async function getCategory(slug: string): Promise<BlogCategory | null> {
  try {
    const res = await api.getBlogCategories();
    return res.categories.find((c) => c.slug === slug) || null;
  } catch {
    return null;
  }
}

async function getCategoryPosts(slug: string): Promise<BlogPost[]> {
  try {
    const res = await api.getBlogPostsByCategory(slug, { limit: 24 });
    return res.posts || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category Not Found | PreviewCV Blog" };
  }

  const title = `${category.name} Articles | PreviewCV Blog`;
  const description =
    category.description ||
    `Read the latest ${category.name} articles, tips, and insights on the PreviewCV blog.`;

  return {
    title,
    description,
    alternates: config.app.siteUrl
      ? { canonical: `${config.app.siteUrl}/blog/category/${category.slug}` }
      : undefined,
    openGraph: { title, description, type: "website" },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const posts = await getCategoryPosts(slug);

  return (
    <BlogCollection
      eyebrow="Category"
      title={category.name}
      description={category.description}
      posts={posts}
    />
  );
}
