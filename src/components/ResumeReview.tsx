'use client';

import { useEffect, useState } from 'react';
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
  Pencil
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
      const data = await api.getLinkedEntities(resumeId);
      setLinkedEntities(data);
      setShowLinkedData(true);
    } catch (err) {
      console.error('Failed to fetch linked entities:', err);
      alert('Failed to load saved data. Please try again.');
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-600">Error Loading Resume</h3>
        <p className="text-gray-600 mt-2">{loadError}</p>
        {onClose && (
          <button
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchLinkedEntities();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Saved Data
          </button>

          <button
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
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {/* Header Info */}


      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Personal Profile Section */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Personal Details</h2>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Update Portfolio?</span>
            <div
              onClick={() => setUpdatePortfolioChecked(!updatePortfolioChecked)}
              className={`w-10 h-5 rounded-full p-1 transition-colors ${updatePortfolioChecked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${updatePortfolioChecked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">First Name</label>
              <input
                type="text"
                value={localData.personal_details?.first_name || ''}
                onChange={(e) => updatePersonalInfo('first_name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-indigo-500 outline-none font-bold text-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Last Name</label>
              <input
                type="text"
                value={localData.personal_details?.last_name || ''}
                onChange={(e) => updatePersonalInfo('last_name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-indigo-500 outline-none font-bold text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Current Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localData.personal_details?.current_title || ''}
                  onChange={(e) => updatePersonalInfo('current_title', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-indigo-500 outline-none font-bold text-gray-800 dark:text-gray-200 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={localData.personal_details?.city || ''}
                    onChange={(e) => updatePersonalInfo('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-indigo-500 outline-none font-bold text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={localData.personal_details?.phone || ''}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-indigo-500 outline-none font-bold text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Work Experience</h2>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem('work_experiences');
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>

        <div className="space-y-6">
          {localData.work_experiences.map((exp, idx) => {
            const isSelected = selectedIds.work_experiences.has(exp._preview);
            const isEditing = editingId === exp._preview;

            return (
              <div
                key={exp._preview}
                onClick={(e) => { e.stopPropagation(); toggleSelection('work_experiences', exp._preview); }}
                className={`group bg-white dark:bg-gray-900 rounded-[2rem] border-2 transition-all duration-500 ${isSelected ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-gray-100 dark:border-gray-800'
                  }`}
              >
                <div className="p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection('work_experiences', exp._preview);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                    >
                      <Check className={`w-5 h-5 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
                    </button>

                    <div className="flex-1 space-y-4 min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Position</label>
                            <input
                              value={exp.position}
                              onChange={(e) => updateItem('work_experiences', idx, 'position', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Company</label>
                            <input
                              value={exp.company}
                              onChange={(e) => updateItem('work_experiences', idx, 'company', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent focus:border-blue-500 outline-none font-bold text-blue-600"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              placeholder="Start Date"
                              value={exp.start_date}
                              onChange={(e) => updateItem('work_experiences', idx, 'start_date', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm"
                            />
                            <input
                              placeholder="End Date"
                              disabled={exp.is_current}
                              value={exp.is_current ? 'Present' : (exp.end_date || '')}
                              onChange={(e) => updateItem('work_experiences', idx, 'end_date', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <input
                              type="checkbox"
                              checked={exp.is_current}
                              onChange={(e) => updateItem('work_experiences', idx, 'is_current', e.target.checked)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-xs font-bold text-gray-500">I currently work here</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">{exp.position}</h3>
                          <p className="text-blue-600 font-bold mb-2">{exp.company}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(isEditing ? null : exp._preview);
                        }}
                        className={`p-2 rounded-xl ${isEditing ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        {isEditing ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                      </button>
                      <button
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem('education');
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {localData.education.map((edu, idx) => {
            const isSelected = selectedIds.education.has(edu._preview);
            const isEditing = editingId === edu._preview;

            return (
              <div
                key={edu._preview}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection('education', edu._preview);
                }}
                className={`bg-white dark:bg-gray-900 rounded-3xl border-2 p-6 transition-all duration-300 ${isSelected ? 'border-emerald-500 shadow-lg shadow-emerald-500/5' : 'border-gray-100 dark:border-gray-800'
                  }`}
              >
                <div className="flex items-start gap-4" onClick={(e) => e.stopPropagation()}>
                  <button
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
                          className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-sm"
                          value={edu.degree}
                          onChange={(e) => updateItem('education', idx, 'degree', e.target.value)}
                        />
                        <input
                          placeholder="University"
                          className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-xs text-emerald-600"
                          value={edu.university}
                          onChange={(e) => updateItem('education', idx, 'university', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <input
                            placeholder="Start Year"
                            className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-xs"
                            value={edu.start_year || ''}
                            onChange={(e) => updateItem('education', idx, 'start_year', e.target.value)}
                          />
                          <input
                            placeholder="End Year"
                            disabled={edu.is_currently_studying}
                            className="w-full px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none font-bold text-xs"
                            value={edu.is_currently_studying ? 'Present' : (edu.end_year || '')}
                            onChange={(e) => updateItem('education', idx, 'end_year', e.target.value)}
                          />
                        </div>
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
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{edu.start_year} — {edu.end_year || 'Present'}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : edu._preview);
                      }}
                      className={`p-1.5 rounded-lg ${isEditing ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>
                    <button
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Skills</h2>
            </div>
            <button
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

              return (
                <div
                  key={skill._preview}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-50/20' : 'border-gray-50 dark:border-gray-800'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
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
                          className="w-full bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border-none outline-none font-bold text-xs"
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
                        <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{skill.skill_name}</span>
                        <span className="text-[10px] font-black text-amber-600">{skill.proficiency_level}/10</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : skill._preview);
                      }}
                      className="p-1 text-gray-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
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
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <LanguagesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Languages</h2>
            </div>
            <button
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

              return (
                <div
                  key={lang._preview}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-50/20' : 'border-gray-50 dark:border-gray-800'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
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
                          className="w-full bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border-none outline-none font-bold text-xs"
                          value={lang.language}
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
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{lang.language}</span>
                        <span className="text-[10px] font-black text-purple-600 uppercase">{lang.proficiency_level}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : lang._preview);
                      }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
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
      <div className="sticky bottom-0 left-0 right-0 z-50 mt-12 -mx-8 pb-8 px-8 bg-gradient-to-t from-white dark:from-gray-950 via-white/90 dark:via-gray-950/90 to-transparent pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between max-w-2xl mx-auto pointer-events-auto">
          <div className="pl-6 flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 line-clamp-1">Items for Profile</p>
            <p className="text-2xl font-black text-blue-600 leading-tight">0{totalSelectedCount}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={totalSelectedCount === 0 || saving}
            className="flex items-center gap-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black py-4 px-10 rounded-3xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale group"
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
