"use client";

import { useEffect } from "react";
import { Share2 } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Client-only interactive bits for a blog article: records a view on mount and renders the
 * Share button. Split out so the article page itself can stay a Server Component (for SEO
 * metadata + JSON-LD).
 */
export default function BlogPostInteractions({
  slug,
  title,
  excerpt,
}: {
  slug: string;
  title: string;
  excerpt: string;
}) {
  useEffect(() => {
    // Fire-and-forget — view tracking must never break the page.
    api.recordBlogPostView(slug).catch(() => {});
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={handleShare}
      className="ml-auto flex items-center gap-2 text-primary-blue hover:text-blue-700"
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>
  );
}
