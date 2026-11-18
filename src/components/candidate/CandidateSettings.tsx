"use client";

import { useState } from "react";
import {
    Bell,
    Lock,
    Eye,
    EyeOff,
    Globe,
    Moon,
    Sun,
    Trash2,
    Shield,
    Mail,
    Smartphone,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/context/ToastContext";

export default function CandidateSettings() {
    const { theme, setTheme } = useTheme();
    const { success, error } = useToast();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        applicationUpdates: true,
        jobRecommendations: false,
        marketingEmails: false,
        pushNotifications: true,
    });

    // const [privacy, setPrivacy] = useState({
    //     profileVisibility: "public",
    //     showEmail: false,
    //     showPhone: false,
    // });

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error("Passwords do not match");
            return;
        }
        try {
            // TODO: Implement API call to change password
            success("Password updated successfully!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            error("Failed to update password");
        }
    };

    const handleDeleteAccount = () => {
        if (
            confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            // TODO: Implement account deletion
            success("Account deletion requested");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            {theme === "dark" ? (
                                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Appearance
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Customize how the app looks
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Dark Mode
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Toggle between light and dark theme
                            </p>
                        </div>
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-indigo-600" : "bg-gray-200"
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="">
                    {/* <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Notifications
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your notification preferences
                            </p>
                        </div>
                    </div> */}

                    <div className="space-y-4">
                        {/* Email Notifications */}
                        {/* <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        Email Notifications
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive notifications via email
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setNotifications({
                                        ...notifications,
                                        emailNotifications: !notifications.emailNotifications,
                                    })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.emailNotifications
                                    ? "bg-indigo-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailNotifications
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div> */}

                        {/* Application Updates */}
                        {/* <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    Application Updates
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Get notified about application status changes
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setNotifications({
                                        ...notifications,
                                        applicationUpdates: !notifications.applicationUpdates,
                                    })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.applicationUpdates
                                    ? "bg-indigo-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.applicationUpdates
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div> */}

                        {/* Job Recommendations */}
                        {/* <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    Job Recommendations
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Receive personalized job suggestions
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setNotifications({
                                        ...notifications,
                                        jobRecommendations: !notifications.jobRecommendations,
                                    })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.jobRecommendations
                                    ? "bg-indigo-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.jobRecommendations
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div> */}

                        {/* Push Notifications */}
                        {/* <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        Push Notifications
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive push notifications on your device
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setNotifications({
                                        ...notifications,
                                        pushNotifications: !notifications.pushNotifications,
                                    })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.pushNotifications
                                    ? "bg-indigo-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.pushNotifications
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div> */}
                    </div>
                </div>

                {/* Security Settings */}
                {/* <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Security
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your password and security settings
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handlePasswordChange}
                            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Update Password
                        </button>
                    </div>
                </div> */}

                {/* Privacy Settings */}
                {/* <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Privacy
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Control your privacy settings
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profile Visibility
                            </label>
                            <select
                                value={privacy.profileVisibility}
                                onChange={(e) =>
                                    setPrivacy({ ...privacy, profileVisibility: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="public">Public - Visible to everyone</option>
                                <option value="recruiters">Recruiters Only</option>
                                <option value="private">Private - Only me</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    Show Email Address
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Display your email on your public profile
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setPrivacy({ ...privacy, showEmail: !privacy.showEmail })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.showEmail
                                    ? "bg-indigo-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.showEmail ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    Show Phone Number
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Display your phone number on your public profile
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setPrivacy({ ...privacy, showPhone: !privacy.showPhone })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.showPhone
                                    ? "bg-indigo-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.showPhone ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div> */}

                {/* Danger Zone */}
                {/* <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h2 className="text-xl font-bold text-red-900 dark:text-red-400">
                            Danger Zone
                        </h2>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Once you delete your account, there is no going back. Please be
                        certain.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Delete Account
                    </button>
                </div> */}
            </div>
        </div>
    );
}
