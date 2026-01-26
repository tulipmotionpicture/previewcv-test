"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import config from "@/config";
import Image from "next/image";
import Link from "next/link";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import {
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Building2,
  User,
} from "lucide-react";

type RecruiterType = "company" | "individual";

export default function RecruiterSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    isAuthenticated,
    loading: authLoading,
  } = useRecruiterAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    recruiterType: "company" as RecruiterType,
    username: "",
    // Company fields
    companyName: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    // Individual fields
    specialization: "",
    yearsExperience: "",
    // Common fields
    phone: "",
    location: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("RecruiterSignup: Auth state:", {
      isAuthenticated,
      authLoading,
    });
    if (!authLoading && isAuthenticated) {
      console.log("RecruiterSignup: Redirecting to dashboard");
      router.push("/recruiter/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    if (formData.recruiterType === "company" && !formData.companyName) {
      setError("Company name is required");
      return;
    }

    if (formData.recruiterType === "individual" && !formData.specialization) {
      setError("Specialization is required");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        username: formData.username,
        // company_name: formData.companyName,
        // company_website: formData.companyWebsite,
        // phone: formData.phone,
        // bio:
        //   formData.recruiterType === "individual"
        //     ? `Specialization: ${formData.specialization}, Experience: ${formData.yearsExperience}`
        //     : `Industry: ${formData.industry}, Size: ${formData.companySize}`,
        recruiter_type: formData.recruiterType,
      });
      router.push("/recruiter/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-300">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-mint dark:bg-gray-900 overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0">
          <Image
            src="/sable-flow-o-6GhmpELnw-unsplash 1.png"
            alt="Recruitment team"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="inline-block mb-12">
              <Image
                src={config.app.logoUrl}
                alt={config.app.name}
                width={150}
                height={40}
                className="object-contain"
              />
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Start Hiring
              <br />
              Top Talent Today
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-md">
              Join thousands of recruiters finding and engaging with qualified
              candidates on PreviewCV.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Access Live Resumes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Preview candidate profiles in real-time from LetsMakeCV
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Track Your Pipeline
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage applications and hiring progress in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint flex items-center justify-center flex-shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Free to Start
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No credit card required. Start hiring immediately
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                500+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Companies
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                10k+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hires Made
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[580px]">
          <div className="lg:hidden">
            <Image
              src={config.app.logoUrl}
              alt={config.app.name}
              width={120}
              height={32}
              className="object-contain mb-6"
            />
          </div>

          <div className="">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
                <AlertTriangle size={20} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Recruiter Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  I am signing up as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`relative flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                      formData.recruiterType === "company"
                        ? "border-teal-dark dark:border-mint bg-teal-dark/5 dark:bg-teal-dark/10 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-teal-dark/50 dark:hover:border-mint/50 hover:shadow-sm"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recruiterType"
                      value="company"
                      checked={formData.recruiterType === "company"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all ${
                        formData.recruiterType === "company"
                          ? "bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-teal-dark/10 dark:group-hover:bg-teal-dark/10 group-hover:text-teal-dark dark:group-hover:text-mint"
                      }`}
                    >
                      <Building2 size={28} strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">
                        Company
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Hiring for an organization
                      </div>
                    </div>
                    {formData.recruiterType === "company" && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-teal-dark dark:bg-mint rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white dark:text-gray-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                  <label
                    className={`relative flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                      formData.recruiterType === "individual"
                        ? "border-teal-dark dark:border-mint bg-teal-dark/5 dark:bg-teal-dark/10 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-teal-dark/50 dark:hover:border-mint/50 hover:shadow-sm"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recruiterType"
                      value="individual"
                      checked={formData.recruiterType === "individual"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all ${
                        formData.recruiterType === "individual"
                          ? "bg-teal-dark dark:bg-teal-dark/20 text-white dark:text-mint"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-teal-dark/10 dark:group-hover:bg-teal-dark/10 group-hover:text-teal-dark dark:group-hover:text-mint"
                      }`}
                    >
                      <User size={28} strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">
                        Individual
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Independent recruiter
                      </div>
                    </div>
                    {formData.recruiterType === "individual" && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-teal-dark dark:bg-mint rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white dark:text-gray-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="recruiter@company.com"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pr-12"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pr-12"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Profile Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                      previewcv.com/recruiter/
                    </span>
                    <input
                      type="text"
                      name="username"
                      required
                      className="w-full pl-[200px] pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="your-username"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Fields Based on Recruiter Type */}
              {formData.recruiterType === "company" ? (
                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Tech Corp Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Company Website
                      </label>
                      <input
                        type="url"
                        name="companyWebsite"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Company Size
                      </label>
                      <select
                        name="companySize"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                        value={formData.companySize}
                        onChange={handleChange}
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="Technology, Finance, etc."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Tech Recruiting, Executive Search, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="yearsExperience"
                        min="0"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        value={formData.yearsExperience}
                        onChange={handleChange}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-dark dark:focus:ring-mint focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-teal-dark focus:ring-teal-dark dark:focus:ring-mint"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-teal-dark dark:text-mint font-semibold hover:underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-teal-dark dark:text-mint font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-dark hover:bg-teal-dark/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-dark/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>

              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/recruiter/login"
                  className="text-teal-dark dark:text-mint font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
