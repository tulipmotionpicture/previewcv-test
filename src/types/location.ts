/**
 * Location Types
 * Type definitions for cities, states, and countries
 */

export interface City {
  id: number;
  name: string;
  countryId?: number;
  stateId?: number;
  isActive: boolean;
}

export interface State {
  id: number;
  name: string;
  code: string;
  countryId: number;
  isActive: boolean;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  code3?: string;
  phoneCode: string;
  isActive: boolean;
}

export interface SearchCitiesResponse {
  searchCities: City[];
}

export interface GetCountriesResponse {
  countries: Country[];
}

export interface GetStatesByCountryResponse {
  statesByCountry: State[];
}

export interface GetCitiesByStateResponse {
  citiesByState: City[];
}
