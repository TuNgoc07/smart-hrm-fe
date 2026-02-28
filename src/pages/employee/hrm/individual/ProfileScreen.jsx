import { useParams } from "react-router-dom";
import { useState } from "react";
import JobDetailsTab from "./tabs/JDTab";
import ProfileTab from "./tabs/ProfileTab";
import ContractTab from "./tabs/ContractTab";
import CompensationTab from "./tabs/CompensationTab";

export default function ProfileScreen() {
    const { emp_id } = useParams();
    const [activeTab, setActiveTab] = useState("profile");

    const TABS = [
        { key: "profile", label: "Profile" },
        { key: "job", label: "Job Info" },
        { key: "contract", label: "Contract" },
        { key: "compensation", label: "Compensation" },
    ];

    const employee = {
        id: emp_id,
        name: "Nguyễn Văn A",
        code: "NV1234",
        position: "Senior Product Designer",
        status: "Active",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBq3GcFOTgS_aEoggqdDrQ7w_cmDaIVLPt3HIS-xYtaeXttRtMDtmIgg4CKv0iZIyze4jDXhWk18HpAceDAK4y9ldi3BQLJncy26oUsnwSiyX9p-bHcZ7pmdm9CHf1OGqxiiJJWzBdmQfYizSAHyOtb9rnj7-sTOap6wbYqYOYF5s8OsR5dPOcJvOlQq2M4Y67_g2cazbwGC7X7ovDEBGGmLUacme8w-lJOMDOWi_aAs2iXobZMcLNkBjPFVl2D-Tve-vM-7xWDq38",
        general: {
            dob: "15 May, 1992",
            gender: "Male",
            nationality: "Vietnamese",
            marital: "Single",
        },
        contact: {
            personalEmail: "nguyen.a@gmail.com",
            workEmail: "a.nguyen@smartent.com",
            phone: "+84 908 123 456",
            linkedin: "/in/nguyen-a-design",
        },
        identification: {
            idNumber: "001092837465",
            issueDate: "20 Dec, 2018",
            place: "Police Dept. of Residence",
        },
        address: {
            permanent:
                "123 Nguyen Hue St, Ward 1, District 1, Ho Chi Minh City, Vietnam",
            current:
                "456 Le Loi Blvd, Ward 4, District 3, Ho Chi Minh City, Vietnam",
        },
    };

    return (
        <div className="w-full px-6 space-y-6">
            {/* BREADCRUMB */}
            <BreadCrumb employee={employee} />

            {/* ===== PROFILE HEADER + TABS ===== */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {/* PROFILE */}
                <ProfileHeader employee={employee} />

                {/* ===== NAV TABS ===== */}
                <Tab TABS={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* ===== TAB CONTENT ===== */}
            {activeTab === "profile" && (
                <ProfileTab employee={employee} />
            )}

            {activeTab === "job" && (
                <JobDetailsTab employee={employee} />
            )}
            {activeTab === "compensation" && (
                <CompensationTab />
            )}
            {activeTab === "contract" && (
                <ContractTab />
            )}
            

            {/* FOOTER */}
            <div className="flex justify-between text-xs text-slate-500 pt-6">
                <p>Last updated: 2 hours ago by Admin Jane Doe</p>
                <p>Employee since October 12, 2021</p>
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


