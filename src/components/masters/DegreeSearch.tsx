import React, { useState, useEffect, useRef } from "react";
import { GraphQLClient } from "@/services/graphqlClient";
import { GET_SEARCH_FIELD_OF_STUDY } from "@/services/graphqlQueries";
import { FieldOfStudy, SearchFieldsOfStudyResponse } from "@/types/masters";
import Input from "@/components/ui/Input";

interface DegreeSearchProps {
    degree: string;
    onChange: (value: FieldOfStudy | null) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    renderInput?: (props: {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onFocus: () => void;
        onBlur: () => void;
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    }) => React.ReactNode;
}

function DegreeSearch({
    degree,
    onChange,
    placeholder = "Search Degrees...",
    label,
    error,
    renderInput,
}: DegreeSearchProps) {
    const [search, setSearch] = useState(degree || "");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [degrees, setDegrees] = useState<FieldOfStudy[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local state with prop changes
    useEffect(() => {
        if (degree !== search) {
            setSearch(degree || "");
        }
    }, [degree]);

    // Debounce input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch degrees on debounced value change
    useEffect(() => {
        if (debouncedSearch && debouncedSearch.trim()) {
            fetchDegrees(debouncedSearch);
        } else {
            setDegrees([]);
        }
    }, [debouncedSearch]);

    const fetchDegrees = async (searchTerm: string) => {
        setLoading(true);
        try {
            const data = await GraphQLClient.query<SearchFieldsOfStudyResponse>({
                query: GET_SEARCH_FIELD_OF_STUDY,
                variables: {
                    searchTerm
                },
                clientName: "masters",
                fetchPolicy: "no-cache",
            });

            setDegrees(data.searchFieldsOfStudy || []);
        } catch (error) {
            console.error("Error fetching degrees:", error);
            setDegrees([]);
        } finally {
            setLoading(false);
        }
    };

    // Click outside to blur
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsFocused(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (selectedDegree: FieldOfStudy) => {
        setSearch(selectedDegree.name);
        onChange(selectedDegree);
        setIsFocused(false);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsFocused(false);
        }, 150);
    };

    const handleDegreeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearch(newValue);

        if (!newValue) {
            onChange(null);
        } else {
            onChange({
                id: 0,
                name: newValue,
                category: "",
                description: ""
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isFocused || degrees.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < degrees.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : degrees.length - 1
            );
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(degrees[activeIndex]);
        } else if (e.key === "Escape") {
            setIsFocused(false);
        }
    };

    // Reset active index when search changes
    useEffect(() => {
        setActiveIndex(-1);
    }, [search]);

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listItemsRef.current[activeIndex]) {
            listItemsRef.current[activeIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [activeIndex]);

    const shouldShowSuggestions = isFocused && search && degrees.length > 0;

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                {renderInput ? (
                    renderInput({
                        value: search || "",
                        onChange: handleDegreeSearch,
                        onFocus: () => setIsFocused(true),
                        onBlur: handleInputBlur,
                        onKeyDown: handleKeyDown,
                    })
                ) : (
                    <Input
                        label={label}
                        placeholder={placeholder}
                        value={search || ""}
                        onChange={handleDegreeSearch}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        error={error}
                    />
                )}

                {loading && !renderInput && (
                    <div className="absolute right-4 top-[50%] translate-y-[-50%] z-20">
                        <svg
                            className="animate-spin h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {shouldShowSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100">
                    <ul>
                        {degrees.map((degreeItem, index) => (
                            <li
                                key={degreeItem.id}
                                ref={(el: HTMLLIElement | null) => {
                                    listItemsRef.current[index] = el;
                                }}
                                className={`px-4 py-3 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-b-0 ${index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                                    }`}
                                onClick={() => handleSelect(degreeItem)}
                            >
                                <div className="font-medium text-gray-900">{degreeItem.name}</div>
                                {degreeItem.category && <div className="text-xs text-gray-500">{degreeItem.category}</div>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isFocused && search && !loading && degrees.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <div className="px-4 py-3 text-gray-500 text-sm">No degrees found.</div>
                </div>
            )}
        </div>
    );
}

export default DegreeSearch;
