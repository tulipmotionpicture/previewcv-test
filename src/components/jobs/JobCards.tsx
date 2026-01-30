import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0369A1] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-lg text-center text-red-700 dark:text-red-400 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Country Cards */}
      {countries && countries.length > 0 && (
        <CardSection title="Jobs by Country">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countries.map((country) => (
              <GenericCardItem key={country.slug} title={country.country} href={`/jobs/${country.slug}`} />
            ))}
          </div>
        </CardSection>
      )}

      {/* City Cards */}
      {cities && cities.length > 0 && (
        <CardSection title="Jobs by City">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cities.map((city) => (
              <GenericCardItem
                key={city.slug}
                title={city.city}
                subtitle={city.country ?? undefined}
                href={`/jobs/${city.slug}`}
              />
            ))}
          </div>
        </CardSection>
      )}

      {/* Industry Cards */}
      {industries && industries.length > 0 && (
        <CardSection title="Jobs by Industry">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <GenericCardItem key={industry.slug} title={industry.industry} href={`/jobs/${industry.slug}`} />
            ))}
          </div>
        </CardSection>
      )}

      {/* Job Type Cards */}
      {jobTypes && jobTypes.length > 0 && (
        <CardSection title="Jobs by Type">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jobTypes.map((jobType) => (
              <GenericCardItem key={jobType.slug} title={jobType.label} href={`/jobs/${jobType.slug}`} />
            ))}
          </div>
        </CardSection>
      )}

      {/* Experience Cards */}
      {experiences && experiences.length > 0 && (
        <CardSection title="Jobs by Experience Level">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {experiences.map((experience) => (
              <GenericCardItem key={experience.slug} title={experience.label} href={`/jobs/${experience.slug}`} />
            ))}
          </div>
        </CardSection>
      )}

      {/* Remote Cards */}
      {remote && remote.length > 0 && (
        <CardSection title="Remote vs On-Site">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {remote.map((remoteType) => (
              <GenericCardItem key={remoteType.slug} title={remoteType.label} href={`/jobs/${remoteType.slug}`} />
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
      <div className="mb-8 flex items-center gap-4">
        <div className="w-1.5 h-8 bg-[#0369A1] rounded-full"></div>
        <h2 className="text-2xl font-bold text-[#0C4A6E] dark:text-gray-100 italic tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function GenericCardItem({
  title,
  subtitle,
  href
}: {
  title: string;
  subtitle?: string;
  href: string
}) {
  return (
    <Link
      href={href}
      className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 transition-all duration-150 hover:border-[#0369A1] dark:hover:border-[#0EA5E9] cursor-pointer"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors duration-150 truncate">
            {title}
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0369A1] transition-colors duration-150" />
        </div>
        {subtitle && (
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
