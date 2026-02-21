"use client";

import React, { useState } from "react";
import { X, Search, Plus } from "lucide-react";
import { IndustrySearch, SkillSearch, CompanySearch, JobSearch, DegreeSearch } from "@/components/masters";
import { Company, JobTitle, FieldOfStudy } from "@/types/masters";
import { BucketWithStats } from "@/types/api";

interface AdvancedFiltersProps {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
    buckets: BucketWithStats[];
}

export default function AdvancedFilters({
    filters,
    setFilters,
    onClose,
    onApply,
    onReset,
    buckets
}: AdvancedFiltersProps) {
    const [skillInput, setSkillInput] = useState("");
    const [jobTitleInput, setJobTitleInput] = useState("");
    const [companyInput, setCompanyInput] = useState("");
    const [excludedCompanyInput, setExcludedCompanyInput] = useState("");
    const [degreeInput, setDegreeInput] = useState("");
    const [fieldOfStudyInput, setFieldOfStudyInput] = useState("");
    const [universityInput, setUniversityInput] = useState("");
    const [certificationInput, setCertificationInput] = useState("");
    const [noticePeriodInput, setNoticePeriodInput] = useState("");
    const [languageInput, setLanguageInput] = useState("");

    const handleReset = () => {
        onReset();
        setSkillInput("");
        setJobTitleInput("");
        setCompanyInput("");
        setExcludedCompanyInput("");
        setDegreeInput("");
        setFieldOfStudyInput("");
        setUniversityInput("");
        setCertificationInput("");
        setNoticePeriodInput("");
        setLanguageInput("");
    };

    const addSkill = () => {
        if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
            setFilters((prev: any) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput("");
        }
    };
    const removeSkill = (skill: string) => setFilters((prev: any) => ({ ...prev, skills: prev.skills.filter((s: string) => s !== skill) }));

    const addJobTitle = () => {
        if (jobTitleInput.trim() && !filters.job_titles.includes(jobTitleInput.trim())) {
            setFilters((prev: any) => ({ ...prev, job_titles: [...prev.job_titles, jobTitleInput.trim()] }));
            setJobTitleInput("");
        }
    };
    const removeJobTitle = (t: string) => setFilters((prev: any) => ({ ...prev, job_titles: prev.job_titles.filter((ti: string) => ti !== t) }));

    const addCompany = () => {
        if (companyInput.trim() && !filters.companies.includes(companyInput.trim())) {
            setFilters((prev: any) => ({ ...prev, companies: [...prev.companies, companyInput.trim()] }));
            setCompanyInput("");
        }
    };
    const removeCompany = (c: string) => setFilters((prev: any) => ({ ...prev, companies: prev.companies.filter((co: string) => co !== c) }));

    const addExcludedCompany = () => {
        if (excludedCompanyInput.trim() && !filters.excluded_companies.includes(excludedCompanyInput.trim())) {
            setFilters((prev: any) => ({ ...prev, excluded_companies: [...prev.excluded_companies, excludedCompanyInput.trim()] }));
            setExcludedCompanyInput("");
        }
    };
    const removeExcludedCompany = (c: string) => setFilters((prev: any) => ({ ...prev, excluded_companies: prev.excluded_companies.filter((co: string) => co !== c) }));

    const addDegree = () => {
        if (degreeInput.trim() && !filters.degrees.includes(degreeInput.trim())) {
            setFilters((prev: any) => ({ ...prev, degrees: [...prev.degrees, degreeInput.trim()] }));
            setDegreeInput("");
        }
    };
    const removeDegree = (d: string) => setFilters((prev: any) => ({ ...prev, degrees: prev.degrees.filter((de: string) => de !== d) }));

    const addFieldOfStudy = () => {
        if (fieldOfStudyInput.trim() && !filters.fields_of_study.includes(fieldOfStudyInput.trim())) {
            setFilters((prev: any) => ({ ...prev, fields_of_study: [...prev.fields_of_study, fieldOfStudyInput.trim()] }));
            setFieldOfStudyInput("");
        }
    };
    const removeFieldOfStudy = (f: string) => setFilters((prev: any) => ({ ...prev, fields_of_study: prev.fields_of_study.filter((fi: string) => fi !== f) }));

    const addLanguage = () => {
        if (languageInput.trim() && !filters.languages.includes(languageInput.trim())) {
            setFilters((prev: any) => ({ ...prev, languages: [...prev.languages, languageInput.trim()] }));
            setLanguageInput("");
        }
    };
    const removeLanguage = (l: string) => setFilters((prev: any) => ({ ...prev, languages: prev.languages.filter((la: string) => la !== l) }));

    const addNoticePeriod = () => {
        if (noticePeriodInput.trim() && !filters.notice_period_values.includes(noticePeriodInput.trim())) {
            setFilters((prev: any) => ({ ...prev, notice_period_values: [...prev.notice_period_values, noticePeriodInput.trim()] }));
            setNoticePeriodInput("");
        }
    };
    const removeNoticePeriod = (n: string) => setFilters((prev: any) => ({ ...prev, notice_period_values: prev.notice_period_values.filter((no: string) => no !== n) }));

    // Consistent Styles
    const inputClassName = "w-full h-[42px] px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
    const buttonClassName = "h-[42px] w-[42px] p-0 flex items-center justify-center bg-primary-blue hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0";
    const redButtonClassName = "h-[42px] w-[42px] p-0 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shrink-0";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#2F4269] border-b border-gray-800 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Professional Section */}
                        <div className="space-y-6">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                                Professional & Skills
                            </h4>
                            {/* Industry */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
                                <IndustrySearch
                                    industry={filters.industry}
                                    onChange={(ind) => setFilters((prev: any) => ({ ...prev, industry: ind ? ind.name : "" }))}
                                    placeholder="Select Industry"
                                    renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                                        <input type="text" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} placeholder="Select Industry" className={inputClassName} />
                                    )}
                                />
                            </div>
                            {/* Job Titles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Titles</label>
                                <div className="flex gap-2 mb-2 items-center">
                                    <div className="flex-1">
                                        <JobSearch
                                            title={jobTitleInput}
                                            onChange={(val: JobTitle | null) => {
                                                if (val) {
                                                    if (val.id > 0) {
                                                        if (!filters.job_titles.includes(val.title)) {
                                                            setFilters((prev: any) => ({ ...prev, job_titles: [...prev.job_titles, val.title] }));
                                                            setJobTitleInput("");
                                                        }
                                                    } else { setJobTitleInput(val.title); }
                                                } else { setJobTitleInput(""); }
                                            }}
                                            placeholder="Add job title"
                                            renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                                                <input type="text" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={(e) => { onKeyDown(e); if (e.key === "Enter") addJobTitle(); }} placeholder="Add job title" className={inputClassName} />
                                            )}
                                        />
                                    </div>
                                    <button onClick={addJobTitle} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.job_titles.map((t: string) => (
                                        <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                                            {t}<button onClick={() => removeJobTitle(t)} className="hover:text-green-600"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skills</label>
                                <div className="flex gap-2 mb-2 items-center">
                                    <div className="flex-1">
                                        <SkillSearch
                                            skill={skillInput}
                                            onChange={(s) => {
                                                if (s) {
                                                    if (s.id > 0) {
                                                        if (s.skillName && !filters.skills.includes(s.skillName)) {
                                                            setFilters((prev: any) => ({ ...prev, skills: [...prev.skills, s.skillName] }));
                                                            setSkillInput("");
                                                        }
                                                    } else { setSkillInput(s.skillName); }
                                                } else { setSkillInput(""); }
                                            }}
                                            placeholder="Add skill"
                                            renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                                                <input type="text" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={(e) => { onKeyDown(e); if (e.key === "Enter") addSkill(); }} placeholder="Add skill" className={inputClassName} />
                                            )}
                                        />
                                    </div>
                                    <button onClick={addSkill} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {filters.skills.map((s: string) => (
                                        <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                            {s}<button onClick={() => removeSkill(s)} className="hover:text-primary-blue"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={filters.skills_match_all} onChange={(e) => setFilters((prev: any) => ({ ...prev, skills_match_all: e.target.checked }))} className="rounded border-gray-300 dark:border-gray-600" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Match all skills (AND)</span>
                                </label>
                            </div>
                            {/* Companies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Companies</label>
                                <div className="space-y-4">
                                    <div className="flex gap-2 mb-2 items-center">
                                        <div className="flex-1">
                                            <CompanySearch
                                                company={companyInput}
                                                onChange={(c) => {
                                                    if (c) {
                                                        if (c.id > 0) {
                                                            if (!filters.companies.includes(c.name)) {
                                                                setFilters((prev: any) => ({ ...prev, companies: [...prev.companies, c.name] }));
                                                                setCompanyInput("");
                                                            }
                                                        } else { setCompanyInput(c.name); }
                                                    } else { setCompanyInput(""); }
                                                }}
                                                placeholder="Add company"
                                                renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                                                    <input type="text" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={(e) => { onKeyDown(e); if (e.key === "Enter") addCompany(); }} placeholder="Add company" className={inputClassName} />
                                                )}
                                            />
                                        </div>
                                        <button onClick={addCompany} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.companies.map((c: string) => (
                                            <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                                                {c}<button onClick={() => removeCompany(c)} className="hover:text-purple-600"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Exclude Companies</label>
                                        <div className="flex gap-2 mb-2 items-center">
                                            <div className="flex-1">
                                                <CompanySearch
                                                    company={excludedCompanyInput}
                                                    onChange={(c) => {
                                                        if (c) {
                                                            if (c.id > 0) {
                                                                if (!filters.excluded_companies.includes(c.name)) {
                                                                    setFilters((prev: any) => ({ ...prev, excluded_companies: [...prev.excluded_companies, c.name] }));
                                                                    setExcludedCompanyInput("");
                                                                }
                                                            } else { setExcludedCompanyInput(c.name); }
                                                        } else { setExcludedCompanyInput(""); }
                                                    }}
                                                    placeholder="Exclude company"
                                                    renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                                                        <input type="text" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={(e) => { onKeyDown(e); if (e.key === "Enter") addExcludedCompany(); }} placeholder="Exclude company" className={inputClassName} />
                                                    )}
                                                />
                                            </div>
                                            <button onClick={addExcludedCompany} className={redButtonClassName}><Plus className="w-5 h-5" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filters.excluded_companies.map((c: string) => (
                                                <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                                                    {c}<button onClick={() => removeExcludedCompany(c)} className="hover:text-red-900"><X className="h-3 w-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Education & Experience Section */}
                        <div className="space-y-6">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                                Education & Experience
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Experience</label>
                                    <input type="number" min="0" value={filters.min_experience_years} onChange={(e) => setFilters((prev: any) => ({ ...prev, min_experience_years: parseInt(e.target.value) || 0 }))} className={inputClassName} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Experience</label>
                                    <input type="number" min="0" value={filters.max_experience_years} onChange={(e) => setFilters((prev: any) => ({ ...prev, max_experience_years: parseInt(e.target.value) || 0 }))} className={inputClassName} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Education Level</label>
                                <select value={filters.education_level} onChange={(e) => setFilters((prev: any) => ({ ...prev, education_level: e.target.value }))} className={inputClassName}>
                                    <option value="">Any</option>
                                    <option value="high_school">High School</option>
                                    <option value="associate">Associate</option>
                                    <option value="bachelor">Bachelor's</option>
                                    <option value="master">Master's</option>
                                    <option value="phd">PhD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Degrees</label>
                                <div className="flex gap-2 mb-2 items-center">
                                    <input type="text" value={degreeInput} onChange={(e) => setDegreeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDegree()} placeholder="Add degree" className={inputClassName} />
                                    <button onClick={addDegree} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.degrees.map((d: string) => (
                                        <span key={d} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                                            {d}<button onClick={() => removeDegree(d)} className="hover:text-yellow-600"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fields of Study</label>
                                <div className="flex gap-2 mb-2 items-center">
                                    <div className="flex-1">
                                        <DegreeSearch
                                            degree={fieldOfStudyInput}
                                            onChange={(val: FieldOfStudy | null) => {
                                                if (val) {
                                                    if (!filters.fields_of_study.includes(val.name)) {
                                                        setFilters((prev: any) => ({ ...prev, fields_of_study: [...prev.fields_of_study, val.name] }));
                                                        setFieldOfStudyInput("");
                                                    } else { setFieldOfStudyInput(""); }
                                                } else { setFieldOfStudyInput(""); }
                                            }}
                                            placeholder="Add field (e.g., CS)"
                                            renderInput={({ value, onChange, onFocus, onBlur, onKeyDown }) => (
                                                <input type="text" value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={(e) => { onKeyDown(e); if (e.key === "Enter") addFieldOfStudy(); }} placeholder="Add field (e.g., CS)" className={inputClassName} />
                                            )}
                                        />
                                    </div>
                                    <button onClick={addFieldOfStudy} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.fields_of_study.map((f: string) => (
                                        <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                                            {f}<button onClick={() => removeFieldOfStudy(f)} className="hover:text-indigo-600"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notice Period</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" checked={!!filters.under_notice_period} onChange={(e) => setFilters((prev: any) => ({ ...prev, under_notice_period: e.target.checked }))} className="rounded border-gray-300 text-primary-blue focus:ring-blue-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Currently Serving Notice Period</span>
                                </div>
                                <div className="flex gap-2 mb-2 items-center">
                                    <input type="text" value={noticePeriodInput} onChange={(e) => setNoticePeriodInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNoticePeriod()} placeholder="Add notice period value" className={inputClassName} />
                                    <button onClick={addNoticePeriod} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.notice_period_values.map((v: string) => (
                                        <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                                            {v}<button onClick={() => removeNoticePeriod(v)} className="hover:text-orange-600"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={filters.open_to_work_only} onChange={(e) => setFilters((prev: any) => ({ ...prev, open_to_work_only: e.target.checked }))} className="rounded border-gray-300 text-primary-blue focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Open to Work Only</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="radio" name="employment_status" checked={filters.is_currently_employed === undefined} onChange={() => setFilters((prev: any) => ({ ...prev, is_currently_employed: undefined }))} className="text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Any</span></label>
                                    <label className="flex items-center gap-2"><input type="radio" name="employment_status" checked={filters.is_currently_employed === true} onChange={() => setFilters((prev: any) => ({ ...prev, is_currently_employed: true }))} className="text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Employed</span></label>
                                    <label className="flex items-center gap-2"><input type="radio" name="employment_status" checked={filters.is_currently_employed === false} onChange={() => setFilters((prev: any) => ({ ...prev, is_currently_employed: false }))} className="text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Unemployed</span></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-6">Additional Details</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Languages</label>
                                    <div className="flex gap-2 mb-2 items-center">
                                        <input type="text" value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLanguage()} placeholder="Add language" className={inputClassName} />
                                        <button onClick={addLanguage} className={buttonClassName}><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {filters.languages.map((l: string) => (
                                            <span key={l} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                                                {l}<button onClick={() => removeLanguage(l)} className="hover:text-indigo-600"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <select value={filters.language_proficiency} onChange={(e) => setFilters((prev: any) => ({ ...prev, language_proficiency: e.target.value }))} className={inputClassName}>
                                        <option value="">Any Proficiency</option><option value="basic">Basic</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="fluent">Fluent</option><option value="native">Native</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Projects</label>
                                        <input type="number" min="0" value={filters.min_projects_count} onChange={(e) => setFilters((prev: any) => ({ ...prev, min_projects_count: parseInt(e.target.value) || 0 }))} className={inputClassName} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Active Days</label>
                                        <input type="number" min="0" value={filters.last_active_days} onChange={(e) => setFilters((prev: any) => ({ ...prev, last_active_days: parseInt(e.target.value) || 0 }))} className={inputClassName} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={!!filters.has_github} onChange={(e) => setFilters((prev: any) => ({ ...prev, has_github: e.target.checked }))} className="rounded border-gray-300 text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Has GitHub</span></label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={!!filters.has_linkedin} onChange={(e) => setFilters((prev: any) => ({ ...prev, has_linkedin: e.target.checked }))} className="rounded border-gray-300 text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Has LinkedIn</span></label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={!!filters.has_volunteer_experience} onChange={(e) => setFilters((prev: any) => ({ ...prev, has_volunteer_experience: e.target.checked }))} className="rounded border-gray-300 text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Volunteer Experience</span></label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Filter by Bucket</label>
                                    <select value={filters.bucket_id} onChange={(e) => setFilters((prev: any) => ({ ...prev, bucket_id: parseInt(e.target.value) || 0 }))} className={`mb-2 ${inputClassName}`}>
                                        <option value={0}>Any (Ignore Bucket)</option>
                                        {buckets.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                                    </select>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={filters.not_in_any_bucket} onChange={(e) => setFilters((prev: any) => ({ ...prev, not_in_any_bucket: e.target.checked }))} className="rounded border-gray-300 text-primary-blue focus:ring-blue-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Not in any bucket</span></label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort By</label>
                                        <select value={filters.sort_by} onChange={(e) => setFilters((prev: any) => ({ ...prev, sort_by: e.target.value }))} className={inputClassName}>
                                            <option value="relevance">Relevance</option><option value="recent_activity">Recent Activity</option><option value="experience">Experience</option><option value="education">Education</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort Order</label>
                                        <select value={filters.sort_order} onChange={(e) => setFilters((prev: any) => ({ ...prev, sort_order: e.target.value }))} className={inputClassName}>
                                            <option value="desc">Descending</option><option value="asc">Ascending</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center rounded-b-xl">
                    <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Reset Filters</button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                        <button onClick={onApply} className="px-6 py-2 bg-primary-blue hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all">Apply Filters</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
