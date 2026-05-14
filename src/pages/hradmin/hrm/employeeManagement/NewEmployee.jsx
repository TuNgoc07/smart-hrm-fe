import { useEffect, useMemo, useRef, useState } from "react";

const EMPTY_PROFILE = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    maritalStatus: "",
    workEmail: "",
    personalEmail: "",
    phoneNumber: "",
    linkedInUrl: "",
    identificationNumber: "",
    identificationDate: "",
    permanentAddress: "",
    currentAddress: "",
    sameAsPermanent: false,
    fullName: "",
    title: "",
    profileHealth: 0,
    verified: false,
    departmentId: "",
    positionId: "",
    employmentType: "",
    startDate: "",
    loginEmail: "",
    password: "",
    roleId: "",
    avatarUrl: "",
};

function ProfileModalHeader() {
    return (
        <div className="mb-6 md:mb-8 lg:mb-10 pr-12 sm:pr-14">
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-medium mb-3 md:mb-4 flex-wrap">
                <span>Dashboard</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>Profile</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary font-bold">New</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">New Profile</h1>
        </div>
    );
}

function IdentityPreview({ profile, previewUrl, onAvatarClick }) {
    const fullName = profile.fullName || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "New Employee";
    const title = profile.title || "Role / Position";
    const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(fullName) + "&background=6366f1&color=fff&size=256";
    const displaySrc = previewUrl || profile.avatarUrl || defaultAvatar;
    console.log("IdentityPreview - previewUrl:", previewUrl, "profile.avatarUrl:", profile.avatarUrl, "displaySrc:", displaySrc);
    return (
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-100 max-w-sm mx-auto lg:max-w-none lg:sticky lg:top-6">
            <div className="relative group cursor-pointer mb-5 sm:mb-6 max-w-[180px] sm:max-w-[220px] lg:max-w-none mx-auto" onClick={onAvatarClick}>
                <div className="w-full aspect-square rounded-full overflow-hidden border-4 border-white shadow-sm transition-all group-hover:brightness-75">
                    <img className="w-full h-full object-cover" alt={fullName} src={displaySrc} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-3xl sm:text-4xl">photo_camera</span>
                </div>
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-primary border-[3px] sm:border-4 border-white rounded-full"></div>
            </div>

            <div className="text-center">
                {profile.verified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Verified
                    </span>
                )}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words">{fullName}</h3>
                <p className="text-sm text-slate-500 mb-6">{title}</p>

                <div className="space-y-3 pt-5 sm:pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Profile Health</span>
                        <span className="font-bold text-primary">{profile.profileHealth}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${profile.profileHealth}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionCard({ icon, title, description, children }) {
    return (
        <section className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-2.5 sm:p-3 bg-primary text-white rounded-xl shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">{title}</h2>
                    <p className="text-slate-500 text-sm mt-1">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function Field({ label, children, fullWidth = false }) {
    return (
        <div className={fullWidth ? "md:col-span-2 space-y-2" : "space-y-2"}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function TextInput({ value, onChange, className = "", ...props }) {
    return (
        <input
            {...props}
            value={value}
            onChange={onChange}
            className={`w-full bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-primary transition-colors py-3 text-slate-900 font-medium outline-none ${className}`}
        />
    );
}

function SelectInput({ value, onChange, children }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-primary transition-colors py-3 text-slate-900 font-medium outline-none"
        >
            {children}
        </select>
    );
}

function TextAreaInput({ value, onChange, className = "", ...props }) {
    return (
        <textarea
            {...props}
            value={value}
            onChange={onChange}
            className={`w-full bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-primary transition-colors py-3 text-slate-900 font-medium resize-none outline-none ${className}`}
        />
    );
}

function ReadOnlyField({ value }) {
    return (
        <div className="flex items-center gap-2 py-3 text-slate-400 font-medium italic border-b-2 border-slate-100">
            <span className="material-symbols-outlined text-sm">lock</span>
            {value}
        </div>
    );
}

function FooterActions({ onClose, submitting }) {
    return (
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 sticky bottom-0 bg-slate-100/95 backdrop-blur-sm pb-1">
            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl font-extrabold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
            >
                {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {submitting ? "Saving..." : "Create Profile"}
            </button>
        </div>
    );
}

export default function NewEmployee({ open = true, onClose, onSave, filterOptions = {} }) {
    const profileData = useMemo(() => ({ ...EMPTY_PROFILE }), []);
    const [formData, setFormData] = useState(profileData);
    const [localFilterOptions, setLocalFilterOptions] = useState({ ...filterOptions, roles: [] });
    const [localAvatarUrl, setLocalAvatarUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        fetch(`${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080"}/api/hradmin/filter-options`, { headers })
            .then((r) => r.json())
            .then((d) => { if (d?.data) setLocalFilterOptions(d.data); })
            .catch(console.error);
    }, [open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    useEffect(() => {
        setFormData(profileData);
    }, [profileData]);

    useEffect(() => {
        if (open) {
            setLocalAvatarUrl(null);
            setSelectedFile(null);
        } else {
            if (localAvatarUrl) {
                URL.revokeObjectURL(localAvatarUrl);
                setLocalAvatarUrl(null);
            }
            setSelectedFile(null);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const setField = (field, value) => {
        setFormData((prev) => {
            const next = { ...prev, [field]: value };

            if (field === "firstName" || field === "lastName") {
                next.fullName = `${field === "firstName" ? value : prev.firstName} ${field === "lastName" ? value : prev.lastName}`.trim();
            }

            if (field === "title") {
                next.title = value;
            }

            if (field === "sameAsPermanent") {
                next.currentAddress = value ? prev.permanentAddress : prev.currentAddress;
            }

            if (field === "permanentAddress" && prev.sameAsPermanent) {
                next.currentAddress = value;
            }

            return next;
        });
    };

    const fileInputRef = useRef(null);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        console.log("Avatar file selected:", file.name, "size:", file.size, "type:", file.type);
        if (localAvatarUrl) URL.revokeObjectURL(localAvatarUrl);
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setLocalAvatarUrl(url);
        console.log("Local avatar URL set:", url);
        e.target.value = "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                nationality: formData.nationality,
                maritalStatus: formData.maritalStatus || null,
                workEmail: formData.workEmail,
                personalEmail: formData.personalEmail,
                phoneNumber: formData.phoneNumber,
                linkedInUrl: formData.linkedInUrl,
                identificationNumber: formData.identificationNumber,
                identificationDate: formData.identificationDate,
                permanentAddress: formData.permanentAddress,
                currentAddress: formData.currentAddress,
                departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                positionId: formData.positionId ? Number(formData.positionId) : null,
                employmentType: formData.employmentType || null,
                startDate: formData.startDate || null,
                loginEmail: formData.loginEmail || null,
                password: formData.password || null,
                roleId: formData.roleId ? Number(formData.roleId) : null,
            };
            const multipart = new FormData();
            multipart.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
            console.log("FormData - selectedFile:", selectedFile ? selectedFile.name : "null");
            if (selectedFile) {
                multipart.append("avatarFile", selectedFile);
                console.log("FormData - avatarFile appended");
            }
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080"}/api/hradmin/employees`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: multipart }
            );
            const data = await res.json();
            console.log("Response:", data);
            if (!res.ok || data?.status === "failed") {
                console.error("Failed to create employee:", data?.message);
                return;
            }
            onSave?.();
        } catch (err) {
            console.error("Submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-4 md:p-6">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative w-full max-w-7xl max-h-[96vh] overflow-hidden rounded-2xl sm:rounded-[28px] bg-slate-100 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 sm:right-5 sm:top-5 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white text-slate-500 shadow-sm border border-slate-200 hover:text-slate-900"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <form onSubmit={handleSubmit} className="relative max-h-[96vh] overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12">
                    <ProfileModalHeader />

                    <div className="grid grid-cols-12 gap-6 md:gap-8 lg:gap-10">
                        <div className="col-span-12 lg:col-span-3">
                            <IdentityPreview profile={formData} previewUrl={localAvatarUrl} onAvatarClick={handleAvatarClick} />
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>

                        <div className="col-span-12 lg:col-span-9 space-y-6 md:space-y-8">
                            <SectionCard
                                icon="person"
                                title="User Account"
                                description="Set up login credentials and role for the employee."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                                    <Field label="Login Email">
                                        <TextInput type="email" value={formData.loginEmail} onChange={(e) => setField("loginEmail", e.target.value)} placeholder="Enter login email" />
                                    </Field>
                                    <Field label="Password">
                                        <TextInput type="password" value={formData.password} onChange={(e) => setField("password", e.target.value)} placeholder="Enter password" />
                                    </Field>
                                    <Field label="Role">
                                        <SelectInput value={formData.roleId} onChange={(e) => setField("roleId", e.target.value)}>
                                            <option value="">Select role</option>
                                            {(localFilterOptions.roles || []).map((r) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </SelectInput>
                                    </Field>
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon="work"
                                title="Job Assignment"
                                description="Assign the employee to a department and position."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                                    <Field label="Department">
                                        <SelectInput value={formData.departmentId} onChange={(e) => setField("departmentId", e.target.value)}>
                                            <option value="">Select department</option>
                                            {(localFilterOptions.departments || []).map((d) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </SelectInput>
                                    </Field>
                                    <Field label="Position">
                                        <SelectInput value={formData.positionId} onChange={(e) => setField("positionId", e.target.value)}>
                                            <option value="">Select position</option>
                                            {(localFilterOptions.positions || []).map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </SelectInput>
                                    </Field>
                                    <Field label="Employment Type">
                                        <SelectInput value={formData.employmentType} onChange={(e) => setField("employmentType", e.target.value)}>
                                            <option value="">Select type</option>
                                            {(localFilterOptions.employmentTypes || []).map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </SelectInput>
                                    </Field>
                                    <Field label="Start Date">
                                        <TextInput type="date" value={formData.startDate} onChange={(e) => setField("startDate", e.target.value)} />
                                    </Field>
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon="person"
                                title="Personal Information"
                                description="Enter the employee's basic legal identification details."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                                    <Field label="First Name">
                                        <TextInput type="text" value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} placeholder="Enter first name" />
                                    </Field>
                                    <Field label="Last Name">
                                        <TextInput type="text" value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} placeholder="Enter last name" />
                                    </Field>
                                    <Field label="Date of Birth">
                                        <TextInput type="date" value={formData.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
                                    </Field>
                                    <Field label="Gender">
                                        <SelectInput value={formData.gender} onChange={(e) => setField("gender", e.target.value)}>
                                            <option value="">Select gender</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Non-binary</option>
                                            <option>Prefer not to say</option>
                                        </SelectInput>
                                    </Field>
                                    <Field label="Job Title">
                                        <TextInput type="text" value={formData.title} onChange={(e) => setField("title", e.target.value)} placeholder="Enter role or position" />
                                    </Field>
                                    <Field label="Nationality">
                                        <TextInput type="text" value={formData.nationality} onChange={(e) => setField("nationality", e.target.value)} placeholder="Enter nationality" />
                                    </Field>
                                    <Field label="Marital Status">
                                        <SelectInput value={formData.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)}>
                                            <option value="">Select status</option>
                                            <option>Single</option>
                                            <option>Married</option>
                                            <option>Divorced</option>
                                            <option>Widowed</option>
                                        </SelectInput>
                                    </Field>
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon="alternate_email"
                                title="Contact Details"
                                description="Enter the contact channels for this profile."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                                    <Field label="Work Email">
                                        <TextInput type="email" value={formData.workEmail} onChange={(e) => setField("workEmail", e.target.value)} placeholder="Enter work email" />
                                    </Field>
                                    <Field label="Personal Email">
                                        <TextInput type="email" value={formData.personalEmail} onChange={(e) => setField("personalEmail", e.target.value)} placeholder="Enter personal email" />
                                    </Field>
                                    <Field label="Phone Number">
                                        <TextInput type="tel" value={formData.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} placeholder="Enter phone number" />
                                    </Field>
                                    <Field label="LinkedIn Profile URL">
                                        <TextInput type="url" value={formData.linkedInUrl} onChange={(e) => setField("linkedInUrl", e.target.value)} placeholder="Enter LinkedIn profile URL" />
                                    </Field>
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon="badge"
                                title="Identity & Address"
                                description="Enter identity and address information for compliance and payroll."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                                    <Field label="Identification Number">
                                        <TextInput
                                            type="password"
                                            value={formData.identificationNumber}
                                            onChange={(e) => setField("identificationNumber", e.target.value)}
                                            className="tracking-widest"
                                            placeholder="Enter identification number"
                                        />
                                    </Field>
                                    <Field label="Identification Date">
                                        <TextInput type="date" value={formData.identificationDate} onChange={(e) => setField("identificationDate", e.target.value)} />
                                    </Field>
                                    <Field label="Permanent Address" fullWidth>
                                        <TextAreaInput rows={2} value={formData.permanentAddress} onChange={(e) => setField("permanentAddress", e.target.value)} placeholder="Enter permanent address" />
                                    </Field>
                                    <div className="md:col-span-2 space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Address</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.sameAsPermanent}
                                                    onChange={(e) => setField("sameAsPermanent", e.target.checked)}
                                                    className="rounded text-primary focus:ring-primary/20 border-slate-300"
                                                />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Same as Permanent</span>
                                            </label>
                                        </div>
                                        <TextAreaInput
                                            rows={2}
                                            value={formData.currentAddress}
                                            onChange={(e) => setField("currentAddress", e.target.value)}
                                            placeholder="Enter current address"
                                            disabled={formData.sameAsPermanent}
                                            className={formData.sameAsPermanent ? "opacity-60 cursor-not-allowed" : ""}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            <FooterActions onClose={onClose} submitting={submitting} />
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 hidden xl:block">
                        <div className="w-32 h-32 border-r-2 border-b-2 border-primary/40 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                            <div className="absolute w-full h-[2px] bg-primary animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(0,61,155,0.5)]"></div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
