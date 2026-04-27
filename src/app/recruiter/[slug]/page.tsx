"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import RecruiterProfilePublic from "@/components/RecruiterProfilePublic";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { Job } from "@/types/api";
import { RecruiterProfile } from "@/types";
import FloatingHeader from "@/components/FloatingHeader";

// Server-side data fetching function
async function getRecruiterProfile(
  slug: string,
): Promise<RecruiterProfile | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://letsmakecv.tulip-software.com";
    const response = await fetch(
      `${apiUrl}/api/v1/recruiters/profile/slug/${slug}`,
      {
        cache: "no-store", // Always fetch fresh data
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch profile: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch recruiter profile:", error);
    return null;
  }
}

export default function RecruiterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      const resolvedParams = await params;
      const data = await getRecruiterProfile(resolvedParams.slug);
      setProfile(data);
    }
    loadProfile();
  }, [params]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayName =
    profile.recruiter_type === "company"
      ? profile.company_name || profile.display_name
      : profile.full_name || profile.display_name;

  const isCompany = profile.recruiter_type === "company";
  const galleryImages = profile.gallery?.images || [];

  const openGallery = (index: number = 0) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <FloatingHeader
        links={[
          { label: "Features", href: "#features" },
          { label: "Sign Up", href: "/recruiter/signup" },
        ]}
        cta={{ label: "Login", href: "/recruiter/login", variant: "secondary" }}
        showAuthButtons={true}
      />

      {/* Jobs and Events Section */}
      <RecruiterProfilePublic profile={profile} />
    </div>
  );
}
