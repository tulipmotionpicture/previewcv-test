import React from "react";
import Link from "next/link";
import type {
  CountryCard,
  CityCard,
  IndustryCard,
  JobTypeCard,
  ExperienceCard,
  RemoteCard,
} from "@/types/jobs";

interface JobCardsProps {
  countries?: CountryCard[];
  cities?: CityCard[];
  industries?: IndustryCard[];
  jobTypes?: JobTypeCard[];
  experiences?: ExperienceCard[];
  remote?: RemoteCard[];
  loading?: boolean;
  error?: string;
}

export default function JobCards({
  countries,
  cities,
  industries,
  jobTypes,
  experiences,
  remote,
  loading,
  error,
}: JobCardsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Country Cards */}
      {countries && countries.length > 0 && (
        <CardSection title="Jobs by Country">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countries.map((country) => (
              <CountryCardItem key={country.slug} country={country} />
            ))}
          </div>
        </CardSection>
      )}

      {/* City Cards */}
      {cities && cities.length > 0 && (
        <CardSection title="Jobs by City">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cities.map((city) => (
              <CityCardItem key={city.slug} city={city} />
            ))}
          </div>
        </CardSection>
      )}

      {/* Industry Cards */}
      {industries && industries.length > 0 && (
        <CardSection title="Jobs by Industry">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <IndustryCardItem key={industry.slug} industry={industry} />
            ))}
          </div>
        </CardSection>
      )}

      {/* Job Type Cards */}
      {jobTypes && jobTypes.length > 0 && (
        <CardSection title="Jobs by Type">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jobTypes.map((jobType) => (
              <JobTypeCardItem key={jobType.slug} jobType={jobType} />
            ))}
          </div>
        </CardSection>
      )}

      {/* Experience Cards */}
      {experiences && experiences.length > 0 && (
        <CardSection title="Jobs by Experience Level">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {experiences.map((experience) => (
              <ExperienceCardItem
                key={experience.slug}
                experience={experience}
              />
            ))}
          </div>
        </CardSection>
      )}

      {/* Remote Cards */}
      {remote && remote.length > 0 && (
        <CardSection title="Remote vs On-Site">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {remote.map((remoteType) => (
              <RemoteCardItem key={remoteType.slug} remote={remoteType} />
            ))}
          </div>
        </CardSection>
      )}
    </div>
  );
}

interface CardSectionProps {
  title: string;
  children: React.ReactNode;
}

function CardSection({ title, children }: CardSectionProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
      </div>
      {children}
    </section>
  );
}

function CountryCardItem({ country }: { country: CountryCard }) {
  return (
    <Link
      href={`/jobs/${country.slug}`}
      className="group relative bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {country.country}
        </h3>
      </div>
    </Link>
  );
}

function CityCardItem({ city }: { city: CityCard }) {
  return (
    <Link
      href={`/jobs/${city.slug}`}
      className="group relative bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
          {city.city}
        </h3>
        {city.country && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {city.country}
          </p>
        )}
      </div>
    </Link>
  );
}

function IndustryCardItem({ industry }: { industry: IndustryCard }) {
  return (
    <Link
      href={`/jobs/${industry.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {industry.industry}
        </h3>
      </div>
    </Link>
  );
}

function JobTypeCardItem({ jobType }: { jobType: JobTypeCard }) {
  return (
    <Link
      href={`/jobs/${jobType.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {jobType.label}
        </h3>
      </div>
    </Link>
  );
}

function ExperienceCardItem({ experience }: { experience: ExperienceCard }) {
  return (
    <Link
      href={`/jobs/${experience.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      <div className="frelative bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
            {experience.label}
          </h3>
        </div>
      </div>
    </Link>
  );
}

function RemoteCardItem({ remote }: { remote: RemoteCard }) {
  return (
    <Link
      href={`/jobs/${remote.slug}`}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      <div className="frelative bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
            {remote.label}
          </h3>
        </div>
      </div>
    </Link>
  );
}
