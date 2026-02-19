# Next.js Integration Guide: Masters GraphQL API

Complete guide for consuming the `/masters-graphql` endpoint in Next.js applications using REST clients (fetch/axios).

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Query Examples by Category](#query-examples-by-category)
  - [Job & Career Data](#job--career-data)
  - [Industry & Company Data](#industry--company-data)
  - [Skills Data](#skills-data)
  - [Education Data](#education-data)
  - [Language & Nationality Data](#language--nationality-data)
  - [Location Data](#location-data)
  - [Autocomplete](#autocomplete)
- [TypeScript Types](#typescript-types)
- [Advanced Patterns](#advanced-patterns)
- [Error Handling](#error-handling)
- [Caching Strategies](#caching-strategies)

---

## Overview

The `/masters-graphql` endpoint provides read-only access to all master data including:
- 48 Query operations
- 15 Master data tables
- Full location services
- Autocomplete functionality
- No authentication required

**Endpoint URL:** `http://localhost:3000/masters-graphql`

---

## Setup

### 1. Create GraphQL Client Utility

Create a reusable GraphQL client that works with standard fetch:

```typescript
// lib/graphql-client.ts

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_MASTERS_GRAPHQL_URL || 'http://localhost:3000/masters-graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  if (!result.data) {
    throw new Error('No data returned from GraphQL query');
  }

  return result.data;
}
```

### 2. Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_MASTERS_GRAPHQL_URL=http://localhost:3000/masters-graphql
```

---

## Basic Usage

### Client Component Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { graphqlRequest } from '@/lib/graphql-client';

export default function JobTitlesExample() {
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const query = `
          query GetJobTitles {
            jobTitles(limit: 10) {
              id
              title
              category
              isActive
            }
          }
        `;

        const data = await graphqlRequest<{ jobTitles: any[] }>(query);
        setJobTitles(data.jobTitles);
      } catch (error) {
        console.error('Error fetching job titles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTitles();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {jobTitles.map((job: any) => (
        <li key={job.id}>{job.title} - {job.category}</li>
      ))}
    </ul>
  );
}
```

### Server Component Example (App Router)

```typescript
// app/jobs/page.tsx

import { graphqlRequest } from '@/lib/graphql-client';

interface JobTitle {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
}

async function getJobTitles() {
  const query = `
    query GetJobTitles {
      jobTitles(limit: 20, activeOnly: true) {
        id
        title
        category
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ jobTitles: JobTitle[] }>(query);
  return data.jobTitles;
}

export default async function JobsPage() {
  const jobTitles = await getJobTitles();

  return (
    <div>
      <h1>Available Job Titles</h1>
      <ul>
        {jobTitles.map((job) => (
          <li key={job.id}>{job.title} - {job.category}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Query Examples by Category

### Job & Career Data

#### 1. Get All Job Titles

```typescript
// services/job-titles.service.ts

export async function getJobTitles(category?: string, activeOnly = true, limit = 100) {
  const query = `
    query GetJobTitles($category: String, $activeOnly: Boolean, $limit: Int) {
      jobTitles(category: $category, activeOnly: $activeOnly, limit: $limit) {
        id
        title
        category
        alternativeTitles
        isActive
        createdAt
        updatedAt
      }
    }
  `;

  const data = await graphqlRequest<{ jobTitles: any[] }>(query, {
    category,
    activeOnly,
    limit,
  });

  return data.jobTitles;
}

// Usage in component:
// const titles = await getJobTitles('Engineering');
```

#### 2. Search Job Titles

```typescript
export async function searchJobTitles(searchTerm: string, limit = 10) {
  const query = `
    query SearchJobTitles($searchTerm: String!, $limit: Int) {
      searchJobTitles(searchTerm: $searchTerm, limit: $limit) {
        id
        title
        category
        alternativeTitles
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ searchJobTitles: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchJobTitles;
}

// Usage:
// const results = await searchJobTitles('software engineer');
```

#### 3. Get Job Descriptions by Title

```typescript
export async function getJobDescriptionsByTitle(jobTitleId: number, activeOnly = true) {
  const query = `
    query GetJobDescriptions($jobTitleId: Int!, $activeOnly: Boolean) {
      jobDescriptionsByTitle(jobTitleId: $jobTitleId, activeOnly: $activeOnly) {
        id
        description
        experienceLevel
        industryContext
        jobTitle {
          id
          title
          category
        }
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ jobDescriptionsByTitle: any[] }>(query, {
    jobTitleId,
    activeOnly,
  });

  return data.jobDescriptionsByTitle;
}

// Usage:
// const descriptions = await getJobDescriptionsByTitle(123);
```

#### 4. Search Job Descriptions

```typescript
export async function searchJobDescriptions(params: {
  searchTerm?: string;
  jobTitleId?: number;
  experienceLevel?: string;
  industryContext?: string;
  limit?: number;
}) {
  const query = `
    query SearchJobDescriptions(
      $searchTerm: String
      $jobTitleId: Int
      $experienceLevel: String
      $industryContext: String
      $limit: Int
    ) {
      searchJobDescriptions(
        searchTerm: $searchTerm
        jobTitleId: $jobTitleId
        experienceLevel: $experienceLevel
        industryContext: $industryContext
        limit: $limit
      ) {
        id
        description
        experienceLevel
        industryContext
        jobTitle {
          id
          title
        }
      }
    }
  `;

  const data = await graphqlRequest<{ searchJobDescriptions: any[] }>(query, params);
  return data.searchJobDescriptions;
}

// Usage:
// const descriptions = await searchJobDescriptions({
//   searchTerm: 'develop software',
//   experienceLevel: 'Senior',
//   limit: 5
// });
```

#### 5. Get Work Statuses

```typescript
export async function getWorkStatuses(activeOnly = true) {
  const query = `
    query GetWorkStatuses($activeOnly: Boolean) {
      workStatuses(activeOnly: $activeOnly) {
        id
        statusName
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ workStatuses: any[] }>(query, { activeOnly });
  return data.workStatuses;
}

// Usage:
// const statuses = await getWorkStatuses();
```

#### 6. Get Job Types

```typescript
export async function getJobTypes(activeOnly = true) {
  const query = `
    query GetJobTypes($activeOnly: Boolean) {
      jobTypes(activeOnly: $activeOnly) {
        id
        typeName
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ jobTypes: any[] }>(query, { activeOnly });
  return data.jobTypes;
}

// Usage:
// const types = await getJobTypes();
```

---

### Industry & Company Data

#### 7. Get Industries

```typescript
export async function getIndustries(category?: string, activeOnly = true) {
  const query = `
    query GetIndustries($category: String, $activeOnly: Boolean) {
      industries(category: $category, activeOnly: $activeOnly) {
        id
        name
        category
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ industries: any[] }>(query, {
    category,
    activeOnly,
  });

  return data.industries;
}

// Usage:
// const industries = await getIndustries('Technology');
```

#### 8. Search Industries

```typescript
export async function searchIndustries(searchTerm: string, limit = 10) {
  const query = `
    query SearchIndustries($searchTerm: String!, $limit: Int) {
      searchIndustries(searchTerm: $searchTerm, limit: $limit) {
        id
        name
        category
        description
      }
    }
  `;

  const data = await graphqlRequest<{ searchIndustries: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchIndustries;
}

// Usage:
// const results = await searchIndustries('finance');
```

#### 9. Get Companies

```typescript
export async function getCompanies(activeOnly = true, limit = 100) {
  const query = `
    query GetCompanies($activeOnly: Boolean, $limit: Int) {
      companies(activeOnly: $activeOnly, limit: $limit) {
        id
        name
        industryId
        website
        description
        isVerified
        isActive
        companyType {
          id
          typeName
        }
      }
    }
  `;

  const data = await graphqlRequest<{ companies: any[] }>(query, {
    activeOnly,
    limit,
  });

  return data.companies;
}

// Usage:
// const companies = await getCompanies(true, 50);
```

#### 10. Search Companies

```typescript
export async function searchCompanies(
  searchTerm: string,
  verifiedOnly = false,
  limit = 10
) {
  const query = `
    query SearchCompanies($searchTerm: String!, $verifiedOnly: Boolean, $limit: Int) {
      searchCompanies(
        searchTerm: $searchTerm
        verifiedOnly: $verifiedOnly
        limit: $limit
      ) {
        id
        name
        website
        description
        isVerified
        companyType {
          id
          typeName
        }
      }
    }
  `;

  const data = await graphqlRequest<{ searchCompanies: any[] }>(query, {
    searchTerm,
    verifiedOnly,
    limit,
  });

  return data.searchCompanies;
}

// Usage:
// const results = await searchCompanies('google', true, 5);
```

#### 11. Get Company Types

```typescript
export async function getCompanyTypes(activeOnly = true) {
  const query = `
    query GetCompanyTypes($activeOnly: Boolean) {
      companyTypes(activeOnly: $activeOnly) {
        id
        typeName
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ companyTypes: any[] }>(query, { activeOnly });
  return data.companyTypes;
}

// Usage:
// const types = await getCompanyTypes();
```

---

### Skills Data

#### 12. Get Skill Categories

```typescript
export async function getSkillCategories(activeOnly = true) {
  const query = `
    query GetSkillCategories($activeOnly: Boolean) {
      skillCategories(activeOnly: $activeOnly) {
        id
        name
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ skillCategories: any[] }>(query, { activeOnly });
  return data.skillCategories;
}

// Usage:
// const categories = await getSkillCategories();
```

#### 13. Get Skills by Category

```typescript
export async function getSkillsByCategory(categoryId: number, activeOnly = true) {
  const query = `
    query GetSkillsByCategory($categoryId: Int!, $activeOnly: Boolean) {
      skillsByCategory(categoryId: $categoryId, activeOnly: $activeOnly) {
        id
        skillName
        isTechnical
        isHardSkill
        category {
          id
          name
        }
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ skillsByCategory: any[] }>(query, {
    categoryId,
    activeOnly,
  });

  return data.skillsByCategory;
}

// Usage:
// const skills = await getSkillsByCategory(1);
```

#### 14. Search Skills

```typescript
export async function searchSkills(
  searchTerm: string,
  technicalOnly = false,
  limit = 10
) {
  const query = `
    query SearchSkills($searchTerm: String!, $technicalOnly: Boolean, $limit: Int) {
      searchSkills(
        searchTerm: $searchTerm
        technicalOnly: $technicalOnly
        limit: $limit
      ) {
        id
        skillName
        isTechnical
        isHardSkill
        category {
          id
          name
        }
      }
    }
  `;

  const data = await graphqlRequest<{ searchSkills: any[] }>(query, {
    searchTerm,
    technicalOnly,
    limit,
  });

  return data.searchSkills;
}

// Usage:
// const results = await searchSkills('javascript', true);
```

#### 15. Get Technical Skills Only

```typescript
export async function getTechnicalSkills(activeOnly = true, limit = 100) {
  const query = `
    query GetTechnicalSkills($activeOnly: Boolean, $limit: Int) {
      technicalSkills(activeOnly: $activeOnly, limit: $limit) {
        id
        skillName
        isTechnical
        category {
          id
          name
        }
      }
    }
  `;

  const data = await graphqlRequest<{ technicalSkills: any[] }>(query, {
    activeOnly,
    limit,
  });

  return data.technicalSkills;
}

// Usage:
// const techSkills = await getTechnicalSkills();
```

#### 16. Get Soft Skills Only

```typescript
export async function getSoftSkills(activeOnly = true, limit = 100) {
  const query = `
    query GetSoftSkills($activeOnly: Boolean, $limit: Int) {
      softSkills(activeOnly: $activeOnly, limit: $limit) {
        id
        skillName
        isTechnical
        category {
          id
          name
        }
      }
    }
  `;

  const data = await graphqlRequest<{ softSkills: any[] }>(query, {
    activeOnly,
    limit,
  });

  return data.softSkills;
}

// Usage:
// const softSkills = await getSoftSkills();
```

---

### Education Data

#### 17. Get Fields of Study

```typescript
export async function getFieldsOfStudy(category?: string, activeOnly = true) {
  const query = `
    query GetFieldsOfStudy($category: String, $activeOnly: Boolean) {
      fieldsOfStudy(category: $category, activeOnly: $activeOnly) {
        id
        fieldName
        category
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ fieldsOfStudy: any[] }>(query, {
    category,
    activeOnly,
  });

  return data.fieldsOfStudy;
}

// Usage:
// const fields = await getFieldsOfStudy('Engineering');
```

#### 18. Search Fields of Study

```typescript
export async function searchFieldsOfStudy(searchTerm: string, limit = 10) {
  const query = `
    query SearchFieldsOfStudy($searchTerm: String!, $limit: Int) {
      searchFieldsOfStudy(searchTerm: $searchTerm, limit: $limit) {
        id
        fieldName
        category
        description
      }
    }
  `;

  const data = await graphqlRequest<{ searchFieldsOfStudy: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchFieldsOfStudy;
}

// Usage:
// const results = await searchFieldsOfStudy('computer science');
```

#### 19. Get Degrees

```typescript
export async function getDegrees(degreeType?: string, activeOnly = true) {
  const query = `
    query GetDegrees($degreeType: String, $activeOnly: Boolean) {
      degrees(degreeType: $degreeType, activeOnly: $activeOnly) {
        id
        degreeName
        degreeType
        description
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ degrees: any[] }>(query, {
    degreeType,
    activeOnly,
  });

  return data.degrees;
}

// Usage:
// const degrees = await getDegrees('Bachelor');
```

#### 20. Search Degrees

```typescript
export async function searchDegrees(searchTerm: string, limit = 10) {
  const query = `
    query SearchDegrees($searchTerm: String!, $limit: Int) {
      searchDegrees(searchTerm: $searchTerm, limit: $limit) {
        id
        degreeName
        degreeType
        description
      }
    }
  `;

  const data = await graphqlRequest<{ searchDegrees: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchDegrees;
}

// Usage:
// const results = await searchDegrees('master');
```

#### 21. Get Institutions

```typescript
export async function getInstitutions(activeOnly = true, limit = 100) {
  const query = `
    query GetInstitutions($activeOnly: Boolean, $limit: Int) {
      institutions(activeOnly: $activeOnly, limit: $limit) {
        id
        name
        institutionType
        countryCode
        website
        isVerified
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ institutions: any[] }>(query, {
    activeOnly,
    limit,
  });

  return data.institutions;
}

// Usage:
// const institutions = await getInstitutions(true, 50);
```

#### 22. Search Institutions

```typescript
export async function searchInstitutions(
  searchTerm: string,
  institutionType?: string,
  verifiedOnly = false,
  limit = 10
) {
  const query = `
    query SearchInstitutions(
      $searchTerm: String!
      $institutionType: String
      $verifiedOnly: Boolean
      $limit: Int
    ) {
      searchInstitutions(
        searchTerm: $searchTerm
        institutionType: $institutionType
        verifiedOnly: $verifiedOnly
        limit: $limit
      ) {
        id
        name
        institutionType
        countryCode
        website
        isVerified
      }
    }
  `;

  const data = await graphqlRequest<{ searchInstitutions: any[] }>(query, {
    searchTerm,
    institutionType,
    verifiedOnly,
    limit,
  });

  return data.searchInstitutions;
}

// Usage:
// const results = await searchInstitutions('harvard', 'University', true);
```

---

### Language & Nationality Data

#### 23. Get Language Levels

```typescript
export async function getLanguageLevels(activeOnly = true) {
  const query = `
    query GetLanguageLevels($activeOnly: Boolean) {
      languageLevels(activeOnly: $activeOnly) {
        id
        levelName
        description
        displayOrder
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ languageLevels: any[] }>(query, { activeOnly });
  return data.languageLevels;
}

// Usage:
// const levels = await getLanguageLevels();
```

#### 24. Get Languages

```typescript
export async function getLanguages(activeOnly = true) {
  const query = `
    query GetLanguages($activeOnly: Boolean) {
      languages(activeOnly: $activeOnly) {
        id
        languageName
        nativeName
        iso6391Code
        iso6392Code
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ languages: any[] }>(query, { activeOnly });
  return data.languages;
}

// Usage:
// const languages = await getLanguages();
```

#### 25. Search Languages

```typescript
export async function searchLanguages(searchTerm: string, limit = 10) {
  const query = `
    query SearchLanguages($searchTerm: String!, $limit: Int) {
      searchLanguages(searchTerm: $searchTerm, limit: $limit) {
        id
        languageName
        nativeName
        iso6391Code
        iso6392Code
      }
    }
  `;

  const data = await graphqlRequest<{ searchLanguages: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchLanguages;
}

// Usage:
// const results = await searchLanguages('span');
```

#### 26. Get Nationalities

```typescript
export async function getNationalities(activeOnly = true) {
  const query = `
    query GetNationalities($activeOnly: Boolean) {
      nationalities(activeOnly: $activeOnly) {
        id
        nationalityName
        countryCode
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ nationalities: any[] }>(query, { activeOnly });
  return data.nationalities;
}

// Usage:
// const nationalities = await getNationalities();
```

#### 27. Search Nationalities

```typescript
export async function searchNationalities(searchTerm: string, limit = 10) {
  const query = `
    query SearchNationalities($searchTerm: String!, $limit: Int) {
      searchNationalities(searchTerm: $searchTerm, limit: $limit) {
        id
        nationalityName
        countryCode
      }
    }
  `;

  const data = await graphqlRequest<{ searchNationalities: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchNationalities;
}

// Usage:
// const results = await searchNationalities('amer');
```

---

### Location Data

#### 28. Get All Countries

```typescript
export async function getCountries(activeOnly = true) {
  const query = `
    query GetCountries($activeOnly: Boolean) {
      countries(activeOnly: $activeOnly) {
        code
        name
        nativeName
        iso3Code
        phoneCode
        currency
        capital
        region
        subregion
        latitude
        longitude
        flagEmoji
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ countries: any[] }>(query, { activeOnly });
  return data.countries;
}

// Usage:
// const countries = await getCountries();
```

#### 29. Get Specific Country

```typescript
export async function getCountry(code: string) {
  const query = `
    query GetCountry($code: String!) {
      country(code: $code) {
        code
        name
        nativeName
        iso3Code
        phoneCode
        currency
        capital
        region
        subregion
        latitude
        longitude
        flagEmoji
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ country: any }>(query, { code });
  return data.country;
}

// Usage:
// const country = await getCountry('US');
```

#### 30. Get States by Country

```typescript
export async function getStatesByCountry(countryCode: string, activeOnly = true) {
  const query = `
    query GetStatesByCountry($countryCode: String!, $activeOnly: Boolean) {
      statesByCountry(countryCode: $countryCode, activeOnly: $activeOnly) {
        id
        code
        name
        countryCode
        latitude
        longitude
        isActive
      }
    }
  `;

  const data = await graphqlRequest<{ statesByCountry: any[] }>(query, {
    countryCode,
    activeOnly,
  });

  return data.statesByCountry;
}

// Usage:
// const states = await getStatesByCountry('US');
```

#### 31. Search Countries

```typescript
export async function searchCountries(searchTerm: string, limit = 10) {
  const query = `
    query SearchCountries($searchTerm: String!, $limit: Int) {
      searchCountries(searchTerm: $searchTerm, limit: $limit) {
        code
        name
        nativeName
        iso3Code
        flagEmoji
      }
    }
  `;

  const data = await graphqlRequest<{ searchCountries: any[] }>(query, {
    searchTerm,
    limit,
  });

  return data.searchCountries;
}

// Usage:
// const results = await searchCountries('united');
```

#### 32. Search States

```typescript
export async function searchStates(
  countryCode: string,
  searchTerm: string,
  limit = 10
) {
  const query = `
    query SearchStates($countryCode: String!, $searchTerm: String!, $limit: Int) {
      searchStates(countryCode: $countryCode, searchTerm: $searchTerm, limit: $limit) {
        id
        code
        name
        countryCode
      }
    }
  `;

  const data = await graphqlRequest<{ searchStates: any[] }>(query, {
    countryCode,
    searchTerm,
    limit,
  });

  return data.searchStates;
}

// Usage:
// const results = await searchStates('US', 'calif');
```

#### 33. Search Cities

```typescript
export async function searchCities(
  countryCode: string,
  stateCode?: string,
  searchTerm?: string,
  limit = 10
) {
  const query = `
    query SearchCities(
      $countryCode: String!
      $stateCode: String
      $searchTerm: String
      $limit: Int
    ) {
      searchCities(
        countryCode: $countryCode
        stateCode: $stateCode
        searchTerm: $searchTerm
        limit: $limit
      ) {
        id
        name
        stateCode
        countryCode
        latitude
        longitude
        population
      }
    }
  `;

  const data = await graphqlRequest<{ searchCities: any[] }>(query, {
    countryCode,
    stateCode,
    searchTerm,
    limit,
  });

  return data.searchCities;
}

// Usage:
// const results = await searchCities('US', 'CA', 'san');
```

#### 34. Get Major Cities

```typescript
export async function getMajorCities(countryCode: string, limit = 20) {
  const query = `
    query GetMajorCities($countryCode: String!, $limit: Int) {
      majorCities(countryCode: $countryCode, limit: $limit) {
        id
        name
        stateCode
        countryCode
        latitude
        longitude
        population
      }
    }
  `;

  const data = await graphqlRequest<{ majorCities: any[] }>(query, {
    countryCode,
    limit,
  });

  return data.majorCities;
}

// Usage:
// const cities = await getMajorCities('US', 10);
```

#### 35. Validate Postal Code

```typescript
export async function validatePostalCode(postalCode: string, countryCode: string) {
  const query = `
    query ValidatePostalCode($postalCode: String!, $countryCode: String!) {
      validatePostalCode(postalCode: $postalCode, countryCode: $countryCode) {
        isValid
        message
        format
        example
      }
    }
  `;

  const data = await graphqlRequest<{ validatePostalCode: any }>(query, {
    postalCode,
    countryCode,
  });

  return data.validatePostalCode;
}

// Usage:
// const validation = await validatePostalCode('90210', 'US');
```

#### 36. Get Postal Code Info

```typescript
export async function getPostalCodeInfo(postalCode: string, countryCode: string) {
  const query = `
    query GetPostalCodeInfo($postalCode: String!, $countryCode: String!) {
      postalCodeInfo(postalCode: $postalCode, countryCode: $countryCode) {
        postalCode
        city
        state
        stateCode
        country
        countryCode
        latitude
        longitude
      }
    }
  `;

  const data = await graphqlRequest<{ postalCodeInfo: any }>(query, {
    postalCode,
    countryCode,
  });

  return data.postalCodeInfo;
}

// Usage:
// const info = await getPostalCodeInfo('10001', 'US');
```

---

### Autocomplete

#### 37. Master Data Autocomplete (All Types)

```typescript
export async function autocomplete(searchTerm: string, limit = 5) {
  const query = `
    query Autocomplete($searchTerm: String!, $limit: Int) {
      autocomplete(searchTerm: $searchTerm, limit: $limit) {
        jobTitles {
          id
          name
          type
        }
        skills {
          id
          name
          type
        }
        companies {
          id
          name
          type
        }
        industries {
          id
          name
          type
        }
        fieldsOfStudy {
          id
          name
          type
        }
      }
    }
  `;

  const data = await graphqlRequest<{ autocomplete: any }>(query, {
    searchTerm,
    limit,
  });

  return data.autocomplete;
}

// Usage:
// const results = await autocomplete('soft');
```

#### 38. Location Autocomplete

```typescript
export async function autocompleteLocation(searchTerm: string, limit = 5) {
  const query = `
    query AutocompleteLocation($searchTerm: String!, $limit: Int) {
      autocompleteLocation(searchTerm: $searchTerm, limit: $limit) {
        countries {
          id
          name
          type
        }
        states {
          id
          name
          type
        }
        cities {
          id
          name
          type
        }
      }
    }
  `;

  const data = await graphqlRequest<{ autocompleteLocation: any }>(query, {
    searchTerm,
    limit,
  });

  return data.autocompleteLocation;
}

// Usage:
// const results = await autocompleteLocation('san');
```

---

## TypeScript Types

Create comprehensive type definitions:

```typescript
// types/masters.types.ts

export interface JobTitle {
  id: number;
  title: string;
  category: string;
  alternativeTitles?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: number;
  description: string;
  experienceLevel?: string;
  industryContext?: string;
  jobTitle: JobTitle;
  isActive: boolean;
}

export interface WorkStatus {
  id: number;
  statusName: string;
  description?: string;
  isActive: boolean;
}

export interface JobType {
  id: number;
  typeName: string;
  description?: string;
  isActive: boolean;
}

export interface Industry {
  id: number;
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
}

export interface Company {
  id: number;
  name: string;
  industryId?: number;
  website?: string;
  description?: string;
  isVerified: boolean;
  isActive: boolean;
  companyType?: CompanyType;
}

export interface CompanyType {
  id: number;
  typeName: string;
  description?: string;
  isActive: boolean;
}

export interface SkillCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Skill {
  id: number;
  skillName: string;
  isTechnical: boolean;
  isHardSkill: boolean;
  category?: SkillCategory;
  isActive: boolean;
}

export interface FieldOfStudy {
  id: number;
  fieldName: string;
  category?: string;
  description?: string;
  isActive: boolean;
}

export interface Degree {
  id: number;
  degreeName: string;
  degreeType?: string;
  description?: string;
  isActive: boolean;
}

export interface Institution {
  id: number;
  name: string;
  institutionType?: string;
  countryCode?: string;
  website?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface LanguageLevel {
  id: number;
  levelName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Language {
  id: number;
  languageName: string;
  nativeName?: string;
  iso6391Code?: string;
  iso6392Code?: string;
  isActive: boolean;
}

export interface Nationality {
  id: number;
  nationalityName: string;
  countryCode: string;
  isActive: boolean;
}

export interface Country {
  code: string;
  name: string;
  nativeName?: string;
  iso3Code?: string;
  phoneCode?: string;
  currency?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  latitude?: number;
  longitude?: number;
  flagEmoji?: string;
  isActive: boolean;
}

export interface State {
  id: number;
  code: string;
  name: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export interface City {
  id: number;
  name: string;
  stateCode?: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  population?: number;
}

export interface PostalCodeValidation {
  isValid: boolean;
  message?: string;
  format?: string;
  example?: string;
}

export interface PostalCodeInfo {
  postalCode: string;
  city?: string;
  state?: string;
  stateCode?: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

export interface AutocompleteItem {
  id: string;
  name: string;
  type: string;
}

export interface AutocompleteResult {
  jobTitles?: AutocompleteItem[];
  skills?: AutocompleteItem[];
  companies?: AutocompleteItem[];
  industries?: AutocompleteItem[];
  fieldsOfStudy?: AutocompleteItem[];
}

export interface LocationAutocompleteResult {
  countries?: AutocompleteItem[];
  states?: AutocompleteItem[];
  cities?: AutocompleteItem[];
}
```

---

## Advanced Patterns

### 1. Custom Hook for Client Components

```typescript
// hooks/useMasterData.ts

import { useState, useEffect } from 'react';
import { graphqlRequest } from '@/lib/graphql-client';

export function useMasterData<T>(
  query: string,
  variables?: Record<string, any>,
  skip = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (skip) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await graphqlRequest<T>(query, variables);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, JSON.stringify(variables), skip]);

  return { data, loading, error };
}

// Usage:
// const { data, loading, error } = useMasterData<{ jobTitles: JobTitle[] }>(
//   `query { jobTitles(limit: 10) { id title } }`
// );
```

### 2. React Query Integration

```typescript
// hooks/useMasterQueries.ts

import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql-client';

export function useJobTitles(category?: string, activeOnly = true) {
  return useQuery({
    queryKey: ['jobTitles', category, activeOnly],
    queryFn: async () => {
      const query = `
        query GetJobTitles($category: String, $activeOnly: Boolean) {
          jobTitles(category: $category, activeOnly: $activeOnly) {
            id
            title
            category
            isActive
          }
        }
      `;
      const data = await graphqlRequest<{ jobTitles: any[] }>(query, {
        category,
        activeOnly,
      });
      return data.jobTitles;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchSkills(searchTerm: string, technicalOnly = false) {
  return useQuery({
    queryKey: ['searchSkills', searchTerm, technicalOnly],
    queryFn: async () => {
      const query = `
        query SearchSkills($searchTerm: String!, $technicalOnly: Boolean) {
          searchSkills(searchTerm: $searchTerm, technicalOnly: $technicalOnly, limit: 10) {
            id
            skillName
            isTechnical
            category { id name }
          }
        }
      `;
      const data = await graphqlRequest<{ searchSkills: any[] }>(query, {
        searchTerm,
        technicalOnly,
      });
      return data.searchSkills;
    },
    enabled: searchTerm.length >= 2, // Only fetch when search term is 2+ chars
    staleTime: 5 * 60 * 1000,
  });
}

// Usage:
// const { data: jobTitles, isLoading } = useJobTitles('Engineering');
// const { data: skills } = useSearchSkills('javascript', true);
```

### 3. Server Actions (Next.js 14+)

```typescript
// app/actions/masters.actions.ts
'use server';

import { graphqlRequest } from '@/lib/graphql-client';
import { JobTitle, Skill } from '@/types/masters.types';

export async function fetchJobTitlesAction(category?: string) {
  const query = `
    query GetJobTitles($category: String, $activeOnly: Boolean) {
      jobTitles(category: $category, activeOnly: $activeOnly, limit: 100) {
        id
        title
        category
        isActive
      }
    }
  `;

  try {
    const data = await graphqlRequest<{ jobTitles: JobTitle[] }>(query, {
      category,
      activeOnly: true,
    });
    return { success: true, data: data.jobTitles };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function searchSkillsAction(searchTerm: string, technicalOnly = false) {
  const query = `
    query SearchSkills($searchTerm: String!, $technicalOnly: Boolean, $limit: Int) {
      searchSkills(searchTerm: $searchTerm, technicalOnly: $technicalOnly, limit: $limit) {
        id
        skillName
        isTechnical
        isHardSkill
        category { id name }
      }
    }
  `;

  try {
    const data = await graphqlRequest<{ searchSkills: Skill[] }>(query, {
      searchTerm,
      technicalOnly,
      limit: 20,
    });
    return { success: true, data: data.searchSkills };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage in component:
// const result = await fetchJobTitlesAction('Technology');
// if (result.success) {
//   console.log(result.data);
// }
```

### 4. Autocomplete Component Example

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { graphqlRequest } from '@/lib/graphql-client';
import { debounce } from 'lodash';

export function MasterDataAutocomplete() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const searchAutocomplete = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);
      try {
        const query = `
          query Autocomplete($searchTerm: String!, $limit: Int) {
            autocomplete(searchTerm: $searchTerm, limit: $limit) {
              jobTitles { id name type }
              skills { id name type }
              companies { id name type }
              industries { id name type }
              fieldsOfStudy { id name type }
            }
          }
        `;

        const data = await graphqlRequest<{ autocomplete: any }>(query, {
          searchTerm: term,
          limit: 5,
        });

        setResults(data.autocomplete);
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchAutocomplete(searchTerm);
  }, [searchTerm, searchAutocomplete]);

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search job titles, skills, companies..."
        className="w-full p-2 border rounded"
      />

      {loading && <div className="absolute top-full mt-1">Loading...</div>}

      {results && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg">
          {results.jobTitles?.length > 0 && (
            <div>
              <div className="px-3 py-2 font-semibold text-sm text-gray-600">
                Job Titles
              </div>
              {results.jobTitles.map((item: any) => (
                <div
                  key={item.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}

          {results.skills?.length > 0 && (
            <div>
              <div className="px-3 py-2 font-semibold text-sm text-gray-600">
                Skills
              </div>
              {results.skills.map((item: any) => (
                <div
                  key={item.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}

          {results.companies?.length > 0 && (
            <div>
              <div className="px-3 py-2 font-semibold text-sm text-gray-600">
                Companies
              </div>
              {results.companies.map((item: any) => (
                <div
                  key={item.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5. Batch Queries

```typescript
// Fetch multiple master data types in a single request
export async function fetchAllMasterData() {
  const query = `
    query GetAllMasterData {
      jobTitles(limit: 100, activeOnly: true) {
        id
        title
        category
      }
      skillCategories(activeOnly: true) {
        id
        name
      }
      industries(activeOnly: true) {
        id
        name
        category
      }
      countries(activeOnly: true) {
        code
        name
        flagEmoji
      }
      languageLevels(activeOnly: true) {
        id
        levelName
        displayOrder
      }
    }
  `;

  const data = await graphqlRequest<{
    jobTitles: any[];
    skillCategories: any[];
    industries: any[];
    countries: any[];
    languageLevels: any[];
  }>(query);

  return data;
}

// Usage in server component:
// const masterData = await fetchAllMasterData();
```

---

## Error Handling

### Comprehensive Error Handler

```typescript
// lib/graphql-error-handler.ts

export class GraphQLError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

export async function safeGraphQLRequest<T>(
  query: string,
  variables?: Record<string, any>
): Promise<{ data?: T; error?: GraphQLError }> {
  try {
    const data = await graphqlRequest<T>(query, variables);
    return { data };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: new GraphQLError(
          error.message,
          error.statusCode,
          error.errors
        ),
      };
    }
    return {
      error: new GraphQLError('An unknown error occurred'),
    };
  }
}

// Usage:
// const { data, error } = await safeGraphQLRequest<{ jobTitles: JobTitle[] }>(query);
// if (error) {
//   console.error('Error:', error.message);
// } else {
//   console.log('Data:', data);
// }
```

### Error Boundary Component

```typescript
'use client';

import React from 'react';

export class MasterDataErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">
            Error loading master data
          </h2>
          <p className="text-red-600 text-sm mt-2">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
// <MasterDataErrorBoundary>
//   <JobTitlesComponent />
// </MasterDataErrorBoundary>
```

---

## Caching Strategies

### 1. Next.js Server-Side Caching

```typescript
// lib/cached-graphql-client.ts

import { unstable_cache } from 'next/cache';
import { graphqlRequest } from './graphql-client';

export function cachedGraphQLRequest<T>(
  query: string,
  variables?: Record<string, any>,
  cacheConfig?: {
    revalidate?: number | false;
    tags?: string[];
  }
) {
  const cacheKey = `graphql-${JSON.stringify({ query, variables })}`;

  return unstable_cache(
    async () => graphqlRequest<T>(query, variables),
    [cacheKey],
    {
      revalidate: cacheConfig?.revalidate ?? 3600, // 1 hour default
      tags: cacheConfig?.tags ?? ['masters'],
    }
  )();
}

// Usage:
// const data = await cachedGraphQLRequest<{ jobTitles: JobTitle[] }>(
//   query,
//   variables,
//   { revalidate: 600, tags: ['job-titles'] }
// );
```

### 2. React Query Persistent Cache

```typescript
// lib/query-client.ts

import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

// Wrap your app:
// <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
//   {children}
// </PersistQueryClientProvider>
```

### 3. SWR Integration

```typescript
// hooks/useMasterSWR.ts

import useSWR from 'swr';
import { graphqlRequest } from '@/lib/graphql-client';

const fetcher = (query: string, variables?: Record<string, any>) =>
  graphqlRequest(query, variables);

export function useJobTitlesSWR(category?: string) {
  const query = `
    query GetJobTitles($category: String, $activeOnly: Boolean) {
      jobTitles(category: $category, activeOnly: $activeOnly) {
        id
        title
        category
      }
    }
  `;

  const { data, error, isLoading } = useSWR(
    ['jobTitles', category],
    () => fetcher(query, { category, activeOnly: true }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    jobTitles: data?.jobTitles,
    isLoading,
    error,
  };
}

// Usage:
// const { jobTitles, isLoading, error } = useJobTitlesSWR('Engineering');
```

---

## Complete Example: Resume Builder Form

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql-client';

export default function ResumeBuilderForm() {
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  // Fetch job titles
  const { data: jobTitlesData } = useQuery({
    queryKey: ['jobTitles'],
    queryFn: async () => {
      const query = `
        query { jobTitles(activeOnly: true, limit: 100) { id title category } }
      `;
      const result = await graphqlRequest<{ jobTitles: any[] }>(query);
      return result.jobTitles;
    },
  });

  // Fetch skills
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const query = `
        query { skills(activeOnly: true, limit: 200) { id skillName isTechnical } }
      `;
      const result = await graphqlRequest<{ skills: any[] }>(query);
      return result.skills;
    },
  });

  // Fetch countries
  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const query = `
        query { countries(activeOnly: true) { code name flagEmoji } }
      `;
      const result = await graphqlRequest<{ countries: any[] }>(query);
      return result.countries;
    },
  });

  return (
    <form className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-sm font-medium mb-2">Job Title</label>
        <select
          value={selectedJobTitle}
          onChange={(e) => setSelectedJobTitle(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a job title</option>
          {jobTitlesData?.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Skills</label>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-4 rounded">
          {skillsData?.map((skill) => (
            <label key={skill.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSkills([...selectedSkills, skill.id]);
                  } else {
                    setSelectedSkills(selectedSkills.filter((id) => id !== skill.id));
                  }
                }}
              />
              <span className="text-sm">
                {skill.skillName}
                {skill.isTechnical && ' (Tech)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Country</label>
        <select className="w-full p-2 border rounded">
          <option value="">Select a country</option>
          {countriesData?.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flagEmoji} {country.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Resume
      </button>
    </form>
  );
}
```

---

## Additional Resources

- **GraphiQL Interface:** Available at `http://localhost:3000/masters-graphql` (debug mode)
- **Migration Documentation:** See `MASTER_DATA_ENDPOINT_MIGRATION.md`
- **Backend Caching:** All queries are cached with Redis for optimal performance

---

## Summary

This guide provides complete Next.js integration examples for all 48 queries available in the `/masters-graphql` endpoint. All examples use standard fetch/REST client patterns without Apollo Client, making them lightweight and framework-agnostic.

**Key Features:**
- No authentication required
- 48 query operations
- Full TypeScript support
- Multiple caching strategies
- Error handling patterns
- Real-world component examples
- Server and client component patterns
- React Query, SWR, and custom hooks examples
