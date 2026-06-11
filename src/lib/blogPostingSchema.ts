// Builds schema.org `BlogPosting` JSON-LD for blog article pages — the blog equivalent of
// `jobPostingSchema.ts`. Improves rich-result eligibility and how the article is shown in
// Search. Emitted inside an invisible `<script type="application/ld+json">` tag.
//   https://developers.google.com/search/docs/appearance/structured-data/article

import { BlogPost } from "@/types";
import config from "@/config";

/** Drop keys whose value is undefined/null/"" / empty object, recursively. */
function stripEmpty<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => stripEmpty(v)).filter((v) => v != null) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value == null || value === "") continue;
      const cleaned = stripEmpty(value);
      if (
        cleaned &&
        typeof cleaned === "object" &&
        !Array.isArray(cleaned) &&
        Object.keys(cleaned).length === 0
      ) {
        continue;
      }
      out[key] = cleaned;
    }
    return out as T;
  }
  return obj;
}

/**
 * Build the BlogPosting JSON-LD for an article.
 * `pageUrl` should be the absolute canonical URL of the post.
 */
export function buildBlogPostingJsonLd(
  post: BlogPost,
  pageUrl: string,
): Record<string, unknown> {
  const keywords =
    post.seo_keywords ||
    (post.tags?.length ? post.tags.map((t) => t.name).join(", ") : undefined);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt,
    image: post.featured_image || config.app.logoUrl || undefined,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      "@type": "Person",
      name: post.author?.full_name,
    },
    publisher: {
      "@type": "Organization",
      name: config.app.name,
      logo: config.app.logoUrl
        ? { "@type": "ImageObject", url: config.app.logoUrl }
        : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    articleSection: post.category?.name,
    keywords,
    wordCount: post.word_count || undefined,
  };

  return stripEmpty(jsonLd);
}
