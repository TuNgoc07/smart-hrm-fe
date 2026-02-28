import { useParams } from "react-router-dom";
import { useState } from "react";
import JobDetailsTab from "./tabs/JDTab";
import CompensationTab from "./tabs/CompensationTab";
import ContractTab from "./tabs/ContractTab";
import LifecycleTab from "./tabs/LifecycleTab";
import FilesTab from "./tabs/FilesTab";



export default function EmployeeDetailScreen() {
  const { emp_id } = useParams();
  const [activeTab, setActiveTab] = useState("profile");

  const TABS = [
    { key: "profile", label: "Profile" },
    { key: "job", label: "Job Info" },
    { key: "contract", label: "Contract" },
    { key: "lifecycle", label: "Lifecycle" },
    { key: "files", label: "Files" },
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
    <div className="w-full px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-6">
      {/* BREADCRUMB */}
      <BreadCrumb employee={employee} />

      {/* ===== PROFILE HEADER + TABS ===== */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* PROFILE */}
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
              <Row label="Full Name" value={employee.name} />
              <Row label="Date of Birth" value={employee.general.dob} />
              <Row label="Gender" value={employee.general.gender} />
              <Row
                label="Nationality"
                value={employee.general.nationality}
              />
              <Row label="Marital Status" value={employee.general.marital} />
            </Card>

            <Card title="Identification" icon="id_card">
              <Row
                label="ID / Passport No."
                value={employee.identification.idNumber}
              />
              <Row
                label="Issue Date"
                value={employee.identification.issueDate}
              />
              <Row
                label="Place of Issue"
                value={employee.identification.place}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Contact Information" icon="contact_page">
              <Row
                label="Personal Email"
                value={employee.contact.personalEmail}
                link
              />
              <Row
                label="Work Email"
                value={employee.contact.workEmail}
                link
              />
              <Row
                label="Phone Number"
                value={employee.contact.phone}
              />
              <Row
                label="LinkedIn"
                value={employee.contact.linkedin}
                link
              />
            </Card>

            <Card title="Address Details" icon="location_on">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                  Permanent Address
                </p>
                <p className="text-sm font-semibold">
                  {employee.address.permanent}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                  Current Residence
                </p>
                <p className="text-sm font-semibold">
                  {employee.address.current}
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