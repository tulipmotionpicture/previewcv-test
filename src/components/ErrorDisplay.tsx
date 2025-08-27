/**
 * Error Display Component
 * Shows user-friendly error messages with optional retry functionality
 */

'use client';

import { useState } from 'react';

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  severity?: 'error' | 'warning' | 'info';
  className?: string;
}

export default function ErrorDisplay({
  title,
  message,
  onRetry,
  showRetry = false,
  severity = 'error',
  className = ''
}: ErrorDisplayProps) {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const severityConfig = {
    error: {
      icon: '❌',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: '⚠️',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700'
    },
    info: {
      icon: 'ℹ️',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const config = severityConfig[severity];

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`text-2xl ${config.iconColor}`}>{config.icon}</span>
          </div>
          <div className="ml-4 flex-1">
            <h3 className={`text-lg font-medium ${config.titleColor}`}>
              {title}
            </h3>
            <p className={`mt-2 text-sm ${config.messageColor}`}>
              {message}
            </p>
            
            {showRetry && onRetry && (
              <div className="mt-4">
                <button
                  onClick={onRetry}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional help text for common errors */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={toggleHelp}
          className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
        >
          Need help?
        </button>
        {showHelp && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-left">
            <p className="mb-2 text-sm">If this problem persists, try:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Checking your internet connection</li>
              <li>Refreshing the page</li>
              <li>Verifying the resume link is still valid</li>
              <li>Contacting the person who shared this resume</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fallback error display for when Heroicons are not available
 */
export function SimpleErrorDisplay({
  title,
  message,
  onRetry,
  showRetry = false,
  className = ''
}: ErrorDisplayProps) {
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {title}
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {message}
          </p>
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}