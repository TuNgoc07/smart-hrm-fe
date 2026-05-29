import React, { useState, useEffect } from "react";
import { fetchManagerProfile, updateManagerProfile } from "../../../../utils/managerApi";

export default function ManagerSettingScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const profileData = await fetchManagerProfile();
            setProfile(profileData.employeeInfo);
            setEditedProfile(profileData.employeeInfo);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
        setEditedProfile({ ...profile });
    };

    const handleCancel = () => {
        setEditMode(false);
        setEditedProfile({ ...profile });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updated = await updateManagerProfile({ employeeInfo: editedProfile });
            setProfile(updated.employeeInfo);
            setEditedProfile(updated.employeeInfo);
            setEditMode(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditedProfile(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto p-8">
                    <div className="text-center text-[#4c739a]">Loading...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto">
            <div className="mx-auto space-y-8">
                <BreadcrumbSection />
                <ProfileCard 
                    profile={editMode ? editedProfile : profile} 
                    editMode={editMode}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={handleChange}
                    saving={saving}
                />
            </div>
        </main>
    );
}

function BreadcrumbSection() {
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                <a className="text-[#4c739a] text-sm font-medium hover:text-primary" href="#">Home</a>
                <span className="text-[#4c739a] text-sm font-medium">/</span>
                <span className="text-[#0d141b] dark:text-slate-100 text-sm font-medium">Manager Settings</span>
            </div>
            <h2 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-tight">Manager Settings</h2>
        </div>
    );
}

function ProfileCard({ profile, editMode, onEdit, onCancel, onSave, onChange, saving }) {
    const getInitials = (name) => {
        if (!name) return "M";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="flex flex-col items-center gap-4">
                    {profile?.avatar ? (
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 ring-4 ring-primary/10 shadow-lg"
                            data-alt="Manager Profile Photo Large"
                            style={{ backgroundImage: `url("${profile.avatar}")` }}
                        ></div>
                    ) : (
                        <div className="aspect-square size-32 rounded-full ring-4 ring-primary/10 shadow-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary">{getInitials(profile?.employeeName)}</span>
                        </div>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 text-[#0d141b] dark:text-white text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        <span>Change Photo</span>
                    </button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Full Name</label>
                        {editMode ? (
                            <input
                                type="text"
                                value={profile?.employeeName || ""}
                                onChange={(e) => onChange("employeeName", e.target.value)}
                                className="w-full rounded-lg border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary"
                            />
                        ) : (
                            <p className="text-lg font-semibold text-[#0d141b] dark:text-white">{profile?.employeeName || "—"}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Email</label>
                        {editMode ? (
                            <input
                                type="email"
                                value={profile?.workEmail || ""}
                                onChange={(e) => onChange("workEmail", e.target.value)}
                                className="w-full rounded-lg border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary"
                            />
                        ) : (
                            <p className="text-lg font-semibold text-[#0d141b] dark:text-white">{profile?.workEmail || "—"}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Title</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">{profile?.positionName || "—"}</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Department</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">{profile?.departmentName || "—"}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Team</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">{profile?.teamName || "—"}</p>
                    </div>
                </div>
            </div>
            <div className="px-6 md:px-8 py-4 border-t border-[#e7edf3] dark:border-slate-800 flex justify-end gap-3">
                {editMode ? (
                    <>
                        <button
                            onClick={onCancel}
                            disabled={saving}
                            className="px-6 py-2 rounded-lg border border-[#e7edf3] dark:border-slate-700 text-[#0d141b] dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onEdit}
                        className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </section>
    );
}