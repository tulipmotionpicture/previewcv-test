import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { Recruiter } from "@/types/api";

function CompanyGallerySection({
  recruiter,
  toast,
}: {
  recruiter: Recruiter;
  toast: { error: (msg: string) => void; success: (msg: string) => void };
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(
    recruiter?.company_logo_url || null
  );
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  /* ------------------ LOGO UPLOAD ------------------ */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await api.uploadRecruiterLogo(file);
      const url = res?.url || res?.logo_url || null;
      setLogoUrl(url);
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
    e: React.ChangeEvent<HTMLInputElement>
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
    <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Company Media</h1>
        <p className="text-gray-500 mt-2">
          Manage your company logo and showcase your workplace gallery
        </p>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">Company Logo</h2>

        <div className="flex items-center gap-6">
          {logoUrl ? (
            <div className="relative group">
              <Image
                src={logoUrl}
                alt="Company Logo"
                width={120}
                height={120}
                className="rounded-xl border bg-gray-50"
              />
              <button
                onClick={handleLogoDelete}
                disabled={uploadingLogo}
                className="absolute -top-2 -right-2 bg-red-600 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition"
                title="Delete Logo"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-xl border bg-gray-50 flex items-center justify-center text-gray-400">
              No Logo
            </div>
          )}

          <div>
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {uploadingLogo
                ? "Uploading..."
                : logoUrl
                ? "Change Logo"
                : "Upload Logo"}
            </button>

            <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Office Gallery</h2>
            <p className="text-sm text-gray-500">
              Add up to 10 images to attract candidates
            </p>
          </div>

          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploadingGallery || gallery.length >= 10}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {uploadingGallery ? "Uploading..." : "Add Image"}
          </button>

          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handleGalleryUpload}
            className="hidden"
          />
        </div>

        {loading ? (
          <p className="text-gray-400">Loading images...</p>
        ) : gallery.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center text-gray-400">
            No images uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {gallery.map((img) => (
              <div key={img} className="relative group">
                <Image
                  src={img}
                  alt="Gallery"
                  width={300}
                  height={200}
                  className="rounded-xl border object-cover w-full h-40"
                />
                <button
                  onClick={() => handleGalleryDelete(img)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          {gallery.length}/10 images uploaded
        </p>
      </div>
    </div>
  );
}

export default CompanyGallerySection;
