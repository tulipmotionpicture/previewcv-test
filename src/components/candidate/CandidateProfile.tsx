"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CandidateProfile() {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: "",
        current_position: "",
        bio: "",
    });

    const handleSave = async () => {
        try {
            // TODO: Implement API call to update profile
            success("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            error("Failed to update profile");
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            location: "",
            current_position: "",
            bio: "",
        });
        setIsEditing(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your personal information and preferences
                    </p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 mb-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {user?.full_name || "User"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                            {formData.current_position || "Job Seeker"}
                        </p>
                        {isEditing && (
                            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                Change Profile Picture
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </div>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        ) : (
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {formData.full_name || "Not provided"}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </div>
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                            {formData.email || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </div>
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="+1 (555) 000-0000"
                            />
                        ) : (
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {formData.phone || "Not provided"}
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location
                            </div>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="City, Country"
                            />
                        ) : (
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {formData.location || "Not provided"}
                            </p>
                        )}
                    </div>

                    {/* Current Position */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Current Position
                            </div>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.current_position}
                                onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Senior Software Engineer"
                            />
                        ) : (
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {formData.current_position || "Not provided"}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            About Me
                        </label>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-900 dark:text-gray-100">
                                {formData.bio || "No bio provided"}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Account Information
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Member Since
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
