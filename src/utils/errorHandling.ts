/**
 * Error Handling Utilities
 * Centralized error management and logging functions
 */

export interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, unknown>;
  stack?: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PARSING = 'parsing',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

/**
 * Create a standardized error object
 */
export function createAppError(
  message: string,
  options: {
    code?: string;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    context?: Record<string, unknown>;
    originalError?: Error;
  } = {}
): AppError {
  const {
    code,
    severity = ErrorSeverity.MEDIUM,
    context = {},
    originalError
  } = options;

  return {
    id: generateErrorId(),
    message,
    code,
    severity,
    timestamp: new Date(),
    context: {
      ...context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    },
    stack: originalError?.stack
  };
}

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log errors with appropriate level
 */
export function logError(error: AppError): void {
  const logData = {
    ...error,
    timestamp: error.timestamp.toISOString()
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error('CRITICAL ERROR:', logData);
      break;
    case ErrorSeverity.HIGH:
      console.error('HIGH SEVERITY ERROR:', logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('MEDIUM SEVERITY ERROR:', logData);
      break;
    case ErrorSeverity.LOW:
      console.info('LOW SEVERITY ERROR:', logData);
      break;
    default:
      console.log('ERROR:', logData);
  }

  // In production, send to error reporting service
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // sendToErrorService(error);
  }
}

/**
 * Handle and categorize common errors
 */
export function handleError(error: unknown, context?: Record<string, unknown>): AppError {
  let appError: AppError;

  if (error instanceof Error) {
    const category = categorizeError(error);
    const severity = getSeverityFromCategory(category);

    appError = createAppError(error.message, {
      code: error.name,
      severity,
      context: {
        ...context,
        category,
        originalName: error.name
      },
      originalError: error
    });
  } else if (typeof error === 'string') {
    appError = createAppError(error, {
      severity: ErrorSeverity.MEDIUM,
      context
    });
  } else {
    appError = createAppError('An unknown error occurred', {
      severity: ErrorSeverity.HIGH,
      context: {
        ...context,
        errorType: typeof error,
        errorValue: error
      }
    });
  }

  logError(appError);
  return appError;
}

/**
 * Categorize errors based on their characteristics
 */
function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (error.name === 'AbortError' || message.includes('fetch') || message.includes('network')) {
    return ErrorCategory.NETWORK;
  }
  
  if (message.includes('unauthorized') || message.includes('authentication') || message.includes('token')) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  if (message.includes('validation') || message.includes('invalid') || message.includes('format')) {
    return ErrorCategory.VALIDATION;
  }
  
  if (message.includes('json') || message.includes('parse') || message.includes('syntax')) {
    return ErrorCategory.PARSING;
  }
  
  if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) {
    return ErrorCategory.PERMISSION;
  }
  
  if (message.includes('rate') || message.includes('limit') || message.includes('too many')) {
    return ErrorCategory.RATE_LIMIT;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Get appropriate severity based on error category
 */
function getSeverityFromCategory(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.PERMISSION:
      return ErrorSeverity.HIGH;
    case ErrorCategory.NETWORK:
    case ErrorCategory.RATE_LIMIT:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.VALIDATION:
    case ErrorCategory.PARSING:
      return ErrorSeverity.MEDIUM;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  // Map technical errors to user-friendly messages
  const messageMap: Record<string, string> = {
    'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
    'NetworkError': 'Network connection failed. Please try again.',
    'AbortError': 'The request timed out. Please try again.',
    'SyntaxError': 'Received invalid data from the server.',
    'TypeError': 'A technical error occurred. Please try again.',
  };

  // Check for direct matches
  const directMatch = messageMap[error.message] || messageMap[error.code || ''];
  if (directMatch) {
    return directMatch;
  }

  // Category-based fallbacks
  const context = error.context as Record<string, unknown> | undefined;
  if (context?.category) {
    switch (context.category) {
      case ErrorCategory.NETWORK:
        return 'Connection error. Please check your internet and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. The resume link may be invalid.';
      case ErrorCategory.PERMISSION:
        return 'You don\'t have permission to view this resume.';
      case ErrorCategory.VALIDATION:
        return 'Invalid data received. Please check the resume link.';
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  return error.message || 'An unexpected error occurred.';
}

/**
 * Error recovery strategies
 */
export interface ErrorRecovery {
  canRetry: boolean;
  retryDelay?: number;
  maxRetries?: number;
  alternativeAction?: () => void;
  helpText?: string;
}

/**
 * Get error recovery options
 */
export function getErrorRecovery(error: AppError): ErrorRecovery {
  const context = error.context as Record<string, unknown> | undefined;
  
  switch (context?.category) {
    case ErrorCategory.NETWORK:
      return {
        canRetry: true,
        retryDelay: 2000,
        maxRetries: 3,
        helpText: 'Check your internet connection'
      };
      
    case ErrorCategory.RATE_LIMIT:
      return {
        canRetry: true,
        retryDelay: 5000,
        maxRetries: 2,
        helpText: 'Please wait before trying again'
      };
      
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.PERMISSION:
      return {
        canRetry: false,
        helpText: 'Contact the person who shared this resume'
      };
      
    case ErrorCategory.VALIDATION:
      return {
        canRetry: false,
        helpText: 'Check the resume link format'
      };
      
    default:
      return {
        canRetry: error.severity !== ErrorSeverity.CRITICAL,
        retryDelay: 1000,
        maxRetries: 1
      };
  }
}