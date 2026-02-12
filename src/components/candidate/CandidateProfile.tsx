"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CandidateProfile() {
    const { user, updateProfile } = useAuth();
    const { success, error } = useToast();

    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        current_position: "",
        bio: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                email: user.email || "",
                phone: user.phone || "",
                location: user.location || "",
                current_position: user.current_position || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            await updateProfile(formData);
            success("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            error("Failed to update profile");
        }
    };

    const handleCancel = () => {
        if (!user) return;

        setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.location || "",
            current_position: user.current_position || "",
            bio: user.bio || "",
        });

        setIsEditing(false);
    };

    const DetailRow = ({
        label,
        value,
        isEditing,
        field,
        type = "text",
        placeholder = "",
    }: {
        label: string;
        value: string;
        isEditing?: boolean;
        field?: keyof typeof formData;
        type?: string;
        placeholder?: string;
    }) => (
        <div className="grid grid-cols-[220px_1fr] py-4 border-b border-gray-100 last:border-b-0">
            <div className="text-sm font-semibold text-slate-500">
                {label}
            </div>

            <div className="text-sm font-semibold text-gray-900">
                {isEditing && field ? (
                    field === "bio" ? (
                        <textarea
                            value={formData[field]}
                            onChange={(e) =>
                                setFormData({ ...formData, [field]: e.target.value })
                            }
                            rows={3}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={placeholder}
                        />
                    ) : (
                        <input
                            type={type}
                            value={formData[field]}
                            onChange={(e) =>
                                setFormData({ ...formData, [field]: e.target.value })
                            }
                            disabled={field === "email"}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                            placeholder={placeholder}
                        />
                    )
                ) : (
                    value || "None"
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ================= Header / Banner ================= */}
            <div className="relative mb-10">

                <div className="h-[200px] rounded-xl overflow-hidden border border-gray-100 bg-white relative">

                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
              `,
                            backgroundSize: "40px 40px",
                        }}
                    />

                    {/* Member Since */}
                    <div className="absolute right-8 top-1/2 translate-y-1/2 text-right z-10">
                        <p className="text-sm font-semibold text-gray-900">
                            Member Since
                        </p>
                        <p className="text-sm text-slate-500">
                            {user?.created_at
                                ? new Date(user.created_at).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })
                                : "July 2025"}
                        </p>
                    </div>
                </div>

                {/* Profile row */}
                <div className="absolute left-10 top-[20px] text-center items-center gap-4">

                    {/* Avatar */}
                    <div className="relative ">
                        <div className="w-[96px] ml-6 h-[96px] rounded-full border-4 border-white overflow-hidden bg-red-800">
                            <img
                                src={
                                    user?.profile_image_url ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user?.full_name || "User Name"
                                    )}&background=random`
                                }
                                alt="profile"
                                className="w-full h-full object-cover "
                            />
                        </div>

                        {isEditing && (
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Name + role */}
                    <div className="pr-20">
                        <h1 className="text-xl font-bold text-gray-900">
                            {formData.full_name || "User Name"}
                        </h1>
                        <p className="text-slate-500">
                            {formData.current_position || "No position set"}
                        </p>
                    </div>

                </div>
            </div>

            {/* ================= Personal Details ================= */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

                <div className="px-6 py-2 border-b border-slate-900 bg-slate-900 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        Personal details
                    </h3>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm font-medium text-white hover:text-gray-200"
                        >
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={handleCancel}
                                className="text-sm font-medium text-gray-400 hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-sm font-medium text-white hover:text-gray-200"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-6">

                    <DetailRow
                        label="Full Name"
                        value={formData.full_name}
                        isEditing={isEditing}
                        field="full_name"
                    />

                    <DetailRow
                        label="Email Address"
                        value={formData.email}
                        isEditing={isEditing}
                        field="email"
                        type="email"
                    />

                    <DetailRow
                        label="Phone Number"
                        value={formData.phone}
                        isEditing={isEditing}
                        field="phone"
                        type="tel"
                    />

                    <DetailRow
                        label="Location"
                        value={formData.location}
                        isEditing={isEditing}
                        field="location"
                    />

                    <DetailRow
                        label="Current Position"
                        value={formData.current_position}
                        isEditing={isEditing}
                        field="current_position"
                    />

                    <DetailRow
                        label="About Me"
                        value={formData.bio}
                        isEditing={isEditing}
                        field="bio"
                    />

                </div>
            </div>

        </div>
    );
}
