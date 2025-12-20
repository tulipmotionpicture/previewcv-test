import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export default function Input({ label, error, helperText, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-6 py-4 bg-gray-50 border ${
                    error ? 'border-red-300 focus:ring-red-600' : 'border-gray-100 focus:ring-blue-600'
                } rounded-2xl focus:ring-2 outline-none hover:bg-gray-100 transition-all font-medium text-gray-900 placeholder-gray-300 ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600 ml-1">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-2 text-xs text-gray-500 ml-1">{helperText}</p>
            )}
        </div>
    );
}

