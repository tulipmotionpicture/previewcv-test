/**
 * Masters Types
 * Type definitions for industries and skills
 */

export interface Industry {
  id: number;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
}

export interface SkillCategory {
  id: number;
  name: string;
}

export interface Skill {
  id: number;
  skillName: string;
  isTechnical: boolean;
  categoryId?: number;
  description?: string;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  industry?: string;
}

export interface JobTitle {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
}

export interface GetIndustriesResponse {
  industries: Industry[];
}

export interface SearchSkillsResponse {
  searchSkills: Skill[];
}

export interface SearchCompaniesResponse {
  searchCompanies: Company[];
}

export interface SearchJobTitlesResponse {
  searchJobTitles: JobTitle[];
}

export interface FieldOfStudy {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

export interface SearchFieldsOfStudyResponse {
  searchFieldsOfStudy: FieldOfStudy[];
}
