import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import config from "@/config";
import { BlogPost } from "@/types";
import FloatingHeader from "@/components/FloatingHeader";
import { buildBlogPostingJsonLd } from "@/lib/blogPostingSchema";
import BlogPostInteractions from "./BlogPostInteractions";
import {
  Calendar,
  Clock,
  Eye,
  User,
  Tag,
  ArrowLeft,
  Sparkles,
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

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await api.getBlogPostBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | PreviewCV",
      description: "The article you are looking for could not be found.",
    };
  }

  const title = post.seo_title || `${post.title} | PreviewCV Blog`;
  const description = post.seo_description || post.excerpt;
  const canonical = config.app.siteUrl
    ? `${config.app.siteUrl}/blog/${post.slug}`
    : undefined;
  const image = post.featured_image || config.app.logoUrl;

  return {
    title,
    description,
    keywords: post.seo_keywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: post.published_at,
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  let relatedPosts: BlogPost[] = [];
  try {
    const related = await api.getRelatedBlogPosts(slug, 4);
    relatedPosts = related.posts || [];
  } catch {
    relatedPosts = [];
  }

  const canonical = config.app.siteUrl
    ? `${config.app.siteUrl}/blog/${post.slug}`
    : `/blog/${post.slug}`;
  const jsonLd = buildBlogPostingJsonLd(post, canonical);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FloatingHeader links={HEADER_LINKS} cta={HEADER_CTA} />

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-blue-400 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Category */}
        {post.category?.slug && (
          <div className="mb-4">
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="inline-block px-3 py-1 text-xs font-semibold text-primary-blue bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              {post.category.name}
            </Link>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{post.author?.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{post.reading_time} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{post.view_count} views</span>
          </div>
          <BlogPostInteractions
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt}
          />
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-12">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-8 border-t border-gray-200 dark:border-gray-800">
            <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mt-12">
          <div className="flex items-start gap-4">
            {post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.full_name}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="w-10 h-10 text-primary-blue" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {post.author?.full_name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {post.author?.bio || `Written by ${post.author?.full_name}`}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 dark:bg-black py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    {relatedPost.featured_image ? (
                      <Image
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {relatedPost.view_count} views
                    </div>
                    <span>{relatedPost.reading_time} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
