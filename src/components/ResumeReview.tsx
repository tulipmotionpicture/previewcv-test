'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, isValid, parse } from 'date-fns';
import { useResumeParser } from '@/hooks/useResumeParser';
import {
  Check,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages as LanguagesIcon,
  User as UserIcon,
  Sparkles,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Pencil,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gauge,
} from 'lucide-react';
import type {
  TransformedMetadata,
  WorkExperience,
  Education,
  Skill,
  Language,
  PersonalDetails,
} from '@/types/resume-parser';

interface Props {
  resumeId?: number;
  onSaveComplete?: (result: any) => void;
  portfolioId?: string;
  permanentToken?: string;
  onClose?: () => void;
}

/**
 * The AI parse + transform-for-graphql step is unreliable: required fields can come back as null,
 * blank, or placeholder strings (e.g. work start_date -> "Not specified", language -> null/"None").
 * Submitting those to save-reviewed-metadata fails on the backend, so we gate the Import button.
 */
const PLACEHOLDER_VALUES = new Set([
  'not specified',
  'none',
  'new company',
  'new position',
  'new university',
  'new degree',
  'new skill',
  'new language',
]);

/** A field value is "missing" if it is null/undefined, blank, or a known placeholder literal. */
function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false; // numeric/enum values (e.g. proficiency) are always set
  const trimmed = value.trim();
  if (trimmed === '') return true;
  return PLACEHOLDER_VALUES.has(trimmed.toLowerCase());
}

/**
 * Normalize a stored work date into a `<input type="month">` value ("YYYY-MM").
 * Returns '' for anything that isn't a real month (placeholders, blanks, year-only), so the picker
 * shows empty and the user must choose — keeping the UI and validation consistent. Emitting
 * "YYYY-MM" (7 chars) also stays safely within the backend column limit.
 */
function toMonthInputValue(value: unknown): string {
  if (isMissing(value)) return '';
  const v = String(value).trim();
  const iso = v.match(/^(\d{4})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}`;
  for (const fmt of ['MMM yyyy', 'MMMM yyyy']) {
    const d = parse(v, fmt, new Date());
    if (isValid(d)) return format(d, 'yyyy-MM');
  }
  return '';
}

/** Pretty label for a work date in read mode (e.g. "Jan 2024"); falls back to the raw value. */
function formatMonthDisplay(value: unknown): string {
  const iso = toMonthInputValue(value);
  if (!iso) return isMissing(value) ? '' : String(value);
  const d = parse(iso, 'yyyy-MM', new Date());
  return isValid(d) ? format(d, 'MMM yyyy') : iso;
}

const MONTHS: [string, string][] = [
  ['01', 'Jan'], ['02', 'Feb'], ['03', 'Mar'], ['04', 'Apr'],
  ['05', 'May'], ['06', 'Jun'], ['07', 'Jul'], ['08', 'Aug'],
  ['09', 'Sep'], ['10', 'Oct'], ['11', 'Nov'], ['12', 'Dec'],
];

/**
 * Month + Year dropdowns producing a "YYYY-MM" value. Used instead of a native <input type="month">
 * because that control's year navigation is awkward/missing in some browsers. Picking one half
 * defaults the other sensibly so the value is always a valid month.
 */
function MonthYearPicker({
  value,
  years,
  disabled,
  invalid,
  ariaLabel,
  onChange,
}: {
  value: string;
  years: string[];
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel: string;
  onChange: (v: string) => void;
}) {
  const m = value.match(/^(\d{4})-(\d{2})/);
  const yy = m ? m[1] : '';
  const mm = m ? m[2] : '';
  const fallbackYear = years[10] || years[0] || '2024';
  const base = `w-1/2 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border cursor-pointer text-gray-800 dark:text-gray-200 outline-none disabled:opacity-50 ${invalid ? 'border-red-400' : 'border-transparent'}`;
  return (
    <div className="flex gap-2">
      <select
        aria-label={`${ariaLabel} month`}
        disabled={disabled}
        value={mm}
        onChange={(e) => onChange(e.target.value ? `${yy || fallbackYear}-${e.target.value}` : '')}
        className={base}
      >
        <option value="">Month</option>
        {MONTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select
        aria-label={`${ariaLabel} year`}
        disabled={disabled}
        value={yy}
        onChange={(e) => onChange(e.target.value ? `${e.target.value}-${mm || '01'}` : '')}
        className={base}
      >
        <option value="">Year</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

type SelectedIds = {
  work_experiences: Set<string>;
  education: Set<string>;
  skills: Set<string>;
  languages: Set<string>;
};

type ValidationResult = {
  invalidFields: {
    work_experiences: Record<string, string[]>;
    education: Record<string, string[]>;
    skills: Record<string, string[]>;
    languages: Record<string, string[]>;
  };
  personalErrors: string[];
  invalidCount: number;
  isValid: boolean;
};

const EMPTY_VALIDATION: ValidationResult = {
  invalidFields: { work_experiences: {}, education: {}, skills: {}, languages: {} },
  personalErrors: [],
  invalidCount: 0,
  isValid: true,
};

/**
 * Validate only the *selected* items (the ones that will actually be submitted). A bad item can be
 * resolved either by fixing its fields or by deselecting it.
 */
function validateData(
  data: TransformedMetadata,
  selected: SelectedIds,
  checkPortfolio: boolean,
): ValidationResult {
  const invalidFields: ValidationResult['invalidFields'] = {
    work_experiences: {},
    education: {},
    skills: {},
    languages: {},
  };

  for (const exp of data.work_experiences) {
    if (!selected.work_experiences.has(exp._preview)) continue;
    const missing: string[] = [];
    if (isMissing(exp.position)) missing.push('Position');
    if (isMissing(exp.company)) missing.push('Company');
    // Work dates must resolve to a real month (the picker emits "YYYY-MM").
    if (!toMonthInputValue(exp.start_date)) missing.push('Start date');
    if (!exp.is_current && !toMonthInputValue(exp.end_date)) missing.push('End date');
    if (missing.length) invalidFields.work_experiences[exp._preview] = missing;
  }

  for (const edu of data.education) {
    if (!selected.education.has(edu._preview)) continue;
    const missing: string[] = [];
    if (isMissing(edu.degree)) missing.push('Degree');
    if (isMissing(edu.university)) missing.push('University');
    if (isMissing(edu.start_year)) missing.push('Start year');
    if (!edu.is_currently_studying && isMissing(edu.end_year)) missing.push('End year');
    if (missing.length) invalidFields.education[edu._preview] = missing;
  }

  for (const skill of data.skills) {
    if (!selected.skills.has(skill._preview)) continue;
    if (isMissing(skill.skill_name)) invalidFields.skills[skill._preview] = ['Skill name'];
  }

  for (const lang of data.languages) {
    if (!selected.languages.has(lang._preview)) continue;
    if (isMissing(lang.language)) invalidFields.languages[lang._preview] = ['Language'];
  }

  const personalErrors: string[] = [];
  if (checkPortfolio && data.personal_details) {
    if (isMissing(data.personal_details.first_name)) personalErrors.push('First name');
    if (isMissing(data.personal_details.last_name)) personalErrors.push('Last name');
  }

  const invalidCount =
    Object.keys(invalidFields.work_experiences).length +
    Object.keys(invalidFields.education).length +
    Object.keys(invalidFields.skills).length +
    Object.keys(invalidFields.languages).length +
    (personalErrors.length ? 1 : 0);

  return { invalidFields, personalErrors, invalidCount, isValid: invalidCount === 0 };
}

type Completeness = {
  percent: number;
  filled: number;
  total: number;
  missing: string[];
};

/**
 * Profile completeness across all reviewable data points (not just required fields).
 * Encourages the user to fill optional details before importing. Returns the % filled plus a
 * human-readable list of what's still empty.
 */
function computeCompleteness(data: TransformedMetadata): Completeness {
  let filled = 0;
  let total = 0;
  const missing: string[] = [];
  const check = (ok: boolean, label: string) => {
    total += 1;
    if (ok) filled += 1;
    else missing.push(label);
  };
  const has = (v: unknown) => !isMissing(v);

  const pd = data.personal_details;
  if (pd) {
    check(has(pd.first_name), 'First name');
    check(has(pd.last_name), 'Last name');
    check(has(pd.email), 'Email');
    check(has(pd.phone), 'Phone');
    check(has(pd.current_title), 'Current title');
    check(has(pd.city) || has(pd.country), 'Location');
    check(has(pd.profile_description), 'Profile summary');
  }

  data.work_experiences.forEach((e, i) => {
    const n = `Experience ${i + 1}`;
    check(has(e.position), `${n}: role`);
    check(has(e.company), `${n}: company`);
    check(!!toMonthInputValue(e.start_date), `${n}: start date`);
    check(e.is_current || !!toMonthInputValue(e.end_date), `${n}: end date`);
    check(has(e.city) || has(e.country), `${n}: location`);
    check(has(e.description), `${n}: description`);
  });

  data.education.forEach((e, i) => {
    const n = `Education ${i + 1}`;
    check(has(e.degree), `${n}: degree`);
    check(has(e.university), `${n}: institution`);
    check(has(e.start_year), `${n}: start year`);
    check(e.is_currently_studying || has(e.end_year), `${n}: end year`);
    check(has(e.field_of_study), `${n}: field of study`);
  });

  data.skills.forEach((s, i) =>
    check(has(s.skill_name), `Skill ${i + 1}: name`),
  );
  data.languages.forEach((l, i) =>
    check(has(l.language), `Language ${i + 1}: name`),
  );

  const percent = total === 0 ? 100 : Math.round((filled / total) * 100);
  return { percent, filled, total, missing };
}

function completenessColors(pct: number) {
  if (pct >= 80)
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    };
  if (pct >= 50)
    return {
      text: 'text-blue-600 dark:text-blue-400',
      bar: 'bg-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    };
  return {
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  };
}

export default function ResumeReview({ resumeId, onSaveComplete, portfolioId, permanentToken, onClose }: Props) {
  const [localData, setLocalData] = useState<TransformedMetadata | null>(null);
  const [selectedIds, setSelectedIds] = useState({
    work_experiences: new Set<string>(),
    education: new Set<string>(),
    skills: new Set<string>(),
    languages: new Set<string>(),
  });
  const [updatePortfolioChecked, setUpdatePortfolioChecked] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [linkedEntities, setLinkedEntities] = useState<any>(null);
  const [showLinkedData, setShowLinkedData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    getTransformedMetadata,
    saveReviewedMetadata,
    transforming,
    saving,
    error,
  } = useResumeParser();

  // Gate submission: only selected items with all key fields filled may be imported.
  const validation = useMemo(
    () => (localData ? validateData(localData, selectedIds, updatePortfolioChecked) : EMPTY_VALIDATION),
    [localData, selectedIds, updatePortfolioChecked],
  );

  // Profile completeness — encourages filling optional details before import.
  const completeness = useMemo(
    () => (localData ? computeCompleteness(localData) : null),
    [localData],
  );
  const [showMissing, setShowMissing] = useState(false);

  // Year options for the education year pickers (current year + 10 down to 1960).
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear + 10; y >= 1960; y--) years.push(String(y));
    return years;
  }, []);

  // Validate that either resumeId or permanentToken is provided
  useEffect(() => {
    if (!resumeId && !permanentToken) {
      setLoadError('Either resumeId or permanentToken must be provided');
    }
  }, [resumeId, permanentToken]);

  // Load transformed data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadError(null);
        let result: TransformedMetadata;

        if (permanentToken) {
          // Fetch using permanent token
          const response = await fetch(`/api/resume/${permanentToken}/transform-for-graphql`);
          if (!response.ok) {
            throw new Error('Failed to fetch resume data');
          }
          result = await response.json();
        } else if (resumeId) {
          // Fetch using resume ID (existing behavior)
          result = await getTransformedMetadata(resumeId);
        } else {
          throw new Error('Either resumeId or permanentToken must be provided');
        }

        setLocalData(result);

        // Auto-select all by default
        setSelectedIds({
          work_experiences: new Set(result.work_experiences.map(e => e._preview)),
          education: new Set(result.education.map(e => e._preview)),
          skills: new Set(result.skills.map(s => s._preview)),
          languages: new Set(result.languages.map(l => l._preview)),
        });
      } catch (err) {
        console.error('Failed to load data:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to load resume data');
      }
    };

    if (resumeId || permanentToken) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, permanentToken]);

  const toggleSelection = (type: keyof typeof selectedIds, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev[type]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [type]: next };
    });
  };

  const updatePersonalInfo = (field: keyof PersonalDetails, value: any) => {
    if (!localData || !localData.personal_details) return;
    setLocalData({
      ...localData,
      personal_details: {
        ...localData.personal_details,
        [field]: value
      }
    });
  };

  const updateItem = (type: 'work_experiences' | 'education' | 'skills' | 'languages', index: number, field: string, value: any) => {
    if (!localData) return;
    const newList = [...(localData[type] as any[])];
    newList[index] = { ...newList[index], [field]: value };
    setLocalData({ ...localData, [type]: newList });
  };

  const removeItem = (type: 'work_experiences' | 'education' | 'skills' | 'languages', index: number) => {
    if (!localData) return;
    const item = (localData[type] as any[])[index];
    const newList = (localData[type] as any[]).filter((_, i) => i !== index);

    // Also remove from selection
    setSelectedIds(prev => {
      const next = new Set(prev[type]);
      next.delete(item._preview);
      return { ...prev, [type]: next };
    });

    setLocalData({ ...localData, [type]: newList });
  };

  const addItem = (type: 'work_experiences' | 'education' | 'skills' | 'languages') => {
    if (!localData) return;

    let newItem: any;
    const id = `new_${Date.now()}`;

    if (type === 'work_experiences') {
      newItem = { company: 'New Company', position: 'New Position', start_date: 'Jan 2024', _preview: id, is_current: false };
    } else if (type === 'education') {
      newItem = { university: 'New University', degree: 'New Degree', start_year: '2020', _preview: id, is_currently_studying: false };
    } else if (type === 'skills') {
      newItem = { skill_name: 'New Skill', proficiency_level: 5, _preview: id };
    } else if (type === 'languages') {
      newItem = { language: 'New Language', proficiency_level: 'intermediate', _preview: id, can_read: true, can_write: true, can_speak: true };
    }

    setLocalData({
      ...localData,
      [type]: [...(localData[type] as any[]), newItem]
    });

    // Auto-select new item
    toggleSelection(type, id);
    setEditingId(id);
  };

  const handleSave = async () => {
    if (!localData) return;
    // Never submit incomplete/placeholder data — the button is also disabled, this is a safety net.
    if (!validation.isValid) return;
    // Require at least one selected item from every non-empty section (safety net for the gate).
    const sectionMissing = (
      ['work_experiences', 'education', 'skills', 'languages'] as const
    ).some(
      (k) => (localData[k] as unknown[]).length > 0 && selectedIds[k].size === 0,
    );
    if (sectionMissing) return;

    try {
      // Filter only selected items and clean them
      const cleanData: any = {
        work_experiences: localData.work_experiences
          .filter(e => selectedIds.work_experiences.has(e._preview))
          .map(({ _preview, _original, ...clean }) => clean),
        education: localData.education
          .filter(e => selectedIds.education.has(e._preview))
          .map(({ _preview, _original, ...clean }) => clean),
        skills: localData.skills
          .filter(s => selectedIds.skills.has(s._preview))
          .map(({ _preview, _original, _proficiency_label, _proficiency_numeric, ...clean }) => clean),
        languages: localData.languages
          .filter(l => selectedIds.languages.has(l._preview))
          .map(({ _preview, _original, _proficiency_label, ...clean }) => clean),
      };

      if (updatePortfolioChecked && localData.personal_details) {
        const { _note, _can_auto_save, _preview, _original, ...portfolioClean } = localData.personal_details;
        cleanData.portfolio = portfolioClean;
      }

      let result: any;

      if (permanentToken) {
        // Save using permanent token
        const response = await fetch(`/api/resume/${permanentToken}/save-reviewed-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanData),
        });
        if (!response.ok) {
          throw new Error('Failed to save reviewed metadata');
        }
        result = await response.json();
      } else if (resumeId) {
        // Save using resume ID (existing behavior)
        result = await saveReviewedMetadata(resumeId, cleanData);
      } else {
        throw new Error('Either resumeId or permanentToken must be provided');
      }

      setSaveSuccess(true);

      // Auto-close modal after 1.5 seconds to show success message
      setTimeout(() => {
        if (onSaveComplete) {
          onSaveComplete(result);
        } else if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Save failed:', err);
    }
  };

  const fetchLinkedEntities = async () => {
    try {
      if (!resumeId) {
        alert('Cannot fetch linked entities without a resume ID');
        return;
      }
      const { api } = await import('@/lib/api');
      const responseData = await api.getLinkedEntities(resumeId);
      let parsedData = responseData;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch(e) {}
      }
      setLinkedEntities(parsedData);
      setShowLinkedData(true);
    } catch (err: any) {
      setLinkedEntities({
        resume_id: resumeId,
        status: "failed",
        metadata: null,
        error: err.message || "PreviewCV API error: 500",
        parsed_at: null
      });
      setShowLinkedData(true);
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-600">Error Loading Resume</h3>
        <p className="text-gray-600 mt-2">{loadError}</p>
        {onClose && (
          <button type="button"
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  if (transforming) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Sparkles className="w-12 h-12 text-blue-500 mb-4" />
        <h3 className="text-xl font-bold">Structuring your data...</h3>
      </div>
    );
  }

  if (!localData) return null;

  const totalSelectedCount =
    selectedIds.work_experiences.size +
    selectedIds.education.size +
    selectedIds.skills.size +
    selectedIds.languages.size;

  // Require at least one selected item from every section that actually has data, so the user
  // consciously reviews and includes each part of their profile before importing. Empty sections
  // (nothing parsed) are skipped — they can't be required.
  const SECTION_LABELS: { key: keyof typeof selectedIds; label: string }[] = [
    { key: 'work_experiences', label: 'Work Experience' },
    { key: 'education', label: 'Education' },
    { key: 'skills', label: 'Skills' },
    { key: 'languages', label: 'Languages' },
  ];
  const missingSections = SECTION_LABELS.filter(
    (s) => (localData[s.key] as unknown[]).length > 0 && selectedIds[s.key].size === 0,
  ).map((s) => s.label);
  const sectionsCovered = missingSections.length === 0;

  // Show success screen after save
  if (saveSuccess && !showLinkedData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
            Data Saved Successfully!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {totalSelectedCount} items have been imported to your profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchLinkedEntities();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-blue to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Saved Data
          </button>

          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSaveSuccess(false);
              if (onSaveComplete) {
                onSaveComplete({ success: true });
              } else if (onClose) {
                onClose();
              }
            }}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-black px-8 py-4 rounded-2xl transition-all"
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-0 space-y-6 pb-28">
      {/* Header Info */}


      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Profile completeness meter */}
      {completeness && completeness.total > 0 && (() => {
        const c = completenessColors(completeness.percent);
        return (
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                {completeness.percent === 100 ? (
                  <CheckCircle2 className={`w-5 h-5 ${c.text}`} />
                ) : (
                  <Gauge className={`w-5 h-5 ${c.text}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Profile Completeness</h3>
                  <span className={`text-base font-black ${c.text}`}>{completeness.percent}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full rounded-full transition-all duration-700 ease-out ${c.bar}`} style={{ width: `${completeness.percent}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 sm:pl-12">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {completeness.percent === 100
                  ? 'Great — every detail is filled in.'
                  : `${completeness.missing.length} detail${completeness.missing.length === 1 ? '' : 's'} could be added to strengthen this profile.`}
              </p>
              {completeness.missing.length > 0 && (
                <button type="button"
                  onClick={() => setShowMissing((v) => !v)}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary-blue hover:underline whitespace-nowrap"
                >
                  {showMissing ? 'Hide' : 'View missing'}
                  {showMissing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {showMissing && completeness.missing.length > 0 && (
              <div className="mt-2 sm:pl-12 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {completeness.missing.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[10px] font-semibold"
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {m}
                  </span>
                ))}
              </div>
            )}
          </section>
        );
      })()}

      {/* Personal Profile Section */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight truncate">Personal Details</h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hidden sm:inline">Update Portfolio?</span>
            <div
              onClick={() => setUpdatePortfolioChecked(!updatePortfolioChecked)}
              className={`w-10 h-5 rounded-full p-1 transition-colors ${updatePortfolioChecked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${updatePortfolioChecked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {([
            { key: 'first_name', label: 'First Name', err: 'First name' },
            { key: 'last_name', label: 'Last Name', err: 'Last name' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone' },
            { key: 'phone_code', label: 'Phone Code' },
            { key: 'country_code', label: 'Country Code' },
            { key: 'current_title', label: 'Current Title' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'country', label: 'Country' },
            { key: 'postal_zip_code', label: 'Postal / Zip' },
            { key: 'street_number', label: 'Street No.' },
            { key: 'address', label: 'Address', span: true },
          ] as { key: keyof PersonalDetails; label: string; type?: string; err?: string; span?: boolean }[]).map((f) => (
            <div key={f.key} className={f.span ? 'sm:col-span-2 lg:col-span-3' : ''}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={((localData.personal_details as unknown as Record<string, unknown>)?.[f.key] as string) || ''}
                onChange={(e) => updatePersonalInfo(f.key, e.target.value)}
                className={`w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border focus:border-indigo-500 outline-none text-sm font-semibold text-gray-800 dark:text-gray-200 ${f.err && validation.personalErrors.includes(f.err) ? 'border-red-400' : 'border-transparent'}`}
              />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Profile Description</label>
            <textarea
              rows={3}
              value={localData.personal_details?.profile_description || ''}
              onChange={(e) => updatePersonalInfo('profile_description', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-transparent focus:border-indigo-500 outline-none text-sm font-medium text-gray-800 dark:text-gray-200 resize-y"
            />
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-blue dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Work Experience</h2>
          </div>
          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              addItem('work_experiences');
            }}
            className="flex items-center gap-2 bg-primary-blue hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>

        <div className="space-y-4">
          {localData.work_experiences.map((exp, idx) => {
            const isSelected = selectedIds.work_experiences.has(exp._preview);
            const isEditing = editingId === exp._preview;
            const errs = validation.invalidFields.work_experiences[exp._preview];

            return (
              <div
                key={exp._preview}
                onClick={(e) => { e.stopPropagation(); toggleSelection('work_experiences', exp._preview); }}
                className={`group bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 ${errs ? 'border-red-400 shadow-lg shadow-red-500/5' : isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/5' : 'border-gray-100 dark:border-gray-800'
                  }`}
              >
                <div className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-start gap-4">
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection('work_experiences', exp._preview);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-primary-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                    >
                      <Check className={`w-5 h-5 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
                    </button>

                    <div className="flex-1 space-y-4 min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Position</label>
                            <input
                              value={exp.position}
                              onChange={(e) => updateItem('work_experiences', idx, 'position', e.target.value)}
                              className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border focus:border-blue-500 outline-none font-bold ${errs?.includes('Position') ? 'border-red-400' : 'border-transparent'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Company</label>
                            <input
                              value={exp.company}
                              onChange={(e) => updateItem('work_experiences', idx, 'company', e.target.value)}
                              className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border focus:border-blue-500 outline-none font-bold text-primary-blue ${errs?.includes('Company') ? 'border-red-400' : 'border-transparent'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start</label>
                            <MonthYearPicker
                              ariaLabel="Start"
                              value={toMonthInputValue(exp.start_date)}
                              years={yearOptions}
                              invalid={errs?.includes('Start date')}
                              onChange={(v) => updateItem('work_experiences', idx, 'start_date', v)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">End</label>
                            <MonthYearPicker
                              ariaLabel="End"
                              value={exp.is_current ? '' : toMonthInputValue(exp.end_date)}
                              years={yearOptions}
                              disabled={exp.is_current}
                              invalid={errs?.includes('End date')}
                              onChange={(v) => updateItem('work_experiences', idx, 'end_date', v)}
                            />
                          </div>
                          <div className="flex items-center gap-2 px-2 sm:col-span-2">
                            <input
                              type="checkbox"
                              checked={exp.is_current}
                              onChange={(e) => updateItem('work_experiences', idx, 'is_current', e.target.checked)}
                              className="w-4 h-4 text-primary-blue"
                            />
                            <span className="text-xs font-bold text-gray-500">I currently work here</span>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">City</label>
                            <input
                              value={exp.city || ''}
                              onChange={(e) => updateItem('work_experiences', idx, 'city', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-sm font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Country</label>
                            <input
                              value={exp.country || ''}
                              onChange={(e) => updateItem('work_experiences', idx, 'country', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-sm font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Description</label>
                            <textarea
                              rows={3}
                              value={exp.description || ''}
                              onChange={(e) => updateItem('work_experiences', idx, 'description', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none text-sm font-medium resize-y"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-base font-black text-gray-900 dark:text-gray-100">{exp.position}</h3>
                          <p className="text-primary-blue font-bold text-sm mb-2">{exp.company}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-bold uppercase">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatMonthDisplay(exp.start_date) || '—'} — {exp.is_current ? 'Present' : (formatMonthDisplay(exp.end_date) || '—')}</span>
                            {(exp.city || exp.country) && (
                              <span className="flex items-center gap-1.5 normal-case"><MapPin className="w-3 h-3" /> {[exp.city, exp.country].filter(Boolean).join(', ')}</span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 normal-case font-medium">{exp.description}</p>
                          )}
                        </div>
                      )}
                      {errs && !isEditing && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Missing: {errs.join(', ')}
                          </p>
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingId(exp._preview); }}
                            className="text-xs font-black text-primary-blue hover:underline whitespace-nowrap"
                          >
                            Complete details
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(isEditing ? null : exp._preview);
                        }}
                        className={`p-2 rounded-xl ${isEditing ? 'bg-primary-blue text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        {isEditing ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                      </button>
                      <button type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem('work_experiences', idx);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Education Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Education</h2>
          </div>
          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              addItem('education');
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {localData.education.map((edu, idx) => {
            const isSelected = selectedIds.education.has(edu._preview);
            const isEditing = editingId === edu._preview;
            const errs = validation.invalidFields.education[edu._preview];

            return (
              <div
                key={edu._preview}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection('education', edu._preview);
                }}
                className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-4 transition-all duration-300 ${errs ? 'border-red-400 shadow-lg shadow-red-500/5' : isSelected ? 'border-emerald-500 shadow-lg shadow-emerald-500/5' : 'border-gray-100 dark:border-gray-800'
                  }`}
              >
                <div className="flex items-start gap-4" onClick={(e) => e.stopPropagation()}>
                  <button type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection('education', edu._preview);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                  >
                    <Check className={`w-4 h-4 ${isSelected ? 'scale-100' : 'scale-0'}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          placeholder="Degree"
                          className={`w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-sm border ${errs?.includes('Degree') ? 'border-red-400' : 'border-transparent'}`}
                          value={edu.degree}
                          onChange={(e) => updateItem('education', idx, 'degree', e.target.value)}
                        />
                        <input
                          placeholder="University"
                          className={`w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-xs text-emerald-600 border ${errs?.includes('University') ? 'border-red-400' : 'border-transparent'}`}
                          value={edu.university}
                          onChange={(e) => updateItem('education', idx, 'university', e.target.value)}
                        />
                        <input
                          placeholder="Field of Study"
                          className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-semibold text-xs border border-transparent focus:border-emerald-500"
                          value={edu.field_of_study || ''}
                          onChange={(e) => updateItem('education', idx, 'field_of_study', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <select
                            aria-label="Start year"
                            className={`w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-xs border cursor-pointer text-gray-800 dark:text-gray-200 ${errs?.includes('Start year') ? 'border-red-400' : 'border-transparent'}`}
                            value={isMissing(edu.start_year) ? '' : edu.start_year}
                            onChange={(e) => updateItem('education', idx, 'start_year', e.target.value)}
                          >
                            <option value="">Start Year</option>
                            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <select
                            aria-label="End year"
                            disabled={edu.is_currently_studying}
                            className={`w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-xs border cursor-pointer disabled:opacity-50 text-gray-800 dark:text-gray-200 ${errs?.includes('End year') ? 'border-red-400' : 'border-transparent'}`}
                            value={edu.is_currently_studying || isMissing(edu.end_year) ? '' : (edu.end_year || '')}
                            onChange={(e) => updateItem('education', idx, 'end_year', e.target.value)}
                          >
                            <option value="">{edu.is_currently_studying ? 'Present' : 'End Year'}</option>
                            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <input
                            placeholder="City"
                            className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-semibold text-xs border border-transparent focus:border-emerald-500"
                            value={edu.city || ''}
                            onChange={(e) => updateItem('education', idx, 'city', e.target.value)}
                          />
                          <input
                            placeholder="Country"
                            className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-semibold text-xs border border-transparent focus:border-emerald-500"
                            value={edu.country || ''}
                            onChange={(e) => updateItem('education', idx, 'country', e.target.value)}
                          />
                        </div>
                        <input
                          placeholder="GPA / Grade"
                          className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-semibold text-xs border border-transparent focus:border-emerald-500"
                          value={edu.gpa || ''}
                          onChange={(e) => updateItem('education', idx, 'gpa', e.target.value)}
                        />
                        <div className="flex items-center gap-2 px-2">
                          <input
                            type="checkbox"
                            checked={edu.is_currently_studying}
                            onChange={(e) => updateItem('education', idx, 'is_currently_studying', e.target.checked)}
                            className="w-3 h-3 text-emerald-600"
                          />
                          <span className="text-[10px] font-bold text-gray-500">Currently studying</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-black text-gray-900 dark:text-gray-100 truncate">{edu.degree}</h3>
                        <p className="text-emerald-600 font-bold text-xs truncate">{edu.university}</p>
                        {(edu.field_of_study || edu.gpa) && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 truncate">
                            {[edu.field_of_study, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join('  ·  ')}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                          {edu.start_year} — {edu.end_year || 'Present'}
                          {(edu.city || edu.country) ? `  ·  ${[edu.city, edu.country].filter(Boolean).join(', ')}` : ''}
                        </p>
                      </div>
                    )}
                    {errs && !isEditing && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> Missing: {errs.join(', ')}
                        </p>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingId(edu._preview); }}
                          className="text-[11px] font-black text-emerald-600 hover:underline whitespace-nowrap"
                        >
                          Complete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : edu._preview);
                      }}
                      className={`p-1.5 rounded-lg ${isEditing ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem('education', idx);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skills and Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Skills</h2>
            </div>
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                addItem('skills');
              }}
              className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 px-2">
            {localData.skills.map((skill, idx) => {
              const isSelected = selectedIds.skills.has(skill._preview);
              const isEditing = editingId === skill._preview;
              const errs = validation.invalidFields.skills[skill._preview];

              return (
                <div
                  key={skill._preview}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${errs ? 'border-red-400 bg-red-50/20' : isSelected ? 'border-amber-500 bg-amber-50/20' : 'border-gray-50 dark:border-gray-800'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection('skills', skill._preview);
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          className={`w-full bg-white dark:bg-gray-800 px-2 py-1 rounded-lg outline-none font-bold text-xs border ${errs ? 'border-red-400' : 'border-transparent'}`}
                          value={skill.skill_name}
                          onChange={(e) => updateItem('skills', idx, 'skill_name', e.target.value)}
                          placeholder="Skill name"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Proficiency</label>
                            <span className="text-[10px] font-black text-amber-600">{skill.proficiency_level}/10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={skill.proficiency_level}
                            onChange={(e) => updateItem('skills', idx, 'proficiency_level', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {errs ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-500"><AlertCircle className="w-3 h-3" /> Name required</span>
                        ) : (
                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{skill.skill_name}</span>
                        )}
                        <span className="text-[10px] font-black text-amber-600">{skill.proficiency_level}/10</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : skill._preview);
                      }}
                      className="p-1 text-gray-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem('skills', idx);
                      }}
                      className="p-1 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <LanguagesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Languages</h2>
            </div>
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                addItem('languages');
              }}
              className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 px-2">
            {localData.languages.map((lang, idx) => {
              const isSelected = selectedIds.languages.has(lang._preview);
              const isEditing = editingId === lang._preview;
              const errs = validation.invalidFields.languages[lang._preview];

              return (
                <div
                  key={`${lang._preview}-${idx}`}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${errs ? 'border-red-400 bg-red-50/20' : isSelected ? 'border-purple-500 bg-purple-50/20' : 'border-gray-50 dark:border-gray-800'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection('languages', lang._preview);
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          className={`w-full bg-white dark:bg-gray-800 px-2 py-1 rounded-lg outline-none font-bold text-xs border ${errs ? 'border-red-400' : 'border-transparent'}`}
                          value={lang.language || ''}
                          onChange={(e) => updateItem('languages', idx, 'language', e.target.value)}
                          placeholder="Language"
                        />
                        <select
                          className="w-full bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border-none outline-none font-bold text-[10px] text-purple-600 uppercase cursor-pointer"
                          value={lang.proficiency_level}
                          onChange={(e) => updateItem('languages', idx, 'proficiency_level', e.target.value)}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                          <option value="native">Native</option>
                        </select>
                        <div className="flex items-center gap-3 px-1 pt-0.5">
                          {([
                            { key: 'can_read', label: 'Read' },
                            { key: 'can_write', label: 'Write' },
                            { key: 'can_speak', label: 'Speak' },
                          ] as { key: 'can_read' | 'can_write' | 'can_speak'; label: string }[]).map((c) => (
                            <label key={c.key} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!lang[c.key]}
                                onChange={(e) => updateItem('languages', idx, c.key, e.target.checked)}
                                className="w-3 h-3 text-purple-600"
                              />
                              <span className="text-[10px] font-bold text-gray-500">{c.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between">
                          {errs ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-500"><AlertCircle className="w-3 h-3" /> Language required</span>
                          ) : (
                            <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{lang.language}</span>
                          )}
                          <span className="text-[10px] font-black text-purple-600 uppercase">{lang.proficiency_level}</span>
                        </div>
                        {(lang.can_read || lang.can_write || lang.can_speak) && (
                          <div className="flex gap-1 mt-1">
                            {lang.can_read && <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-[9px] font-bold">Read</span>}
                            {lang.can_write && <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-[9px] font-bold">Write</span>}
                            {lang.can_speak && <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-[9px] font-bold">Speak</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : lang._preview);
                      }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem('languages', idx);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 left-0 right-0 z-50 mt-8 -mx-3 sm:-mx-8 pb-4 sm:pb-6 px-3 sm:px-8 bg-gradient-to-t from-white dark:from-gray-950 via-white/90 dark:via-gray-950/90 to-transparent pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-2xl mx-auto pointer-events-auto">
          <div className="pl-2 sm:pl-6 flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 line-clamp-1">Items for Profile</p>
            <p className="text-xl font-black text-primary-blue leading-tight">0{totalSelectedCount}</p>
            {totalSelectedCount > 0 && !validation.isValid && (
              <p className="flex items-center gap-1 text-[11px] font-bold text-red-500 mt-0.5">
                <AlertCircle className="w-3 h-3" /> {validation.invalidCount} item{validation.invalidCount > 1 ? 's' : ''} need details
              </p>
            )}
            {!sectionsCovered && (
              <p className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" /> Select at least one: {missingSections.join(', ')}
              </p>
            )}
          </div>

          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={totalSelectedCount === 0 || saving || !validation.isValid || !sectionsCovered}
            className="flex items-center justify-center gap-3 w-full sm:w-auto bg-gradient-to-br from-primary-blue to-indigo-600 text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Import to Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
