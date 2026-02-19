import React, { useState, useEffect, useRef } from "react";
import { GraphQLClient } from "@/services/graphqlClient";
import { SEARCH_SKILLS } from "@/services/graphqlQueries";
import { Skill, SearchSkillsResponse } from "@/types/masters";
import Input from "@/components/ui/Input";

interface SkillSearchProps {
    skill: string;
    onChange: (value: Skill | null) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    categoryId?: number;
    renderInput?: (props: {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onFocus: () => void;
        onBlur: () => void;
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    }) => React.ReactNode;
}

function SkillSearch({
    skill,
    onChange,
    placeholder = "Search Skills...",
    label,
    error,
    categoryId,
    renderInput,
}: SkillSearchProps) {
    const [search, setSearch] = useState(skill || "");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local state with prop changes
    useEffect(() => {
        if (skill !== search) {
            setSearch(skill || "");
        }
    }, [skill]);

    // Debounce input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch skills on debounced value change
    useEffect(() => {
        if (debouncedSearch && debouncedSearch.trim()) {
            fetchSkills(debouncedSearch);
        } else {
            setSkills([]);
        }
    }, [debouncedSearch, categoryId]);

    const fetchSkills = async (searchTerm: string) => {
        setLoading(true);
        try {
            const data = await GraphQLClient.query<SearchSkillsResponse>({
                query: SEARCH_SKILLS,
                variables: {
                    searchTerm,
                    categoryId
                },
                clientName: "masters",
                fetchPolicy: "no-cache",
            });

            setSkills(data.searchSkills || []);
        } catch (error) {
            console.error("Error fetching skills:", error);
            setSkills([]);
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

    const handleSelect = (selectedSkill: Skill) => {
        setSearch(selectedSkill.skillName);
        onChange(selectedSkill);
        setIsFocused(false);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsFocused(false);
        }, 150);
    };

    const handleSkillSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearch(newValue);

        if (!newValue) {
            onChange(null);
        } else {
            // Allows free text entry along with suggestions
            onChange({
                id: 0,
                skillName: newValue,
                isTechnical: false,

                categoryId: 0
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isFocused || skills.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < skills.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : skills.length - 1
            );
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(skills[activeIndex]);
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

    const shouldShowSuggestions = isFocused && search && skills.length > 0;

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                {renderInput ? (
                    renderInput({
                        value: search || "",
                        onChange: handleSkillSearch,
                        onFocus: () => setIsFocused(true),
                        onBlur: handleInputBlur,
                        onKeyDown: handleKeyDown,
                    })
                ) : (
                    <Input
                        label={label}
                        placeholder={placeholder}
                        value={search || ""}
                        onChange={handleSkillSearch}
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
                        {skills.map((skillItem, index) => (
                            <li
                                key={skillItem.id}
                                ref={(el) => {
                                    listItemsRef.current[index] = el;
                                }}
                                className={`px-4 py-3 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-b-0 ${index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                                    }`}
                                onClick={() => handleSelect(skillItem)}
                            >
                                <div className="font-medium text-gray-900">{skillItem.skillName}</div>

                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isFocused && search && !loading && skills.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg">
                    <div className="px-4 py-3 text-gray-500 text-sm">No skills found.</div>
                </div>
            )}
        </div>
    );
}

export default SkillSearch;
