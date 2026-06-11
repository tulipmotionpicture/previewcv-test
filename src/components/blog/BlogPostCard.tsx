import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Eye, Sparkles } from "lucide-react";
import { BlogPost } from "@/types";

/**
 * Shared blog post card used across the listing, category, and tag pages so the grid looks
 * identical everywhere. Pure presentational — safe to render from Server Components.
 */
export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category Badge — placed above the title so it never covers the image */}
        {post.category?.name && (
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold text-primary-blue bg-blue-50 dark:bg-blue-900/20 rounded-full">
            {post.category.name}
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-blue dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time} min
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.view_count}
          </div>
        </div>
      </div>
    </Link>
  );
}
