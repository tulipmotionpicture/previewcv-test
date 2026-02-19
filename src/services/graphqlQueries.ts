/**
 * GraphQL Queries for Location Search
 * Queries for searching cities, states, and countries
 */

export const GET_SEARCH_CITY = `
  query SearchCities($searchTerm: String!, $countryCode: String, $stateCode: String) {
    searchCities(searchTerm: $searchTerm, countryCode: $countryCode, stateCode: $stateCode) {
      id
      name
      isActive
    }
  }
`;

export const GET_COUNTRIES = `
  query GetCountries {
    countries {
      code
      code3
      id
      isActive
      phoneCode
      name
    }
  }
`;

export const GET_COUNTRY = `
  query GetCountry($code: String!) {
    getCountry(code: $code) {
      code
      code3
      id
      isActive
      phoneCode
      name
    }
  }
`;

export const GET_STATES_BY_COUNTRY = `
  query GetStatesByCountry($countryCode: String!) {
    statesByCountry(countryCode: $countryCode) {
      code
      countryId
      id
      isActive
      name
    }
  }
`;

export const GET_CITIES_BY_STATE = `
  query GetCitiesByState($code: String!) {
    citiesByState(code: $code) {
      id
      isActive
      name
      stateId
    }
  }
`;

export const GET_INDUSTRIES = `
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

export const SEARCH_SKILLS = `
  query SearchSkills($searchTerm: String!, $categoryId: Int) {
    searchSkills(searchTerm: $searchTerm, categoryId: $categoryId) {
      categoryId
      description
      id
      isTechnical
      skillName
    }
  }
`;

export const GET_SEARCH_COMPANIES = `
  query GetSearchCompanies($searchTerm: String!) {
    searchCompanies(searchTerm: $searchTerm) {
      id
      name
      description
      industry
    }
  }
`;

export const GET_SEARCH_JOB_TITLES = `
  query GetSearchJobTitles($searchTerm: String!) {
    searchJobTitles(searchTerm: $searchTerm) {
      category
      id
      isActive
      title
    }
  }
`;

export const GET_SEARCH_FIELD_OF_STUDY = `
  query GetSearchFieldOfStudy($searchTerm: String!) {
    searchFieldsOfStudy(searchTerm: $searchTerm) {
      category
      description
      id
      name
    }
  }
`;
