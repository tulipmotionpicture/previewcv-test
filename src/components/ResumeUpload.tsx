"use client";

import { useState, useEffect, useRef } from "react";
import {
  api,
  ResumeMetadata,
  ResumePersonalDetails,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
} from "@/lib/api";

type ParsingStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "completed"
  | "review"
  | "failed";

interface ParsingProgress {
  step: string;
  message: string;
}

interface ResumeUploadProps {
  onUploadSuccess: (resumeId: number, metadata?: ResumeMetadata) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsingStatus, setParsingStatus] = useState<ParsingStatus>("idle");
  const [parsingProgress, setParsingProgress] = useState<ParsingProgress[]>([]);
  const [parsedMetadata, setParsedMetadata] = useState<ResumeMetadata | null>(
    null
  );
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<ResumeMetadata | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const pollParseStatus = async (resumeId: number) => {
    try {
      const status = await api.getParseStatus(resumeId);

      if (status.status === "completed") {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        setParsingProgress((prev) => [
          ...prev,
          { step: "completed", message: "Resume parsed successfully!" },
        ]);

        // Store parsed metadata and show review screen
        if (status.metadata) {
          // Don't set parsed metadata directly, instead, fetch the transformed version
          try {
            const transformed = await api.transformMetadataForGraphQL(resumeId);
            // Now, we need to adapt the 'editedMetadata' state to hold this new structure.
            // For now, let's assume the structure is compatible or we'll adjust the state management.
            // A better approach would be to have a new state for this transformed data.
            // Let's create a new state `transformedForReview`
            // setTransformedForReview(transformed);

            // For now, we will adapt the existing flow. This will likely break the UI
            // as it expects the old `ResumeMetadata` structure.
            // We will need to refactor the review UI to work with `ReviewedResumeMetadata`.
            // Let's log it for now and proceed with the old data structure for the UI
            // to avoid breaking it completely.
            console.log("Transformed data for GraphQL:", transformed);

            // We still use the old metadata for the review UI for now.
            setParsedMetadata(status.metadata);
            setEditedMetadata(JSON.parse(JSON.stringify(status.metadata))); // Deep copy for editing
            setParsingStatus("review");
          } catch (transformError) {
            console.error(
              "Failed to transform metadata for GraphQL:",
              transformError
            );
            setError("Failed to prepare resume for review.");
            setParsingStatus("failed");
          }
        } else {
          // No metadata, just complete
          setParsingStatus("completed");
          onUploadSuccess(resumeId);
        }
      } else if (status.status === "failed") {
        setParsingStatus("failed");
        setError(status.error || "Resume parsing failed");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else if (status.status === "processing") {
        setParsingProgress((prev) => {
          // Only add if not already present
          if (!prev.some((p) => p.step === "processing")) {
            return [
              ...prev,
              { step: "processing", message: "Parsing resume content..." },
            ];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error polling parse status:", err);
    }
  };

  const initiateResumeParsing = async (resumeId: number) => {
    setParsingStatus("parsing");
    setParsingProgress([
      { step: "initiated", message: "Starting resume parsing..." },
    ]);

    try {
      const parseResponse = await api.parseResumeById(resumeId);

      if (parseResponse.success) {
        setParsingProgress((prev) => [
          ...prev,
          { step: "processing", message: "Resume parsing in progress..." },
        ]);

        // Poll for status every 2 seconds
        pollingIntervalRef.current = setInterval(() => {
          pollParseStatus(resumeId);
        }, 2000);

        // Also do an immediate check
        setTimeout(() => pollParseStatus(resumeId), 500);
      } else {
        // Parsing initiation failed, but upload was successful
        // Still mark as success for the upload
        setParsingStatus("completed");
        onUploadSuccess(resumeId);
      }
    } catch (err) {
      console.error("Error initiating parse:", err);
      // Even if parsing fails to initiate, the upload was successful
      // So we still call onUploadSuccess
      setParsingStatus("completed");
      onUploadSuccess(resumeId);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    setParsingStatus("uploading");
    setParsingProgress([]);
    setError(null);

    try {
      // Using filename as resume_name for now
      const response = await api.uploadResume(file, file.name);
      if (response && response.resume_id) {
        setCurrentResumeId(response.resume_id);
        setParsingProgress([
          { step: "uploaded", message: "Resume uploaded successfully!" },
        ]);
        // Initiate parsing after upload
        await initiateResumeParsing(response.resume_id);
      } else {
        setError("Upload failed: No resume ID returned.");
        setParsingStatus("failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to upload resume.");
      } else {
        setError("Failed to upload resume.");
      }
      setParsingStatus("failed");
    } finally {
      setUploading(false);
    }
  };

  // Update personal details
  const updatePersonalDetail = (
    field: keyof ResumePersonalDetails,
    value: string
  ) => {
    if (!editedMetadata) return;
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        personal_details: {
          ...editedMetadata.data.personal_details,
          [field]: value || null,
        },
      },
    });
  };

  // Update skills
  const updateSkills = (skills: ResumeSkill[]) => {
    if (!editedMetadata) return;
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        skills,
      },
    });
  };

  // Add a new skill
  const addSkill = (skillName: string) => {
    if (!editedMetadata || !skillName.trim()) return;
    const newSkill: ResumeSkill = { name: skillName.trim(), proficiency: null };
    const newSkills = [...editedMetadata.data.skills, newSkill];
    updateSkills(newSkills);
  };

  // Remove a skill
  const removeSkill = (index: number) => {
    if (!editedMetadata) return;
    const newSkills = editedMetadata.data.skills.filter((_, i) => i !== index);
    updateSkills(newSkills);
  };

  // Update experience
  const updateExperience = (
    index: number,
    field: keyof ResumeExperience,
    value: string
  ) => {
    if (!editedMetadata) return;
    const newExperience = [...editedMetadata.data.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value || null,
    };
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        experience: newExperience,
      },
    });
  };

  // Add new experience
  const addExperience = () => {
    if (!editedMetadata) return;
    const newExp: ResumeExperience = {
      title: "",
      company: "",
      duration: null,
      start_date: null,
      end_date: null,
      description: null,
      location: null,
    };
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        experience: [...editedMetadata.data.experience, newExp],
      },
    });
  };

  // Remove experience
  const removeExperience = (index: number) => {
    if (!editedMetadata) return;
    const newExperience = editedMetadata.data.experience.filter(
      (_, i) => i !== index
    );
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        experience: newExperience,
      },
    });
  };

  // Update education
  const updateEducation = (
    index: number,
    field: keyof ResumeEducation,
    value: string
  ) => {
    if (!editedMetadata) return;
    const newEducation = [...editedMetadata.data.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value || null,
    };
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        education: newEducation,
      },
    });
  };

  // Add new education
  const addEducation = () => {
    if (!editedMetadata) return;
    const newEdu: ResumeEducation = {
      degree: "",
      institution: "",
      year: null,
      grade: null,
      start_date: null,
      end_date: null,
      graduation_date: null,
      field_of_study: null,
      gpa: null,
    };
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        education: [...editedMetadata.data.education, newEdu],
      },
    });
  };

  // Remove education
  const removeEducation = (index: number) => {
    if (!editedMetadata) return;
    const newEducation = editedMetadata.data.education.filter(
      (_, i) => i !== index
    );
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        education: newEducation,
      },
    });
  };

  // Add new language
  const addLanguage = (
    langName: string,
    proficiency: string = "intermediate"
  ) => {
    if (!editedMetadata || !langName.trim()) return;
    const newLang = {
      name: langName.trim(),
      proficiency: proficiency || null,
    };
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        languages: [...(editedMetadata.data.languages || []), newLang],
      },
    });
  };

  // Remove language
  const removeLanguage = (index: number) => {
    if (!editedMetadata) return;
    const newLanguages = (editedMetadata.data.languages || []).filter(
      (_, i) => i !== index
    );
    setEditedMetadata({
      ...editedMetadata,
      data: {
        ...editedMetadata.data,
        languages: newLanguages,
      },
    });
  };

  // Confirm and proceed with the parsed data
  const handleConfirmMetadata = async () => {
    if (!currentResumeId || !editedMetadata) return;

    setSaving(true);

    try {
      // Create the payload from the editedMetadata state, explicitly converting null to undefined for type safety
      const personalDetails = {
        first_name:
          editedMetadata.data.personal_details.first_name ?? undefined,
        last_name: editedMetadata.data.personal_details.last_name ?? undefined,
        email: editedMetadata.data.personal_details.email ?? undefined,
        phone: editedMetadata.data.personal_details.phone ?? undefined,
        city: editedMetadata.data.personal_details.city ?? undefined,
        state: editedMetadata.data.personal_details.state ?? undefined,
        country: editedMetadata.data.personal_details.country ?? undefined,
        gender: editedMetadata.data.personal_details.gender ?? undefined,
        professional_title:
          editedMetadata.data.personal_details.professional_title ?? undefined,
        profile_description:
          editedMetadata.data.personal_details.profile_description ?? undefined,
      };

      const transformedData = {
        personal_details: personalDetails,
        work_experiences: editedMetadata.data.experience.map((exp) => ({
          company: exp.company || "",
          position: exp.title || "",
          start_date: exp.start_date || "",
          end_date: exp.end_date || "",
          description: exp.description || "",
          location: exp.location || "",
          is_current: false, // This needs to be derived if possible
        })),
        education: editedMetadata.data.education.map((edu) => ({
          institution_name: edu.institution || "",
          degree: edu.degree || "",
          start_date: edu.start_date || "",
          end_date: edu.end_date || "",
          gpa: edu.gpa ? parseFloat(edu.gpa) : undefined,
          field_of_study: edu.field_of_study || "",
        })),
        skills: editedMetadata.data.skills.map((skill) => ({
          skill_name: skill.name || "",
          proficiency_level: 5,
        })),
        languages: (editedMetadata.data.languages || []).map((lang) => ({
          language: lang.name || "",
          proficiency_level: (lang.proficiency as any) || "intermediate",
        })),
      };

      await api.saveReviewedMetadata(currentResumeId, transformedData);

      setParsingStatus("completed");
      onUploadSuccess(currentResumeId, editedMetadata);
    } catch (err) {
      console.error("Error saving metadata:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };
  // Skip review and use original parsed data
  const handleSkipReview = () => {
    if (!currentResumeId) return;
    setParsingStatus("completed");
    onUploadSuccess(currentResumeId, parsedMetadata || undefined);
  };

  const isProcessing =
    parsingStatus === "uploading" || parsingStatus === "parsing";

  return (
    <>
      {/* Modal for Review and Edit Parsed Data */}
      {parsingStatus === "review" && editedMetadata && (
        <div className="fixed inset-0 overflow-hidden flex items-center justify-center z-[999999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleSkipReview}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] m-4 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Review Parsed Resume
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review and edit the extracted information
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkipReview}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  title="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Personal Details */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👤</span> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={
                          editedMetadata.data.personal_details.first_name || ""
                        }
                        onChange={(e) =>
                          updatePersonalDetail("first_name", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={
                          editedMetadata.data.personal_details.last_name || ""
                        }
                        onChange={(e) =>
                          updatePersonalDetail("last_name", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedMetadata.data.personal_details.email || ""}
                        onChange={(e) =>
                          updatePersonalDetail("email", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editedMetadata.data.personal_details.phone || ""}
                        onChange={(e) =>
                          updatePersonalDetail("phone", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={editedMetadata.data.personal_details.city || ""}
                        onChange={(e) =>
                          updatePersonalDetail("city", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={editedMetadata.data.personal_details.state || ""}
                        onChange={(e) =>
                          updatePersonalDetail("state", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={
                          editedMetadata.data.personal_details.country || ""
                        }
                        onChange={(e) =>
                          updatePersonalDetail("country", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={
                          editedMetadata.data.personal_details.gender || ""
                        }
                        onChange={(e) =>
                          updatePersonalDetail("gender", e.target.value)
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        value={
                          editedMetadata.data.personal_details
                            .professional_title || ""
                        }
                        onChange={(e) =>
                          updatePersonalDetail(
                            "professional_title",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                        placeholder="e.g., Full-Stack Developer"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Profile Description
                      </label>
                      <textarea
                        rows={3}
                        value={
                          editedMetadata.data.personal_details
                            .profile_description || ""
                        }
                        onChange={(e) =>
                          updatePersonalDetail(
                            "profile_description",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100 resize-none"
                        placeholder="Brief professional summary..."
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🛠️</span> Skills
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editedMetadata.data.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700"
                      >
                        <span className="font-medium">{skill.name}</span>
                        {skill.proficiency && (
                          <span className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded">
                            {skill.proficiency}
                          </span>
                        )}
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-1 w-5 h-5 flex items-center justify-center rounded hover:bg-red-200 dark:hover:bg-red-900/50 text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addSkill((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement)
                          .closest("div")
                          ?.querySelector("input") as HTMLInputElement;
                        if (input) {
                          addSkill(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <span className="text-2xl">💼</span> Experience
                    </h4>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Experience
                    </button>
                  </div>
                  {editedMetadata.data.experience.length > 0 && (
                    <div className="space-y-4">
                      {editedMetadata.data.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 relative"
                        >
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Job Title
                              </label>
                              <input
                                type="text"
                                value={exp.title || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="Job Title"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Company
                              </label>
                              <input
                                type="text"
                                value={exp.company || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "company",
                                    e.target.value
                                  )
                                }
                                placeholder="Company"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Duration
                              </label>
                              <input
                                type="text"
                                value={exp.duration || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Jan 2023 - Present"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Location
                              </label>
                              <input
                                type="text"
                                value={exp.location || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "location",
                                    e.target.value
                                  )
                                }
                                placeholder="City, Country"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Description
                              </label>
                              <textarea
                                rows={3}
                                value={exp.description || ""}
                                onChange={(e) =>
                                  updateExperience(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Job responsibilities and achievements..."
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-2xl">🎓</span> Education
                      </h4>
                      <button
                        onClick={addEducation}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-lg">+</span> Add Education
                      </button>
                    </div>
                    <div className="space-y-4">
                      {editedMetadata.data.education.map((edu, index) => (
                        <div
                          key={index}
                          className="relative p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
                        >
                          <button
                            onClick={() => removeEducation(index)}
                            className="absolute top-3 right-3 p-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Remove education"
                          >
                            <span className="text-sm">🗑️</span>
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Degree
                              </label>
                              <input
                                type="text"
                                value={edu.degree || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                                placeholder="Degree"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Institution
                              </label>
                              <input
                                type="text"
                                value={edu.institution || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                                placeholder="Institution"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Field of Study
                              </label>
                              <input
                                type="text"
                                value={edu.field_of_study || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "field_of_study",
                                    e.target.value
                                  )
                                }
                                placeholder="Field of Study"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Grade/GPA
                              </label>
                              <input
                                type="text"
                                value={edu.grade || edu.gpa || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                placeholder="GPA or Grade"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                Start Date
                              </label>
                              <input
                                type="text"
                                value={edu.start_date || ""}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                                placeholder="Start Date"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                End Date / Year
                              </label>
                              <input
                                type="text"
                                value={
                                  edu.end_date ||
                                  edu.year ||
                                  edu.graduation_date ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "end_date",
                                    e.target.value
                                  )
                                }
                                placeholder="End Date"
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-2xl">🌍</span> Languages
                      </h4>
                      <input
                        type="text"
                        placeholder="Add a language..."
                        className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100 mr-2"
                        id="add-language-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addLanguage(input.value.trim());
                              input.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input =
                            e.currentTarget.parentElement?.querySelector(
                              "#add-language-input"
                            ) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addLanguage(input.value.trim());
                            input.value = "";
                          }
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-lg">+</span> Add Language
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {editedMetadata.data.languages &&
                        editedMetadata.data.languages.map((lang, index) => (
                          <div
                            key={index}
                            className="relative group px-4 py-2 pr-8 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-700"
                          >
                            <span className="font-medium">{lang.name}</span>
                            {lang.proficiency && (
                              <span className="ml-2 text-xs">
                                - {lang.proficiency}
                              </span>
                            )}
                            <button
                              onClick={() => removeLanguage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove language"
                            >
                              <span className="text-xs">✕</span>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Actions */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0">
                <button
                  onClick={handleSkipReview}
                  className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Skip & Use Original
                </button>
                <button
                  onClick={handleConfirmMetadata}
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Confirm & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* Show progress when uploading/parsing */}
        {isProcessing && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {parsingStatus === "uploading"
                  ? "Uploading resume..."
                  : "Parsing resume..."}
              </span>
            </div>
            {parsingProgress.length > 0 && (
              <div className="space-y-2">
                {parsingProgress.map((progress, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {progress.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show success message when completed */}
        {parsingStatus === "completed" && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Resume uploaded and parsed successfully!
            </div>
          </div>
        )}

        {/* Upload area - only show when idle or failed */}
        {(parsingStatus === "idle" || parsingStatus === "failed") && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {uploading ? "Uploading..." : "Click or Drag to Upload Resume"}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wide">
                PDF up to 5MB
              </span>
            </label>
          </div>
        )}

        {error && (
          <div className="mt-3 text-red-500 dark:text-red-400 text-sm font-bold text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
