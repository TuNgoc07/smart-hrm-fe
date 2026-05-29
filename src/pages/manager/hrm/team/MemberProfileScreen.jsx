import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function MemberProfileScreen() {
    // Lấy employeeId từ URL params: /manager/profile/:employeeId
    const { employeeId } = useParams();
    const navigate = useNavigate();

    // ===== STATE =====
    const [profile, setProfile] = useState(null);   // TeamMemberProfileDTO từ API
    const [loading, setLoading] = useState(true);   // Loading indicator
    const [error, setError] = useState(null);       // Error message

    // ===== FETCH PROFILE =====
    useEffect(() => {
        if (!employeeId) return;
        fetchProfile();
    }, [employeeId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            // Gọi API GET /api/manager/team-members/{employeeId}
            const res = await fetch(`${API_BASE_URL}/api/manager/team-members/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch member profile");
            const json = await res.json();
            setProfile(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ===== RENDER =====
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                {error || "Profile not found"}
            </div>
        );
    }

    return (
        <div>
            {/* Nút quay lại danh sách */}
            <BreadCrumb onBack={() => navigate("/manager/team/members")} />
            {/* Header: avatar + tên + chức danh + tabs */}
            <ProfileHeader profile={profile} />
            {/* Nội dung chính: job info + attendance + quick stats */}
            <Content profile={profile} />
        </div>
    );
}

function BreadCrumb({ onBack }) {
    return (
        <div className="mb-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-sm transition-colors"
            >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Back to Team List</span>
            </button>
        </div>
    );
}

/* ===== PROFILE HEADER: avatar + tên + chức danh + tenure badge ===== */
function ProfileHeader({ profile }) {
    // Lấy chữ cái đầu nếu không có avatar
    const initials = profile.fullName
        .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    {/* Avatar hoặc fallback initials */}
                    {profile.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt={profile.fullName}
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-800"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold ring-4 ring-slate-50 dark:ring-slate-800">
                            {initials}
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {profile.fullName}
                            </h1>
                            {/* Badge trạng thái nhân sự */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {profile.employmentStatus || "Active"}
                            </div>
                        </div>
                        {/* Chức danh | Mã nhân viên */}
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {profile.positionName} |{" "}
                            <span className="text-primary font-bold">{profile.empCode}</span>
                        </p>
                        {/* Phòng ban */}
                        <p className="text-slate-400 text-sm">{profile.departmentName}</p>
                    </div>
                </div>

                {/* Tenure badge — tính từ hireDate */}
                <div className="flex flex-wrap gap-2 md:self-start">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
                        <p className="text-xs text-slate-400 font-medium uppercase">Tenure</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                            {profile.tenure || "—"}
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
                        <p className="text-xs text-slate-400 font-medium uppercase">Attendance</p>
                        <p className="text-base font-bold text-primary">
                            {profile.attendanceRateThisMonth}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab navigation (decorative — chỉ Overview active) */}
            <div className="flex gap-8 mt-10 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button className="pb-4 text-sm font-bold border-b-2 border-primary text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">info</span> Overview
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">schedule</span> Attendance
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">approval</span> Requests
                </button>
            </div>
        </div>
    );
}

/* ===== CONTENT: 2 cột — main (job info + attendance) | sidebar (quick stats) ===== */
function Content({ profile }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột chính */}
            <div className="lg:col-span-2 space-y-8">
                <JobInfoCard profile={profile} />
                <AttendancePreviewTable recentAttendance={profile.recentAttendance || []} />
            </div>
            {/* Cột sidebar */}
            <div className="space-y-8">
                <QuickStatsCard profile={profile} />
            </div>
        </div>
    );
}

/* ===== JOB INFORMATION CARD ===== */
function JobInfoCard({ profile }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">work</span> Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {/* Chức danh */}
                <InfoField label="Position" value={profile.positionName} />
                {/* Phòng ban */}
                <InfoField label="Department" value={profile.departmentName} />
                {/* Loại hợp đồng */}
                <InfoField label="Employment Type" value={profile.employmentType || "—"} />
                {/* Mô hình làm việc */}
                <InfoField label="Working Model" value={profile.workingModel || "—"} />
                {/* Ngày gia nhập */}
                <InfoField
                    label="Join Date"
                    value={profile.hireDate ? formatDate(profile.hireDate) : "—"}
                />
                {/* Thâm niên */}
                <InfoField label="Tenure" value={profile.tenure || "—"} />
            </div>
        </div>
    );
}

/* Một ô thông tin nhỏ trong JobInfoCard */
function InfoField({ label, value }) {
    return (
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">{label}</p>
            <p className="text-slate-700 dark:text-slate-200 font-medium">{value}</p>
        </div>
    );
}

/* ===== ATTENDANCE PREVIEW TABLE (7 ngày gần nhất) ===== */
function AttendancePreviewTable({ recentAttendance }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    Recent Attendance (7 days)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Day</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Check-in</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Check-out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentAttendance.map((day) => (
                            <AttendanceDayRow key={day.date} day={day} />
                        ))}
                        {recentAttendance.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-6 text-center text-slate-400 text-sm">
                                    No attendance data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* 1 hàng trong bảng attendance */
function AttendanceDayRow({ day }) {
    // Map status → badge style
    const statusCfg = {
        present:   { label: "Present", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
        absent:    { label: "Absent",  cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        "on-leave":{ label: "On Leave",cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        weekend:   { label: "Weekend", cls: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400" },
        no_record: { label: "—",       cls: "bg-slate-100 text-slate-400" },
    };
    const { label, cls } = statusCfg[day.status] || statusCfg.no_record;

    // Format ngày "2024-05-10" → "May 10, 2024"
    const dateLabel = (() => {
        try {
            return new Date(day.date).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
            });
        } catch { return day.date; }
    })();

    return (
        <tr className={day.status === "weekend" ? "opacity-50" : ""}>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{dateLabel}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">{day.dayLabel}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${cls}`}>
                    {label}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{day.checkin || "—"}</td>
            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{day.checkout || "—"}</td>
        </tr>
    );
}

/* ===== QUICK STATS CARD (sidebar) ===== */
function QuickStatsCard({ profile }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6">Quick Stats</h3>
            <div className="space-y-4">
                {/* Số ngày đến muộn trong 30 ngày qua */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-slate-400 text-xs font-bold uppercase">Attendance Issues</p>
                        <p className="text-slate-500 text-[10px] italic">Late arrivals last 30 days</p>
                    </div>
                    <p className={`text-2xl font-bold ${profile.attendanceIssuesLast30Days > 0 ? "text-amber-600" : "text-green-500"}`}>
                        {profile.attendanceIssuesLast30Days}
                    </p>
                </div>

                {/* Tổng OT tháng này */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-slate-400 text-xs font-bold uppercase">OT Hours</p>
                        <p className="text-slate-500 text-[10px] italic">This month</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{profile.otHoursThisMonth}</p>
                </div>

                {/* Tỷ lệ chuyên cần tháng này */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-slate-400 text-xs font-bold uppercase">Attendance Rate</p>
                        <p className="text-slate-500 text-[10px] italic">This month</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                        {profile.attendanceRateThisMonth}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* Format "2022-01-12" → "January 12, 2022" */
function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            day: "numeric", month: "long", year: "numeric",
        });
    } catch {
        return dateStr;
    }
}