import { useState, useEffect } from "react";
import {
  Building2,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Github,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Briefcase,
  Tag,
  Image as ImageIcon,
  Save,
  Lock,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  LayoutDashboard,
  Camera,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Recruiter } from "@/types/api";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

interface CompanyEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: "Webinar" | "Hiring Drive" | "Workshop" | "Conference";
}

interface CompanyProfileData {
  // Type
  recruiterType: "individual" | "company";

  // Identity (Read-only)
  displayName: string;
  username: string;
  profileUrl: string;
  email: string;

  // Individual-specific fields
  fullName: string;
  yearsExperience: number;
  specialization: string;

  // Company-specific fields
  companyName: string;
  industry: string;
  companySize: string;
  logoUrl: string;
  websiteUrl: string;

  // Common editable fields
  tagline: string;
  location: string;
  phone: string;
  address: string;
  linkedinUrl: string;
  about: string;
  gallery: GalleryImage[];
  events: CompanyEvent[];
}

// Mapping API Recruiter type to UI CompanyProfileData
const recruiterToProfileData = (
  recruiter: Recruiter & { company_images?: string[]; recruiter_type?: string },
): CompanyProfileData => {
  const isIndividual = recruiter.recruiter_type === "individual";
  const isCompany = recruiter.recruiter_type === "company";

  return {
    recruiterType: isIndividual ? "individual" : "company",
    displayName:
      recruiter.display_name ||
      recruiter.company_name ||
      recruiter.full_name ||
      "",
    username: recruiter.username || "",
    profileUrl: recruiter.profile_url || "",
    email: recruiter.email || "",

    // Individual-specific
    fullName: recruiter.full_name || "",
    yearsExperience: recruiter.years_experience || 0,
    specialization: recruiter.specialization || "",

    // Company-specific
    companyName: recruiter.company_name || "",
    industry: recruiter.industry || "",
    companySize: recruiter.company_size || "",
    logoUrl: recruiter.company_logo_url || "https://via.placeholder.com/200",
    websiteUrl: recruiter.company_website || "",

    // Common
    tagline: recruiter.bio?.substring(0, 150).replace(/<[^>]*>/g, "") || "",
    location: recruiter.location || "",
    phone: recruiter.phone || "",
    address: recruiter.location || "",
    linkedinUrl: recruiter.linkedin_url || "",
    about: recruiter.bio || "",
    gallery: (recruiter.company_images || []).map((url, index) => ({
      id: `img-${index}`,
      url,
      caption: `Company Image ${index + 1}`,
    })),
    events: [],
  };
};

// Mapping UI CompanyProfileData back to API Recruiter type
const profileDataToRecruiter = (
  profile: CompanyProfileData,
): Partial<Recruiter> => {
  const isIndividual = profile.recruiterType === "individual";

  return {
    // Common fields
    username: profile.username,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedin_url: profile.linkedinUrl,
    bio: profile.about,
    display_name: profile.displayName,

    // Individual-specific
    ...(isIndividual && {
      full_name: profile.fullName,
      years_experience: profile.yearsExperience,
      specialization: profile.specialization,
    }),

    // Company-specific
    ...(!isIndividual && {
      company_name: profile.companyName,
      company_website: profile.websiteUrl,
      company_size: profile.companySize,
      company_logo_url: profile.logoUrl,
      industry: profile.industry,
    }),
  };
};

type TabType = "company_profile" | "security";

interface RecruiterProfileContentProps {
  jobs?: any[];
  events?: any[];
}

export default function App({ jobs, events }: RecruiterProfileContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("company_profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [profile, setProfile] = useState<CompanyProfileData>({
    recruiterType: "company",
    displayName: "",
    username: "",
    profileUrl: "",
    email: "",
    fullName: "",
    yearsExperience: 0,
    specialization: "",
    companyName: "",
    industry: "",
    companySize: "",
    logoUrl: "https://via.placeholder.com/200",
    websiteUrl: "",
    tagline: "",
    location: "",
    phone: "",
    address: "",
    linkedinUrl: "",
    about: "",
    gallery: [],
    events: [],
  });

  const [newSpec, setNewSpec] = useState("");
  const [copied, setCopied] = useState(false);

  const [newEvent, setNewEvent] = useState<Omit<CompanyEvent, "id">>({
    title: "",
    date: "",
    location: "",
    description: "",
    type: "Webinar",
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const recruiterData = await api.getRecruiterProfile();

        console.log("API Response:", recruiterData);

        if (recruiterData && recruiterData.id) {
          console.log("Recruiter data:", recruiterData);
          console.log("Recruiter type:", recruiterData.recruiter_type);

          const profileData = recruiterToProfileData(recruiterData);
          console.log("Mapped profile data:", profileData);

          setProfile(profileData);
        } else {
          console.warn("No recruiter data in response");
          setErrorMessage("No profile data received from server");
          setShowError(true);
        }
      } catch (error) {
        console.error("Failed to fetch recruiter profile:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load profile. Using default data.",
        );
        setShowError(true);
        // Keep the empty profile as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setShowError(false);

      const recruiterData = profileDataToRecruiter(profile);

      const response = await api.updateRecruiterProfile(recruiterData);

      if (response && response.id) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      setErrorMessage(message);
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `https://previewcv.com/recruiter/${profile.username}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addGalleryImage = () => {
    const newImg: GalleryImage = {
      id: Math.random().toString(36).substr(2, 9),
      url: `https://picsum.photos/seed/${Math.random()}/800/600`,
      caption: "New Photo",
    };
    setProfile((prev) => ({ ...prev, gallery: [...prev.gallery, newImg] }));
  };

  const removeGalleryImage = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((img) => img.id !== id),
    }));
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const event: CompanyEvent = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProfile((prev) => ({ ...prev, events: [event, ...prev.events] }));
    setNewEvent({
      title: "",
      date: "",
      location: "",
      description: "",
      type: "Webinar",
    });
  };

  const removeEvent = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-[#121111] transition-colors duration-300">
      <main className="px-4 sm:px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 dark:bg-[#121111]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-semibold">
                Loading profile...
              </p>
            </motion.div>
          </div>
        )}
        {/* Profile Hero Section */}
        <div className="bg-white dark:bg-[#282727] rounded-3xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white dark:bg-[#282727] rounded-2xl shadow-lg">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-gray-700 relative group">
                <img
                  src={profile.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {profile.displayName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                @{profile.username}
                {profile.recruiterType === "company" && profile.industry && (
                  <>
                    {" "}
                    •{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {profile.industry}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#282727] border border-slate-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 max-w-md w-full">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Public Profile Link
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  previewcv.com/recruiter/{profile.username}
                </p>
              </div>
              <button
                onClick={copyLink}
                className={`p-2 rounded-lg transition-all ${copied ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-8 border-t border-slate-100 dark:border-gray-700 flex gap-8 overflow-x-auto">
            {[
              {
                id: "company_profile",
                label: `${profile.recruiterType === "company" ? "Company Profile" : "Profile"}`,
                icon: Building2,
              },
              {
                id: "security",
                label: "Account & Security",
                icon: ShieldCheck,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 dark:bg-emerald-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">Changes saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "company_profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Basic Info Section */}
                  <div className="bg-white dark:bg-[#282727] rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      General Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile.recruiterType === "individual" ? (
                        <>
                          {/* INDIVIDUAL FIELDS */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profile.fullName}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  fullName: e.target.value,
                                  displayName: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Display Name (Read-only)
                            </label>
                            <input
                              type="text"
                              value={profile.displayName}
                              readOnly
                              className="w-full bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5" />{" "}
                              Specialization
                            </label>
                            <input
                              type="text"
                              value={profile.specialization}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  specialization: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                              placeholder="e.g., Tech Recruiting, Healthcare"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" /> Years of
                              Experience
                            </label>
                            <input
                              type="number"
                              value={profile.yearsExperience}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  yearsExperience:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                              placeholder="e.g., 12"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" /> Location
                            </label>
                            <input
                              type="text"
                              value={profile.location}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  location: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                              placeholder="e.g., India"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* COMPANY FIELDS */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Company Name
                            </label>
                            <input
                              type="text"
                              value={profile.companyName}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  companyName: e.target.value,
                                  displayName: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Display Name (Read-only)
                            </label>
                            <input
                              type="text"
                              value={profile.displayName}
                              readOnly
                              className="w-full bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5" /> Industry
                            </label>
                            <select
                              value={profile.industry}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  industry: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            >
                              <option value="">Select Industry</option>
                              <option>IT</option>
                              <option>Finance</option>
                              <option>Healthcare</option>
                              <option>Retail</option>
                              <option>Manufacturing</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" /> Company Size
                            </label>
                            <select
                              value={profile.companySize}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  companySize: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            >
                              <option value="">Select Size</option>
                              <option>1-10</option>
                              <option>11-50</option>
                              <option>51-200</option>
                              <option>201-500</option>
                              <option>501-1000</option>
                              <option>1000+</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5" /> Website
                            </label>
                            <input
                              type="url"
                              value={profile.websiteUrl}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  websiteUrl: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              placeholder="https://example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" /> Location
                            </label>
                            <input
                              type="text"
                              value={profile.location}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  location: e.target.value,
                                })
                              }
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              placeholder="e.g., Bangalore, India"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Info Section */}
                  <div className="bg-white dark:bg-[#282727] rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Online Presence
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL
                        </label>
                        <input
                          type="url"
                          value={profile.linkedinUrl}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              linkedinUrl: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Account Info */}
                  <div className="bg-white dark:bg-[#282727] rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Username (Read-only)
                        </label>
                        <input
                          type="text"
                          value={profile.username}
                          readOnly
                          className="w-full bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Email Address (Read-only)
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          readOnly
                          className="w-full bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              phone: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="bg-white dark:bg-[#282727] rounded-3xl p-8 border border-slate-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                      <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      Change Password
                    </h3>
                    <div className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Current Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Confirm New
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-colors"
                          />
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40 active:scale-95">
                        Update Password
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Quick Stats & Preview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#282727] rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm p-6 sticky top-24">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Profile Strength
              </h4>
              <div className="space-y-4">
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your profile is{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    85% complete
                  </span>
                  . Add more gallery photos to reach 100%.
                </p>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Basic Info
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Gallery Photos
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      2/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      About Section
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                  >
                    {isSaving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://previewcv.com/recruiter/${profile.username}`,
                        "_blank",
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                  >
                    View Public Profile
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
