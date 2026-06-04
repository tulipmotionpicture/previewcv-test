import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { Search } from "lucide-react";

interface SearchSuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Pool of suggestion strings (e.g. derived from loaded data). */
  suggestions: string[];
  placeholder?: string;
  /** Max number of suggestions to show (default 8). */
  maxSuggestions?: number;
  className?: string;
}

/**
 * Lightweight autocomplete: filters a local string list as the user types and
 * shows a suggestions dropdown with keyboard navigation, click-outside-to-close,
 * and matched-substring highlighting. Selecting an item calls `onChange`.
 */
export default function SearchSuggestInput({
  value,
  onChange,
  suggestions,
  placeholder,
  maxSuggestions = 8,
  className = "",
}: SearchSuggestInputProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Unique, case-insensitive matches excluding the exact current value.
  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of suggestions) {
      if (!s) continue;
      const low = s.toLowerCase();
      if (low === q) continue;
      if (!low.includes(q)) continue;
      if (seen.has(low)) continue;
      seen.add(low);
      out.push(s);
      if (out.length >= maxSuggestions) break;
    }
    return out;
  }, [value, suggestions, maxSuggestions]);

  // Close on outside click.
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Keep the active item in view.
  useEffect(() => {
    if (activeIndex >= 0) {
      itemsRef.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const showDropdown = open && matches.length > 0;

  const select = (s: string) => {
    onChange(s);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((p) => (p < matches.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((p) => (p > 0 ? p - 1 : matches.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(matches[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const highlight = (text: string) => {
    const q = value.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (q === "" || idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-semibold text-primary-blue dark:text-blue-400">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        className={
          className ||
          "w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-[#E1E8F1] dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 dark:text-gray-200"
        }
      />
      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full left-0 w-full mt-1 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar py-1"
        >
          {matches.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === activeIndex}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-4 py-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                i === activeIndex
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/60"
              }`}
            >
              {highlight(s)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
