import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import JobDetailsTab from "./tabs/JDTab";
import CompensationTab from "./tabs/CompensationTab";
import ContractTab from "./tabs/ContractTab";
import LifecycleTab from "./tabs/LifecycleTab";
import FilesTab from "./tabs/FilesTab";
import LeaveTab from "./tabs/LeaveTab";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function EmployeeDetailScreen() {
  const { emp_id } = useParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [employeeProfile, setEmployeeProfile] = useState({});
  useEffect(() => async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Không tìm thấy token");
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/hradmin/employee-profile/${emp_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setEmployeeProfile(res.data.employeeInfo)
        }
      })
  }, [emp_id])
  
  const TABS = [
    { key: "profile", label: "Profile" },
    { key: "job", label: "Job Info" },
    { key: "contract", label: "Contract" },
    { key: "lifecycle", label: "Lifecycle" },
    { key: "files", label: "Files" },
    { key: "compensation", label: "Compensation" },
    { key: "leave", label: "Leave" },
  ];


  return (
    <div className="w-full px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-6">
      {/* BREADCRUMB */}
      <BreadCrumb employeeInfo={employeeProfile} />

      {/* ===== PROFILE HEADER + TABS ===== */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* PROFILE */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={employeeProfile.avatar}
                alt={employeeProfile.avatar}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold">
                  {employeeProfile.employeeName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {employeeProfile.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    badge
                  </span>
                  ID: {employeeProfile.employeeId}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    work
                  </span>
                  {employeeProfile.positionName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold">
              Edit Profile
            </button>
            <button className="px-5 py-2.5 bg-slate-100 rounded-lg text-sm font-bold flex items-center gap-1">
              Manage
              <span className="material-symbols-outlined text-[18px]">
                expand_more
              </span>
            </button>
          </div>
        </div>

        {/* ===== NAV TABS ===== */}
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
      </div>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card title="General Information" icon="person">
              <Row label="Full Name" value={employeeProfile.employeeName} />
              <Row label="Date of Birth" value={employeeProfile.birthday} />
              <Row label="Gender" value={employeeProfile.gender} />
              <Row
                label="Nationality"
                value={employeeProfile.nationality}
              />
              <Row label="Marital Status" value={employeeProfile.maritalStatus} />
            </Card>

            <Card title="Identification" icon="id_card">
              <Row
                label="ID / Passport No."
                value={employeeProfile.identificationCode}
              />
              <Row
                label="Issue Date"
                value={employeeProfile.issueDate}
              />
              <Row
                label="Place of Issue"
                value={employeeProfile.issuePlace}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Contact Information" icon="contact_page">
              <Row
                label="Personal Email"
                value={employeeProfile.personalEmail}
                link
              />
              <Row
                label="Work Email"
                value={employeeProfile.workEmail}
                link
              />
              <Row
                label="Phone Number"
                value={employeeProfile.phoneNumber}
              />
              <Row
                label="LinkedIn"
                value={employeeProfile.linkedln || "Not defined"}
                link={employeeProfile.linkedln == null ? false : true}
              />
            </Card>

            <Card title="Address Details" icon="location_on">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                  Permanent Address
                </p>
                <p className="text-sm font-semibold">
                  {employeeProfile.permanentAddress || "Undefined"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                  Current Residence
                </p>
                <p className="text-sm font-semibold">
                  {employeeProfile.currentAddress || "Undefined"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "job" && (
        <JobDetailsTab />
      )}
      {activeTab === "compensation" && (
        <CompensationTab />
      )}
      {activeTab === "contract" && (
        <ContractTab />
      )}
      {activeTab === "lifecycle" && (
        <LifecycleTab />
      )}
      {activeTab == "files" && (
        <FilesTab />
      )}
      {activeTab === "leave" && (
        <LeaveTab />
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

function Card({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b bg-slate-50 font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">
          {icon}
        </span>
        {title}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, value, link }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      {link ? (
        <span className="text-sm font-bold text-primary hover:underline cursor-pointer">
          {value}
        </span>
      ) : (
        <span className="text-sm font-bold">{value}</span>
      )}
    </div>
  );
}

function BreadCrumb({ employeeInfo }) {
  return (
    <div className="text-sm text-slate-500">
      Employees /{" "}
      <span className="font-semibold text-slate-900">
        {employeeInfo.employeeName}
      </span>
    </div>
  );
}