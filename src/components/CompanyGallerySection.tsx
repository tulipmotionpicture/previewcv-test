
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { Recruiter } from "@/types/api";
import { useRecruiterAuth } from "@/context/RecruiterAuthContext";
import { Copy, Globe, Pencil, Share2, Plus, X } from "lucide-react";

function CompanyGallerySection({
  recruiter,
  toast,
}: {
  recruiter: Recruiter;
  toast: { error: (msg: string) => void; success: (msg: string) => void };
}) {
  const { updateProfile } = useRecruiterAuth();

  const [logoUrl, setLogoUrl] = useState<string | null>(
    recruiter?.company_logo_url || null,
  );
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    display_name: recruiter.display_name || "",
    username: recruiter.username || "",
    company_name: recruiter.company_name || "",
    bio: recruiter.bio || "",
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Update local state when prop changes
  useEffect(() => {
    setFormData({
      display_name: recruiter.display_name || "",
      username: recruiter.username || "",
      company_name: recruiter.company_name || "",
      bio: recruiter.bio || "",
    });
    setLogoUrl(recruiter.company_logo_url || null);
  }, [recruiter]);

  /* ------------------ FETCH GALLERY ------------------ */
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await api.getMyRecruiterGalleryImages();
        setGallery(res?.images || []);
      } catch {
        toast?.error("Failed to load gallery images");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [toast]);

  /* ------------------ FORM HANDLERS ------------------ */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: formData.display_name,
        username: formData.username,
        company_name: formData.company_name,
        bio: formData.bio,
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------ LOGO UPLOAD ------------------ */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await api.uploadRecruiterLogo(file);
      const url = res?.url || res?.logo_url || null;
      setLogoUrl(url);
      // Update global context immediately if needed, or wait for save?
      // Usually logo upload is separate immediate action as per current logic
      // But we should sync it with profile update if possible.
      // Current API might update the user record directly for logo.
      // Let's assume uploadRecruiterLogo updates the backend record.
      // We should also update the context to reflect this change
      await updateProfile({ company_logo_url: url || undefined });
      toast?.success("Logo uploaded successfully");
    } catch (err: any) {
      toast?.error(err?.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleLogoDelete = async () => {
    setUploadingLogo(true);
    try {
      const res = await api.deleteRecruiterLogo();
      if (res?.success) {
        setLogoUrl(null);
        await updateProfile({ company_logo_url: "" });
        toast?.success("Logo deleted");
      } else {
        toast?.error(res?.message || "Failed to delete logo");
      }
    } catch {
      toast?.error("Failed to delete logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  /* ------------------ GALLERY UPLOAD ------------------ */
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    try {
      const res = await api.uploadRecruiterGalleryImage(file);
      const url = res?.url || res?.image_url || null;
      if (url) setGallery((prev) => [url, ...prev]);
      toast?.success("Image uploaded");
    } catch {
      toast?.error("Gallery upload failed");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleGalleryDelete = async (url: string) => {
    try {
      const res = await api.deleteRecruiterGalleryImage(url);
      if (res?.success) {
        setGallery((prev) => prev.filter((img) => img !== url));
        toast?.success("Image deleted");
      } else {
        toast?.error(res?.message || "Failed to delete image");
      }
    } catch {
      toast?.error("Failed to delete image");
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in bg-white dark:bg-[#1E1E1E] min-h-screen">

      {/* Header section with Purple Banner */}
      <div className="relative mb-8">
        <div className="h-48 w-full bg-[#8B5CF6] rounded-xl relative overflow-hidden">
          {/* You can put a cover image here if needed, for now just purple color */}
        </div>

        {/* Logo Overlapping Banner */}
        <div className="absolute -bottom-16 left-8 flex items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl bg-white p-2 shadow-lg border border-gray-100 overflow-hidden">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Company Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg">
                  <span className="text-xs text-center">No Logo</span>
                </div>
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute bottom-2 right-2 w-8 h-8 bg-white text-gray-700 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition border border-gray-200 cursor-pointer"
              title="Change Logo"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Company Info Header */}
      <div className="mt-20 px-2 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {recruiter.company_name || "Company Name"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your company logo and showcase your workplace gallery
        </p>
      </div>

      {/* Public Profile Link Card */}
      <div className="bg-[#F8F9FC] dark:bg-[#282727] rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-50 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Public Profile Link</h3>
            <p className="text-xs text-blue-500">Share this URL with candidates to showcase your culture.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 flex-1 md:w-80">
            <span className="text-xs text-gray-500 truncate mr-2 flex-1">
              https://previewcv.com/profile/{recruiter.username || "username"}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://previewcv.com/profile/${recruiter.username}`);
                toast?.success("Link copied!");
              }}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <button className="text-blue-600 hover:text-blue-700">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Layout: Form Left, Gallery Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Display Name</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Display Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Email</label>
              <input
                type="text"
                value={recruiter.email || ""}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                placeholder="company@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">About Company</label>
            <textarea
              rows={4}
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
              placeholder="Tell us about your company..."
            />
          </div>
        </div>

        {/* Right Column: Office Gallery */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Office Gallery</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Gallery Images */}
            {gallery.map((img, index) => (
              <div key={index} className="aspect-square relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <Image
                  src={img}
                  alt={`Gallery ${index}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleGalleryDelete(img)}
                  className="absolute top-2 right-2 bg-red-500/80 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add Photo Button (Always visible as the last item or alone) */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery || gallery.length >= 10}
              className="aspect-square rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition group cursor-pointer"
            >
              {uploadingGallery ? (
                <span className="text-xs">Uploading...</span>
              ) : (
                <>
                  <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Add Photo</span>
                </>
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>
        </div>

      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#0B6BCB] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

    </div>
  );
}

export default CompanyGallerySection;
