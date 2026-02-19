import React, { useState, useEffect, useRef } from "react";
import { GraphQLClient } from "@/services/graphqlClient";
import { GET_INDUSTRIES } from "@/services/graphqlQueries";
import { Industry, GetIndustriesResponse } from "@/types/masters";
import Input from "@/components/ui/Input";

interface IndustrySearchProps {
    industry: string;
    onChange: (value: Industry | null) => void;
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

function IndustrySearch({
    industry,
    onChange,
    placeholder = "Select Industry...",
    label,
    error,
    renderInput,
}: IndustrySearchProps) {
    const [search, setSearch] = useState(industry || "");
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [filteredIndustries, setFilteredIndustries] = useState<Industry[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local state with prop changes
    useEffect(() => {
        if (industry !== search) {
            setSearch(industry || "");
        }
    }, [industry]);

    // Fetch all industries on mount
    useEffect(() => {
        fetchIndustries();
    }, []);

    // Filter industries based on search term locally since GET_INDUSTRIES gets all
    useEffect(() => {
        if (search) {
            const filtered = industries.filter(ind =>
                ind.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredIndustries(filtered);
        } else {
            setFilteredIndustries(industries);
        }
    }, [search, industries]);

    const fetchIndustries = async () => {
        setLoading(true);
        try {
            const data = await GraphQLClient.query<GetIndustriesResponse>({
                query: GET_INDUSTRIES,
                variables: {
                    activeOnly: true
                },
                clientName: "masters",
                fetchPolicy: "cache-first",
            });

            setIndustries(data.industries || []);
            setFilteredIndustries(data.industries || []);
        } catch (error) {
            console.error("Error fetching industries:", error);
            setIndustries([]);
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

    const handleSelect = (selectedIndustry: Industry) => {
        setSearch(selectedIndustry.name);
        onChange(selectedIndustry);
        setIsFocused(false);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsFocused(false);
        }, 150);
    };

    const handleIndustrySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearch(newValue);

        if (!newValue) {
            onChange(null);
        } else {
            // If user types something that's not selected from list, we can pass it as a custom value
            // or we might want to enforce selection. 
            // For now, mirroring CitySearch behavior which allows typing
            onChange({
                id: 0,
                name: newValue,
                category: "",
                description: "",
                isActive: true,
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isFocused || filteredIndustries.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < filteredIndustries.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : filteredIndustries.length - 1
            );
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(filteredIndustries[activeIndex]);
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

    const shouldShowSuggestions = isFocused && filteredIndustries.length > 0;

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                {renderInput ? (
                    renderInput({
                        value: search || "",
                        onChange: handleIndustrySearch,
                        onFocus: () => setIsFocused(true),
                        onBlur: handleInputBlur,
                        onKeyDown: handleKeyDown,
                    })
                ) : (
                    <Input
                        label={label}
                        placeholder={placeholder}
                        value={search || ""}
                        onChange={handleIndustrySearch}
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
                        {filteredIndustries.map((ind, index) => (
                            <li
                                key={ind.id}
                                ref={(el: HTMLLIElement | null) => {
                                    listItemsRef.current[index] = el;
                                }}
                                className={`px-4 py-3 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-b-0 ${index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                                    }`}
                                onClick={() => handleSelect(ind)}
                            >
                                <div className="font-medium text-gray-900">{ind.name}</div>
                                {ind.category && <div className="text-xs text-gray-500">{ind.category}</div>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isFocused && search && !loading && filteredIndustries.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <div className="px-4 py-3 text-gray-500 text-sm">No industries found.</div>
                </div>
            )}
        </div>
    );
}

export default IndustrySearch;
