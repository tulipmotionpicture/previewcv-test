"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, List } from "lucide-react";
import type { TableOfContentsItem } from "@/types";

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  className?: string;
}

// Offset for the fixed FloatingHeader so scrolled-to headings aren't hidden under it.
const SCROLL_OFFSET = 96;

export default function TableOfContents({
  items,
  className = "",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // Scroll-spy: highlight the heading currently nearest the top of the viewport.
  useEffect(() => {
    if (!items?.length) return;

    const onScroll = () => {
      let current = "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) current = item.id;
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (!items?.length) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Table of contents"
      className={`sticky top-24 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <List className="w-5 h-5 text-primary-blue" />
          Table of Contents
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand table of contents" : "Collapse table of contents"}
          className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
        >
          {collapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {!collapsed && (
        <ul className="mt-3 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                className={[
                  "block w-full text-left text-sm rounded-md px-2 py-1.5 transition-colors",
                  item.level >= 3 ? "pl-5" : "",
                  activeId === item.id
                    ? "bg-primary-blue/10 text-primary-blue font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
