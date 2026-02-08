"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Recruiter } from "@/types/api";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function RecruiterProfileEdit() {
  const router = useRouter();
  const {
    recruiter,
    updateProfile,
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useRecruiterAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    phone: "",
    location: "",
    linkedin_url: "",
    company_name: "",
    company_website: "",
    company_size: "",
    industry: "",
    specialization: "",
    years_experience: "",
    company_logo_url: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Accordion states
  const [profileOpen, setProfileOpen] = useState(true);
  const [passwordOpen, setPasswordOpen] = useState(true);
  const [dangerOpen, setDangerOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (recruiter) {
      setFormData({
        display_name: recruiter.display_name || "",
        username: recruiter.username || "",
        bio: recruiter.bio || "",
        phone: recruiter.phone || "",
        location: recruiter.location || "",
        linkedin_url: recruiter.linkedin_url || "",
        company_name: recruiter.company_name || "",
        company_website: recruiter.company_website || "",
        company_size: recruiter.company_size || "",
        industry: recruiter.industry || "",
        specialization: recruiter.specialization || "",
        years_experience: recruiter.years_experience?.toString() || "",
        company_logo_url: recruiter.company_logo_url || "",
      });
    }
  }, [recruiter]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.display_name.trim()) {
      newErrors.display_name = "Display name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.current_password) {
      newErrors.current_password = "Current password is required";
    }
    if (!passwordData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const profileData: Partial<Recruiter> = {
        ...formData,
        years_experience: formData.years_experience
          ? parseInt(formData.years_experience, 10)
          : undefined,
      };

      await updateProfile(profileData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      // Placeholder for password change API
      toast.info("Password change feature coming soon!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <LoadingSkeleton className="h-12 w-64" />
          <LoadingSkeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Profile Information Section */}
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full bg-[#0B172B] text-white px-6 py-3 flex justify-between items-center"
          >
            <h2 className="text-base font-medium">Profile Information</h2>
            {profileOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {profileOpen && (
            <div className="bg-white p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Contact & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Phone no</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 987654321"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Pune, Maharastra"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Website & LinkedIn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">company Website</label>
                    <input
                      type="url"
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleChange}
                      placeholder="www.companyname.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Linkdiln URI</label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="www.linkdiln/company.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Size & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">company Size</label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
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
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Information Technology"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Specialization & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Specilization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Technical recruiting"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Year of Experince</label>
                    <input
                      type="number"
                      name="years_experience"
                      value={formData.years_experience}
                      onChange={handleChange}
                      placeholder="10 Years"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Logo URL */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium uppercase">company logo Url</label>
                  <input
                    type="url"
                    name="company_logo_url"
                    value={formData.company_logo_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    loading={isSaving}
                    className="bg-[#007BFF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <button
            onClick={() => setPasswordOpen(!passwordOpen)}
            className="w-full bg-[#0B172B] text-white px-6 py-3 flex justify-between items-center"
          >
            <h2 className="text-base font-medium">Change Password</h2>
            {passwordOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {passwordOpen && (
            <div className="bg-white p-6">
              <form onSubmit={handlePasswordChange} className="space-y-5">

                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium uppercase">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                    placeholder="*************"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.current_password && (
                    <p className="text-xs text-red-500">{errors.current_password}</p>
                  )}
                </div>

                {/* New Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, new_password: e.target.value })
                      }
                      placeholder="*************"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.new_password && (
                      <p className="text-xs text-red-500">{errors.new_password}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirm_password: e.target.value })
                      }
                      placeholder="*************"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.confirm_password && (
                      <p className="text-xs text-red-500">{errors.confirm_password}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    loading={passwordLoading}
                    className="bg-[#007BFF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Danger Zone (Collapsible) */}
        <div className="rounded-lg overflow-hidden shadow-sm border border-red-100">
          <button
            onClick={() => setDangerOpen(!dangerOpen)}
            className="w-full bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
            {dangerOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {dangerOpen && (
            <div className="bg-white p-8">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <h3 className="font-bold text-gray-900">Logout from all devices</h3>
                  <p className="text-sm text-gray-600">This will sign you out from all active sessions</p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setShowLogoutDialog(true)}
                  className="shadow-none bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        variant="danger"
      />
    </div>
  );
}
