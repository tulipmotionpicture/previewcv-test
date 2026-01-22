# Next.js Integration Guide: SEO Jobs & Cards API

This guide covers integrating the SEO-optimized job listings and job cards APIs into your Next.js frontend application.

## Table of Contents

1. [API Overview](#api-overview)
2. [Setup & Configuration](#setup--configuration)
3. [Type Definitions](#type-definitions)
4. [API Client Functions](#api-client-functions)
5. [SEO Dynamic Routes](#seo-dynamic-routes)
6. [Job Cards Components](#job-cards-components)
7. [Homepage Integration](#homepage-integration)
8. [Sitemap Generation](#sitemap-generation)
9. [Caching Strategies](#caching-strategies)
10. [Complete Examples](#complete-examples)

---

## API Overview

### Base URL
```
Production: https://api.previewcv.com
Development: http://localhost:8000
```

### Available Endpoints

#### SEO Jobs Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/jobs/by-slug/{path}` | GET | Get jobs by SEO slug |
| `/api/v1/jobs/seo-patterns` | GET | Get all valid SEO patterns (for sitemap) |
| `/api/v1/jobs/parse-slug/{path}` | GET | Debug: Parse a slug |

#### Job Cards Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/jobs/cards/by-country` | GET | Jobs grouped by country |
| `/api/v1/jobs/cards/by-city` | GET | Jobs grouped by city |
| `/api/v1/jobs/cards/by-industry` | GET | Jobs grouped by industry |
| `/api/v1/jobs/cards/by-job-type` | GET | Jobs grouped by job type |
| `/api/v1/jobs/cards/by-experience` | GET | Jobs grouped by experience |
| `/api/v1/jobs/cards/remote` | GET | Remote vs on-site stats |
| `/api/v1/jobs/cards/summary` | GET | All cards in one request |

---

## Setup & Configuration

### 1. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000
```

### 2. Install Dependencies

```bash
npm install axios swr
# or
yarn add axios swr
# or
pnpm add axios swr
```

### 3. Create API Client

```typescript
// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Server-side API client (uses internal URL if available)
export const serverApiClient = axios.create({
  baseURL: process.env.API_URL || API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## Type Definitions

Create comprehensive TypeScript types for all API responses:

```typescript
// types/jobs.ts

// ============================================================================
// SEO Jobs Types
// ============================================================================

export interface Job {
  id: number;
  slug: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  is_remote: boolean;
  posted_date: string;
  categories: string[];
  required_skills: string[];
  is_applied: boolean;
  is_bookmarked: boolean;
  recruiter_profile_url: string | null;
}

export type JobType = 
  | 'full_time' 
  | 'part_time' 
  | 'contract' 
  | 'internship' 
  | 'freelance' 
  | 'temporary';

export type ExperienceLevel = 
  | 'entry' 
  | 'junior' 
  | 'mid' 
  | 'senior' 
  | 'lead' 
  | 'manager' 
  | 'director' 
  | 'executive';

export interface SEOFilters {
  country: string | null;
  state: string | null;
  city: string | null;
  job_type: string | null;
  is_remote: boolean;
  skill_keywords: string[];
  industry: string | null;
  experience_level: string | null;
}

export interface SEOMeta {
  title: string;
  description: string;
  h1: string;
  keywords: string;
  canonical_url: string;
}

export interface SEOJobsResponse {
  success: boolean;
  slug: string;
  pattern_type: string;
  is_valid: boolean;
  filters_applied: SEOFilters;
  fallback_applied: 'state' | 'country' | null;
  meta: SEOMeta;
  jobs: Job[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SEOPattern {
  slug: string;
  count: number;
  pattern_type: string;
  location: string | null;
  job_type: string | null;
  is_remote: boolean;
}

export interface SEOPatternsResponse {
  success: boolean;
  patterns: SEOPattern[];
  total_patterns: number;
  generated_at: string;
}

// ============================================================================
// Job Cards Types
// ============================================================================

export interface CountryCard {
  country: string;
  count: number;
  slug: string;
  icon: string;
}

export interface CityCard {
  city: string;
  country: string | null;
  count: number;
  slug: string;
}

export interface IndustryCard {
  industry: string;
  count: number;
  slug: string;
  icon: string;
}

export interface JobTypeCard {
  job_type: string;
  label: string;
  count: number;
  slug: string;
  icon: string;
}

export interface ExperienceCard {
  experience_level: string;
  label: string;
  count: number;
  slug: string;
  icon: string;
}

export interface RemoteCard {
  type: 'remote' | 'onsite';
  label: string;
  count: number;
  slug: string;
  icon: string;
}

export interface CardsResponse<T> {
  success: boolean;
  cards: T[];
  generated_at: string;
}

export interface CountryCardsResponse extends CardsResponse<CountryCard> {
  total_countries: number;
}

export interface CityCardsResponse extends CardsResponse<CityCard> {
  total_cities: number;
  filter_country: string | null;
}

export interface IndustryCardsResponse extends CardsResponse<IndustryCard> {
  total_industries: number;
}

export interface JobTypeCardsResponse extends CardsResponse<JobTypeCard> {
  total_types: number;
}

export interface ExperienceCardsResponse extends CardsResponse<ExperienceCard> {
  total_levels: number;
}

export interface RemoteCardsResponse extends CardsResponse<RemoteCard> {
  total_jobs: number;
  remote_percentage: number;
}

export interface CardsSummaryResponse {
  success: boolean;
  countries: CountryCard[];
  cities: CityCard[];
  industries: IndustryCard[];
  job_types: JobTypeCard[];
  remote: RemoteCard[];
  stats: {
    total_countries: number;
    total_cities: number;
    total_industries: number;
    remote_percentage: number;
  };
  generated_at: string;
}
```

---

## API Client Functions

Create reusable API functions:

```typescript
// lib/api/jobs.ts
import { apiClient, serverApiClient } from '../api';
import type {
  SEOJobsResponse,
  SEOPatternsResponse,
  CountryCardsResponse,
  CityCardsResponse,
  IndustryCardsResponse,
  JobTypeCardsResponse,
  ExperienceCardsResponse,
  RemoteCardsResponse,
  CardsSummaryResponse,
} from '@/types/jobs';

// ============================================================================
// SEO Jobs API
// ============================================================================

/**
 * Fetch jobs by SEO slug
 * @example getJobsBySlug('jobs-in-bangalore')
 * @example getJobsBySlug('remote-python-developer-jobs')
 * @example getJobsBySlug('full-time-jobs-in-india')
 */
export async function getJobsBySlug(
  slug: string,
  options?: {
    limit?: number;
    offset?: number;
  },
  isServer = false
): Promise<SEOJobsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const params = new URLSearchParams();
  
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  
  const queryString = params.toString();
  const url = `/api/v1/jobs/by-slug/${slug}${queryString ? `?${queryString}` : ''}`;
  
  const response = await client.get<SEOJobsResponse>(url);
  return response.data;
}

/**
 * Fetch all SEO patterns for sitemap generation
 */
export async function getSEOPatterns(
  options?: {
    limit?: number;
    minJobs?: number;
  },
  isServer = false
): Promise<SEOPatternsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const params = new URLSearchParams();
  
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.minJobs) params.set('min_jobs', options.minJobs.toString());
  
  const response = await client.get<SEOPatternsResponse>(
    `/api/v1/jobs/seo-patterns?${params.toString()}`
  );
  return response.data;
}

// ============================================================================
// Job Cards API
// ============================================================================

/**
 * Fetch jobs grouped by country
 */
export async function getJobsByCountry(
  options?: { limit?: number; minJobs?: number },
  isServer = false
): Promise<CountryCardsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const params = new URLSearchParams();
  
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.minJobs) params.set('min_jobs', options.minJobs.toString());
  
  const response = await client.get<CountryCardsResponse>(
    `/api/v1/jobs/cards/by-country?${params.toString()}`
  );
  return response.data;
}

/**
 * Fetch jobs grouped by city
 */
export async function getJobsByCity(
  options?: { limit?: number; minJobs?: number; country?: string },
  isServer = false
): Promise<CityCardsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const params = new URLSearchParams();
  
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.minJobs) params.set('min_jobs', options.minJobs.toString());
  if (options?.country) params.set('country', options.country);
  
  const response = await client.get<CityCardsResponse>(
    `/api/v1/jobs/cards/by-city?${params.toString()}`
  );
  return response.data;
}

/**
 * Fetch jobs grouped by industry
 */
export async function getJobsByIndustry(
  options?: { limit?: number; minJobs?: number },
  isServer = false
): Promise<IndustryCardsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const params = new URLSearchParams();
  
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.minJobs) params.set('min_jobs', options.minJobs.toString());
  
  const response = await client.get<IndustryCardsResponse>(
    `/api/v1/jobs/cards/by-industry?${params.toString()}`
  );
  return response.data;
}

/**
 * Fetch jobs grouped by job type
 */
export async function getJobsByJobType(
  isServer = false
): Promise<JobTypeCardsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const response = await client.get<JobTypeCardsResponse>(
    '/api/v1/jobs/cards/by-job-type'
  );
  return response.data;
}

/**
 * Fetch jobs grouped by experience level
 */
export async function getJobsByExperience(
  isServer = false
): Promise<ExperienceCardsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const response = await client.get<ExperienceCardsResponse>(
    '/api/v1/jobs/cards/by-experience'
  );
  return response.data;
}

/**
 * Fetch remote vs on-site job stats
 */
export async function getRemoteJobsStats(
  isServer = false
): Promise<RemoteCardsResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const response = await client.get<RemoteCardsResponse>(
    '/api/v1/jobs/cards/remote'
  );
  return response.data;
}

/**
 * Fetch all cards summary in one request (optimized for homepage)
 */
export async function getCardsSummary(
  isServer = false
): Promise<CardsSummaryResponse> {
  const client = isServer ? serverApiClient : apiClient;
  const response = await client.get<CardsSummaryResponse>(
    '/api/v1/jobs/cards/summary'
  );
  return response.data;
}
```

---

## SEO Dynamic Routes

### App Router (Next.js 13+)

Create a catch-all dynamic route for SEO job pages:

```typescript
// app/[...slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJobsBySlug, getSEOPatterns } from '@/lib/api/jobs';
import JobListingPage from '@/components/jobs/JobListingPage';

interface Props {
  params: { slug: string[] };
  searchParams: { page?: string };
}

// Generate static paths for all SEO patterns
export async function generateStaticParams() {
  try {
    const patterns = await getSEOPatterns({ limit: 500, minJobs: 1 }, true);
    
    return patterns.patterns.map((pattern) => ({
      slug: pattern.slug.split('/').filter(Boolean),
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugPath = params.slug.join('/');
  
  try {
    const data = await getJobsBySlug(slugPath, { limit: 1 }, true);
    
    return {
      title: data.meta.title,
      description: data.meta.description,
      keywords: data.meta.keywords,
      alternates: {
        canonical: data.meta.canonical_url,
      },
      openGraph: {
        title: data.meta.title,
        description: data.meta.description,
        type: 'website',
        url: data.meta.canonical_url,
      },
    };
  } catch (error) {
    return {
      title: 'Jobs',
      description: 'Find your next job opportunity',
    };
  }
}

export default async function SEOJobPage({ params, searchParams }: Props) {
  const slugPath = params.slug.join('/');
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;
  
  try {
    const data = await getJobsBySlug(slugPath, { limit, offset }, true);
    
    if (!data.is_valid) {
      notFound();
    }
    
    return (
      <JobListingPage
        jobs={data.jobs}
        meta={data.meta}
        filters={data.filters_applied}
        pagination={data.pagination}
        fallbackApplied={data.fallback_applied}
        currentPage={page}
        slug={slugPath}
      />
    );
  } catch (error) {
    notFound();
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;
```

### Job Listing Page Component

```typescript
// components/jobs/JobListingPage.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Job, SEOFilters, SEOMeta } from '@/types/jobs';
import JobCard from './JobCard';
import Pagination from '../ui/Pagination';
import FilterBadges from './FilterBadges';

interface Props {
  jobs: Job[];
  meta: SEOMeta;
  filters: SEOFilters;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  fallbackApplied: 'state' | 'country' | null;
  currentPage: number;
  slug: string;
}

export default function JobListingPage({
  jobs,
  meta,
  filters,
  pagination,
  fallbackApplied,
  currentPage,
  slug,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* SEO H1 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {meta.h1}
      </h1>
      
      {/* Fallback notice */}
      {fallbackApplied && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            No jobs found in your selected city. Showing jobs from{' '}
            {fallbackApplied === 'state' ? 'the same state' : 'the same country'}.
          </p>
        </div>
      )}
      
      {/* Active filters */}
      <FilterBadges filters={filters} />
      
      {/* Job count */}
      <p className="text-gray-600 mb-6">
        Showing {jobs.length} of {pagination.total} jobs
      </p>
      
      {/* Job listings */}
      {jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
          <Link href="/jobs" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse all jobs
          </Link>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          baseUrl={`/${slug}`}
        />
      )}
    </div>
  );
}
```

### Job Card Component

```typescript
// components/jobs/JobCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Job } from '@/types/jobs';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  job: Job;
}

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
  temporary: 'Temporary',
};

export default function JobCard({ job }: Props) {
  const postedDate = new Date(job.posted_date);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });
  
  return (
    <Link
      href={`/job/${job.slug}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="flex-shrink-0">
          {job.company_logo_url ? (
            <Image
              src={job.company_logo_url}
              alt={job.company_name}
              width={48}
              height={48}
              className="rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xl font-bold">
                {job.company_name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Job title */}
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {job.title}
          </h3>
          
          {/* Company name */}
          <p className="text-gray-600 text-sm">{job.company_name}</p>
          
          {/* Location */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            {job.is_remote && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800">
                Remote
              </span>
            )}
            {job.location && <span>{job.location}</span>}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {job.job_type && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {jobTypeLabels[job.job_type] || job.job_type}
              </span>
            )}
            {job.salary_min && job.salary_max && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Posted date */}
          <p className="text-xs text-gray-400 mt-3">{timeAgo}</p>
        </div>
      </div>
    </Link>
  );
}
```

### Filter Badges Component

```typescript
// components/jobs/FilterBadges.tsx
import { SEOFilters } from '@/types/jobs';

interface Props {
  filters: SEOFilters;
}

export default function FilterBadges({ filters }: Props) {
  const badges: { label: string; value: string }[] = [];
  
  if (filters.country) badges.push({ label: 'Country', value: filters.country });
  if (filters.state) badges.push({ label: 'State', value: filters.state });
  if (filters.city) badges.push({ label: 'City', value: filters.city });
  if (filters.job_type) badges.push({ label: 'Type', value: filters.job_type.replace('_', ' ') });
  if (filters.is_remote) badges.push({ label: 'Work', value: 'Remote' });
  if (filters.industry) badges.push({ label: 'Industry', value: filters.industry });
  if (filters.experience_level) badges.push({ label: 'Level', value: filters.experience_level });
  if (filters.skill_keywords.length > 0) {
    badges.push({ label: 'Skills', value: filters.skill_keywords.join(', ') });
  }
  
  if (badges.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {badges.map((badge, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
        >
          <span className="font-medium mr-1">{badge.label}:</span>
          <span className="capitalize">{badge.value}</span>
        </span>
      ))}
    </div>
  );
}
```

---

## Job Cards Components

### Country Cards Component

```typescript
// components/cards/CountryCards.tsx
import Link from 'next/link';
import { CountryCard } from '@/types/jobs';

interface Props {
  cards: CountryCard[];
  title?: string;
}

export default function CountryCards({ cards, title = 'Jobs by Country' }: Props) {
  if (cards.length === 0) return null;
  
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <Link
            key={card.country}
            href={`/${card.slug}`}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <span className="text-2xl">{card.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{card.country}</p>
              <p className="text-sm text-gray-500">{card.count} jobs</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### City Cards Component

```typescript
// components/cards/CityCards.tsx
import Link from 'next/link';
import { CityCard } from '@/types/jobs';

interface Props {
  cards: CityCard[];
  title?: string;
}

export default function CityCards({ cards, title = 'Jobs by City' }: Props) {
  if (cards.length === 0) return null;
  
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={`${card.city}-${card.country}`}
            href={`/${card.slug}`}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <p className="font-medium text-gray-900">{card.city}</p>
            {card.country && (
              <p className="text-sm text-gray-500">{card.country}</p>
            )}
            <p className="text-sm text-blue-600 mt-1">{card.count} jobs</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### Industry Cards Component

```typescript
// components/cards/IndustryCards.tsx
import Link from 'next/link';
import { IndustryCard } from '@/types/jobs';

interface Props {
  cards: IndustryCard[];
  title?: string;
}

export default function IndustryCards({ cards, title = 'Jobs by Industry' }: Props) {
  if (cards.length === 0) return null;
  
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Link
            key={card.industry}
            href={`/${card.slug}`}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <span className="text-3xl">{card.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{card.industry}</p>
              <p className="text-sm text-gray-500">{card.count} jobs</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### Job Type Cards Component

```typescript
// components/cards/JobTypeCards.tsx
import Link from 'next/link';
import { JobTypeCard } from '@/types/jobs';

interface Props {
  cards: JobTypeCard[];
  title?: string;
}

export default function JobTypeCards({ cards, title = 'Jobs by Type' }: Props) {
  if (cards.length === 0) return null;
  
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="flex flex-wrap gap-4">
        {cards.map((card) => (
          <Link
            key={card.job_type}
            href={`/${card.slug}`}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <span className="text-xl">{card.icon}</span>
            <span className="font-medium text-gray-900">{card.label}</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {card.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### Remote Stats Component

```typescript
// components/cards/RemoteStats.tsx
import Link from 'next/link';
import { RemoteCard } from '@/types/jobs';

interface Props {
  cards: RemoteCard[];
  remotePercentage: number;
  title?: string;
}

export default function RemoteStats({ cards, remotePercentage, title = 'Work Location' }: Props) {
  if (cards.length === 0) return null;
  
  const remoteCard = cards.find((c) => c.type === 'remote');
  const onsiteCard = cards.find((c) => c.type === 'onsite');
  
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Remote: {remotePercentage}%</span>
            <span>On-site: {(100 - remotePercentage).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              style={{ width: `${remotePercentage}%` }}
            />
          </div>
        </div>
        
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          {remoteCard && (
            <Link
              href={`/${remoteCard.slug}`}
              className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-3xl">{remoteCard.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{remoteCard.label}</p>
                <p className="text-green-700">{remoteCard.count} jobs</p>
              </div>
            </Link>
          )}
          
          {onsiteCard && (
            <Link
              href={`/${onsiteCard.slug}`}
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-3xl">{onsiteCard.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{onsiteCard.label}</p>
                <p className="text-blue-700">{onsiteCard.count} jobs</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
```

---

## Homepage Integration

### Full Homepage Example

```typescript
// app/page.tsx
import { getCardsSummary } from '@/lib/api/jobs';
import CountryCards from '@/components/cards/CountryCards';
import CityCards from '@/components/cards/CityCards';
import IndustryCards from '@/components/cards/IndustryCards';
import JobTypeCards from '@/components/cards/JobTypeCards';
import RemoteStats from '@/components/cards/RemoteStats';
import HeroSection from '@/components/home/HeroSection';

export default async function HomePage() {
  // Fetch all card data in one request
  const summary = await getCardsSummary(true);
  
  return (
    <main>
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Remote vs On-site stats */}
        <RemoteStats
          cards={summary.remote}
          remotePercentage={summary.stats.remote_percentage}
        />
        
        {/* Job types */}
        <JobTypeCards cards={summary.job_types} />
        
        {/* Countries */}
        <CountryCards cards={summary.countries} />
        
        {/* Cities */}
        <CityCards cards={summary.cities} />
        
        {/* Industries */}
        <IndustryCards cards={summary.industries} />
        
        {/* Stats summary */}
        <section className="py-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-blue-600">
                {summary.stats.total_countries}
              </p>
              <p className="text-gray-600">Countries</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-blue-600">
                {summary.stats.total_cities}
              </p>
              <p className="text-gray-600">Cities</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-blue-600">
                {summary.stats.total_industries}
              </p>
              <p className="text-gray-600">Industries</p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-green-600">
                {summary.stats.remote_percentage}%
              </p>
              <p className="text-gray-600">Remote Jobs</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Revalidate homepage every 5 minutes
export const revalidate = 300;
```

### Using SWR for Client-Side Data Fetching

```typescript
// hooks/useJobCards.ts
import useSWR from 'swr';
import {
  getCardsSummary,
  getJobsByCountry,
  getJobsByCity,
  getJobsByIndustry,
} from '@/lib/api/jobs';
import type { CardsSummaryResponse } from '@/types/jobs';

export function useCardsSummary() {
  return useSWR<CardsSummaryResponse>(
    'cards-summary',
    () => getCardsSummary(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
}

export function useCountryCards(limit = 10) {
  return useSWR(
    ['cards-country', limit],
    () => getJobsByCountry({ limit }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}

export function useCityCards(options?: { limit?: number; country?: string }) {
  return useSWR(
    ['cards-city', options],
    () => getJobsByCity(options),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}

export function useIndustryCards(limit = 10) {
  return useSWR(
    ['cards-industry', limit],
    () => getJobsByIndustry({ limit }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}
```

### Client Component Example

```typescript
// components/home/DynamicCards.tsx
'use client';

import { useCardsSummary } from '@/hooks/useJobCards';
import CountryCards from '@/components/cards/CountryCards';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function DynamicCards() {
  const { data, isLoading, error } = useCardsSummary();
  
  if (isLoading) {
    return <LoadingSkeleton type="cards" count={6} />;
  }
  
  if (error || !data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load job statistics
      </div>
    );
  }
  
  return (
    <div>
      <CountryCards cards={data.countries} />
    </div>
  );
}
```

---

## Sitemap Generation

### Dynamic Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getSEOPatterns } from '@/lib/api/jobs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://previewcv.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];
  
  // Dynamic SEO pages from API
  try {
    const patterns = await getSEOPatterns({ limit: 1000, minJobs: 1 }, true);
    
    const seoPages: MetadataRoute.Sitemap = patterns.patterns.map((pattern) => ({
      url: `${baseUrl}/${pattern.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
    
    return [...staticPages, ...seoPages];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return staticPages;
  }
}
```

### Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://previewcv.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## Caching Strategies

### Next.js Caching Options

```typescript
// For static generation with periodic revalidation
export const revalidate = 300; // 5 minutes

// For on-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache';

// In an API route or server action:
export async function revalidateJobPages() {
  revalidatePath('/jobs-in-[country]', 'page');
  revalidateTag('jobs');
}
```

### Fetch with Cache Tags

```typescript
// lib/api/jobs.ts
export async function getJobsBySlugCached(slug: string) {
  const response = await fetch(
    `${process.env.API_URL}/api/v1/jobs/by-slug/${slug}`,
    {
      next: {
        revalidate: 300, // 5 minutes
        tags: ['jobs', `jobs-${slug}`],
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  
  return response.json();
}
```

---

## Complete Examples

### Example 1: Browse Jobs by Location Page

```typescript
// app/browse/locations/page.tsx
import Link from 'next/link';
import { getJobsByCountry, getJobsByCity } from '@/lib/api/jobs';

export const metadata = {
  title: 'Browse Jobs by Location',
  description: 'Find jobs in your preferred city or country',
};

export default async function BrowseLocationsPage() {
  const [countries, cities] = await Promise.all([
    getJobsByCountry({ limit: 20 }, true),
    getJobsByCity({ limit: 24 }, true),
  ]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Jobs by Location</h1>
      
      {/* Countries */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Countries</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {countries.cards.map((country) => (
            <Link
              key={country.country}
              href={`/${country.slug}`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition"
            >
              <span className="text-2xl">{country.icon}</span>
              <div>
                <p className="font-medium">{country.country}</p>
                <p className="text-sm text-gray-500">{country.count} jobs</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Cities */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Popular Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cities.cards.map((city) => (
            <Link
              key={`${city.city}-${city.country}`}
              href={`/${city.slug}`}
              className="p-4 bg-white rounded-lg border hover:shadow-md transition"
            >
              <p className="font-medium">{city.city}</p>
              <p className="text-sm text-gray-500">{city.country}</p>
              <p className="text-sm text-blue-600">{city.count} jobs</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export const revalidate = 600; // 10 minutes
```

### Example 2: Search Suggestions Component

```typescript
// components/search/SearchSuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCardsSummary } from '@/hooks/useJobCards';

interface Props {
  query: string;
  onSelect?: () => void;
}

export default function SearchSuggestions({ query, onSelect }: Props) {
  const { data } = useCardsSummary();
  const [suggestions, setSuggestions] = useState<
    Array<{ label: string; slug: string; type: string }>
  >([]);
  
  useEffect(() => {
    if (!data || !query.trim()) {
      setSuggestions([]);
      return;
    }
    
    const q = query.toLowerCase();
    const results: Array<{ label: string; slug: string; type: string }> = [];
    
    // Search countries
    data.countries.forEach((c) => {
      if (c.country.toLowerCase().includes(q)) {
        results.push({
          label: `Jobs in ${c.country}`,
          slug: c.slug,
          type: 'country',
        });
      }
    });
    
    // Search cities
    data.cities.forEach((c) => {
      if (c.city.toLowerCase().includes(q)) {
        results.push({
          label: `Jobs in ${c.city}`,
          slug: c.slug,
          type: 'city',
        });
      }
    });
    
    // Search industries
    data.industries.forEach((i) => {
      if (i.industry.toLowerCase().includes(q)) {
        results.push({
          label: `${i.industry} Jobs`,
          slug: i.slug,
          type: 'industry',
        });
      }
    });
    
    setSuggestions(results.slice(0, 8));
  }, [query, data]);
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border mt-2 z-50">
      {suggestions.map((suggestion, index) => (
        <Link
          key={index}
          href={`/${suggestion.slug}`}
          onClick={onSelect}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
        >
          <span>{suggestion.label}</span>
          <span className="text-xs text-gray-400 capitalize">
            {suggestion.type}
          </span>
        </Link>
      ))}
    </div>
  );
}
```

### Example 3: Mobile-Friendly Filter Chips

```typescript
// components/jobs/FilterChips.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCardsSummary } from '@/hooks/useJobCards';

export default function FilterChips() {
  const pathname = usePathname();
  const { data, isLoading } = useCardsSummary();
  
  if (isLoading || !data) {
    return (
      <div className="flex gap-2 overflow-x-auto py-4 px-4 -mx-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }
  
  const chips = [
    { label: 'Remote', slug: 'remote-jobs', icon: '🏠' },
    ...data.job_types.map((jt) => ({
      label: jt.label,
      slug: jt.slug,
      icon: jt.icon,
    })),
    ...data.countries.slice(0, 3).map((c) => ({
      label: c.country,
      slug: c.slug,
      icon: c.icon,
    })),
  ];
  
  return (
    <div className="flex gap-2 overflow-x-auto py-4 px-4 -mx-4 scrollbar-hide">
      {chips.map((chip) => {
        const isActive = pathname === `/${chip.slug}`;
        return (
          <Link
            key={chip.slug}
            href={`/${chip.slug}`}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
              flex-shrink-0 transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
```

---

## Error Handling

### Error Boundary for Job Pages

```typescript
// app/[...slug]/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Job page error:', error);
  }, [error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t load the jobs you&apos;re looking for.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try again
          </button>
          <Link
            href="/jobs"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Browse all jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Not Found Page

```typescript
// app/[...slug]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The job listing you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/jobs"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse all jobs
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Testing

### Example Test for API Functions

```typescript
// __tests__/lib/api/jobs.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getJobsBySlug, getCardsSummary } from '@/lib/api/jobs';

describe('Jobs API', () => {
  it('should fetch jobs by slug', async () => {
    const data = await getJobsBySlug('remote-jobs', { limit: 5 });
    
    expect(data.success).toBe(true);
    expect(data.slug).toBe('remote-jobs');
    expect(data.filters_applied.is_remote).toBe(true);
    expect(Array.isArray(data.jobs)).toBe(true);
  });
  
  it('should fetch cards summary', async () => {
    const data = await getCardsSummary();
    
    expect(data.success).toBe(true);
    expect(Array.isArray(data.countries)).toBe(true);
    expect(Array.isArray(data.cities)).toBe(true);
    expect(Array.isArray(data.industries)).toBe(true);
    expect(typeof data.stats.remote_percentage).toBe('number');
  });
});
```

---

## Summary

This guide covers:

1. **Type definitions** for all API responses
2. **API client functions** for both server and client-side fetching
3. **Dynamic SEO routes** with metadata generation
4. **Reusable card components** for countries, cities, industries, etc.
5. **Homepage integration** with the summary endpoint
6. **Sitemap generation** from SEO patterns
7. **Caching strategies** for optimal performance
8. **Error handling** with fallback UI
9. **SWR hooks** for client-side data fetching

### Key URLs for Testing

```
# SEO Job Pages
/jobs-in-india
/remote-jobs
/full-time-jobs-in-united-states
/python-developer-jobs-in-bangalore

# API Endpoints
GET /api/v1/jobs/cards/summary
GET /api/v1/jobs/by-slug/remote-jobs
GET /api/v1/jobs/seo-patterns
```

### Performance Tips

1. Use the `/cards/summary` endpoint on homepage instead of multiple calls
2. Enable ISR (Incremental Static Regeneration) with `revalidate`
3. Use SWR for client-side caching
4. Leverage Next.js fetch cache with tags for granular invalidation
