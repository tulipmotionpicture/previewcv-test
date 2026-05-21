"use client";

import { useState, useEffect } from "react";
import { Camera, Eye, EyeOff, MapPin, Briefcase, Phone, Mail, User, Info, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

export default function CandidateProfile() {
    const { user, updateProfile } = useAuth();
    const { success, error } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        current_position: "",
        bio: "",
        current_password: "",
        new_password: "",
        confirm_new_password: "",
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
                current_password: "",
                new_password: "",
                confirm_new_password: "",
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
            ...formData,
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.location || "",
            current_position: user.current_position || "",
            bio: user.bio || "",
        });
        setIsEditing(false);
    };

    const handleCancelPassword = () => {
        setFormData({
            ...formData,
            current_password: "",
            new_password: "",
            confirm_new_password: "",
        });
        setIsEditingPassword(false);
    };

    const handleSavePassword = async () => {
        if (!formData.current_password || !formData.new_password) {
            error("Please fill in all password fields");
            return;
        }
        if (formData.new_password !== formData.confirm_new_password) {
            error("New passwords do not match");
            return;
        }
        try {
            await api.candidateChangePassword({
                current_password: formData.current_password,
                new_password: formData.new_password,
            });
            success("Password updated successfully!");
            setFormData({
                ...formData,
                current_password: "",
                new_password: "",
                confirm_new_password: "",
            });
            setIsEditingPassword(false);
        } catch (err: any) {
            console.error(err);
            error(err.message || "Failed to update password");
        }
    };

    const DetailRow = ({
        label,
        value,
        isEditing,
        field,
        type = "text",
        placeholder = "",
        icon: Icon,
    }: {
        label: string;
        value: string;
        isEditing?: boolean;
        field?: keyof typeof formData;
        type?: string;
        placeholder?: string;
        icon?: any;
    }) => (
        <div className="flex flex-col py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {label}
                </span>
            </div>

            <div className="text-sm font-medium text-gray-900 mt-1">
                {isEditing && field ? (
                    field === "bio" ? (
                        <textarea
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-gray-50/50 focus:bg-white"
                            placeholder={placeholder}
                        />
                    ) : (
                        <div className="relative flex items-center w-full">
                            <input
                                type={type === "password" && showPassword ? "text" : type}
                                value={formData[field]}
                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                disabled={field === "email"}
                                className={`w-full border border-gray-200 rounded-lg px-4 py-2.5 ${type === "password" ? "pr-10" : ""} text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 transition-shadow bg-gray-50/50 focus:bg-white`}
                                placeholder={placeholder}
                            />
                            {type === "password" && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="absolute right-3 text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                    )
                ) : type === "password" ? (
                    "********"
                ) : (
                    value || <span className="text-gray-400 italic font-normal">Not provided</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">

            {/* Header Text */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your personal information and security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

                {/* Left Column: Profile Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">


                        {/* Avatar & Info */}
                        <div className="px-6 pb-6 relative text-center mt-20">
                            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white mx-auto -mt-12 shadow-sm relative">
                                <img
                                    src={
                                        user?.profile_image_url ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user?.full_name || "User Name"
                                        )}&background=6366f1&color=fff&size=150`
                                    }
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900 mt-4">
                                {formData.full_name || "User Name"}
                            </h2>
                            <p className="text-sm font-medium text-indigo-600 mt-1">
                                Candidate
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="space-y-8">

                    {/* Personal Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-base font-bold text-gray-900">Personal Details</h3>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md shadow-sm transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {DetailRow({ label: "Full Name", value: formData.full_name, isEditing: isEditing, field: "full_name", icon: User })}
                                {DetailRow({ label: "Email Address", value: formData.email, isEditing: isEditing, field: "email", type: "email", icon: Mail })}
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-purple-500" />
                                <h3 className="text-base font-bold text-gray-900">Security & Password</h3>
                            </div>

                            {!isEditingPassword ? (
                                <button
                                    onClick={() => setIsEditingPassword(true)}
                                    className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCancelPassword}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSavePassword}
                                        className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-md shadow-sm transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 max-w-lg">
                            <div className="space-y-2">
                                {DetailRow({ label: "Current Password", value: "", type: "password", placeholder: "Enter current password", isEditing: isEditingPassword, field: "current_password" })}
                                {DetailRow({ label: "New Password", value: "", type: "password", placeholder: "Enter new password", isEditing: isEditingPassword, field: "new_password" })}
                                {DetailRow({ label: "Confirm New Password", value: "", type: "password", placeholder: "Confirm new password", isEditing: isEditingPassword, field: "confirm_new_password" })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
