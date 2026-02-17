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
