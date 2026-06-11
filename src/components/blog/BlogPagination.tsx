import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Server-rendered pagination for blog collection pages. Emits plain `<a href="?page=N">`
 * links (no client JS) so paginated category/tag pages are fully crawlable.
 */
export default function BlogPagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);

  const items: (number | "ellipsis")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      items.push(p);
    } else if (p === page - 2 || p === page + 2) {
      items.push("ellipsis");
    }
  }

  const arrowBase =
    "p-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors";

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-12"
      aria-label="Blog pagination"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={`${arrowBase} hover:bg-gray-50 dark:hover:bg-gray-800`}
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      ) : (
        <span className={`${arrowBase} opacity-50 cursor-not-allowed`}>
          <ChevronLeft className="w-5 h-5" />
        </span>
      )}

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e${i}`} className="px-2 text-gray-400 dark:text-gray-600">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === page ? "page" : undefined}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              item === page
                ? "bg-primary-blue text-white"
                : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          rel="next"
          aria-label="Next page"
          className={`${arrowBase} hover:bg-gray-50 dark:hover:bg-gray-800`}
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      ) : (
        <span className={`${arrowBase} opacity-50 cursor-not-allowed`}>
          <ChevronRight className="w-5 h-5" />
        </span>
      )}
    </nav>
  );
}
