/**
 * Configuration file for PreviewCV application
 * Manages environment variables and application settings
 */

interface Config {
  api: {
    baseUrl: string;
    apiToken: string;
  };
  bunny: {
    cdnBaseUrl?: string;
    securityKey?: string;
    folder?: string;
    signedUrlExpireSeconds?: number;
  };
  rateLimit: {
    requestsPerHour: number;
    windowMs: number;
  };
  app: {
    name: string;
    nodeEnv: string;
    logoUrl: string;
  };
}

const config: Config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    apiToken: process.env.SHARED_LINK_API_TOKEN || '',
  },
  bunny: {
    cdnBaseUrl: process.env.BUNNY_CDN_BASE_URL_RESUME,
    securityKey: process.env.BUNNY_SECURITY_KEY_STORAGE,
    folder: process.env.BUNNY_FOLDER || 'pdfs',
    signedUrlExpireSeconds: parseInt(process.env.BUNNY_SIGNED_URL_EXPIRE_SECONDS || '3600'),
  },
  rateLimit: {
    requestsPerHour: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'PreviewCV',
    nodeEnv: process.env.NODE_ENV || 'development',
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '/preview-cv-main-logo.png',
  },
};

export default config;