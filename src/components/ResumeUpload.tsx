'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface ResumeUploadProps {
    onUploadSuccess: (resumeId: number) => void;
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
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

    const handleUpload = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Using filename as resume_name for now. User can be prompted in a future update.
            const response = await api.uploadResume(file, file.name);
            if (response && response.id) {
                onUploadSuccess(response.id);
            } else {
                setError('Upload failed: No resume ID returned.');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'Failed to upload resume.');
            } else {
                setError('Failed to upload resume.');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
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
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-700">
                        {uploading ? 'Uploading...' : 'Click or Drag to Upload Resume'}
                    </span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">PDF up to 5MB</span>
                </label>
            </div>
            {error && (
                <div className="mt-3 text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    );
}
