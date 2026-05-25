import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchMyProfile, fetchMyLeaveBalances } from "../../../../utils/employeeApi";
import JobDetailsTab from "./tabs/JDTab";
import ProfileTab from "./tabs/ProfileTab";
import ContractTab from "./tabs/ContractTab";
import CompensationTab from "./tabs/CompensationTab";

export default function ProfileScreen() {
    const { emp_id } = useParams();
    const [activeTab, setActiveTab] = useState("profile");
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    const TABS = [
        { key: "profile", label: "Profile" },
        { key: "job", label: "Job Info" },
        { key: "contract", label: "Contract" },
        { key: "compensation", label: "Compensation" },
    ];

    useEffect(() => {
        fetchMyProfile()
            .then(res => {
                const p = res.data?.profile || {};
                const j = res.data?.jobInfo || {};
                setEmployee({
                    id: res.data?.employeeId,
                    name: p.employeeName || "–",
                    code: `EMP-${res.data?.employeeId || ""}`,
                    position: p.positionName || j.positionInfo?.[0]?.positionName || "–",
                    department: p.departmentName || j.departmentInfo?.departmentName || "–",
                    team: p.teamName || "–",
                    status: p.status || "Active",
                    avatar: p.avatar || null,
                    general: {
                        dob: p.birthday || "–",
                        gender: p.gender || "–",
                        nationality: p.nationality || "–",
                        marital: p.maritalStatus || "–",
                    },
                    contact: {
                        personalEmail: p.personalEmail || "–",
                        workEmail: p.workEmail || "–",
                        phone: p.phoneNumber || "–",
                        linkedin: p.linkedln || "–",
                    },
                    identification: {
                        idNumber: p.identificationCode || "–",
                        issueDate: p.issueDate || "–",
                        place: p.issuePlace || "–",
                    },
                    address: {
                        permanent: p.permanentAddress || "–",
                        current: p.currentAddress || "–",
                    },
                    jobInfo: j,
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-full px-6 space-y-6 animate-pulse">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 flex gap-6">
                    <div className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-3 pt-3">
                        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!employee) {
        return <div className="p-8 text-center text-slate-400">Failed to load profile.</div>;
    }

    return (
        <div className="w-full px-6 space-y-6">
            <BreadCrumb employee={employee} />
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <ProfileHeader employee={employee} />
                <Tab TABS={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            {activeTab === "profile" && <ProfileTab employee={employee} />}
            {activeTab === "job" && <JobDetailsTab employee={employee} />}
            {activeTab === "compensation" && <CompensationTab />}
            {activeTab === "contract" && <ContractTab />}
            <div className="flex justify-between text-xs text-slate-500 pt-6">
                <p>Profile data loaded from HR system</p>
                <p>{employee.department} · {employee.team}</p>
            </div>
        </div>
    );
}

/* ===== REUSABLE ===== */
function BreadCrumb({ employee }) {
    return (
        <div className="text-sm text-slate-500">
            Employees /{" "}
            <span className="font-semibold text-slate-900">
                {employee.name}
            </span>
        </div>
    );
}

function ProfileHeader({ employee }) {
    return (
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
                    />
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold">
                            {employee.name}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            {employee.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                                badge
                            </span>
                            ID: {employee.code}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                                work
                            </span>
                            {employee.position}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold">
                    Edit Profile
                </button>
                <button className="px-5 py-2.5 bg-slate-100 rounded-lg text-sm font-bold flex items-center gap-1">
                    Employee
                    <span className="material-symbols-outlined text-[18px]">
                        expand_more
                    </span>
                </button>
            </div>
        </div>
    );
}

function Tab({ TABS, activeTab, setActiveTab }) {
    return (
        <div className="border-t px-6">
            <div className="flex gap-8 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-4 pt-4 text-sm font-semibold border-b-2 transition whitespace-nowrap
                  ${activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}


