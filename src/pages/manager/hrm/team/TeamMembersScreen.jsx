import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function TeamMembersScreen() {
    const navigate = useNavigate();

    // ===== STATE =====
    const [data, setData] = useState(null);         // TeamMembersDTO từ API
    const [loading, setLoading] = useState(true);   // Loading indicator
    const [error, setError] = useState(null);       // Error message
    const [search, setSearch] = useState("");       // Tìm kiếm theo tên/mã
    const [statusFilter, setStatusFilter] = useState("all"); // Filter trạng thái attendance

    // ===== FETCH DATA =====
    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            // Gọi API GET /api/manager/team-members
            const res = await fetch(`${API_BASE_URL}/api/manager/team-members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch team members");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ===== FILTER LOGIC (client-side) =====
    const filteredMembers = (data?.members || []).filter((m) => {
        // Tìm kiếm theo tên hoặc mã nhân viên (không phân biệt hoa thường)
        const matchSearch =
            search === "" ||
            m.fullName.toLowerCase().includes(search.toLowerCase()) ||
            m.empCode.toLowerCase().includes(search.toLowerCase());

        // Filter theo trạng thái attendance hôm nay
        const matchStatus =
            statusFilter === "all" || m.attendanceTodayStatus === statusFilter;

        return matchSearch && matchStatus;
    });

    // ===== RENDER =====
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-6">
            <BreadCrumb />

            {/* Summary Stats từ API */}
            <SummarySection
                totalMembers={data?.totalMembers ?? 0}
                activeCount={data?.activeCount ?? 0}
                onLeaveToday={data?.onLeaveTodayCount ?? 0}
                attendanceIssues={data?.attendanceIssuesCount ?? 0}
            />

            {/* Filter + Search */}
            <FilterSection
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            {/* Bảng danh sách nhân viên */}
            <MembersTable members={filteredMembers} navigate={navigate} />
        </div>
    );
}

/* ===== BREADCRUMB ===== */
function BreadCrumb() {
    return (
        <div className="space-y-2">
            <nav className="flex items-center text-xs font-medium text-[#4c739a] dark:text-slate-400">
                <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
                <span className="material-symbols-outlined text-base mx-1 text-slate-300 dark:text-slate-600">chevron_right</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Team HR</span>
                <span className="material-symbols-outlined text-base mx-1 text-slate-300 dark:text-slate-600">chevron_right</span>
                <span className="text-[#0d141b] dark:text-slate-200">Members</span>
            </nav>
            <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
        </div>
    );
}

/* ===== SUMMARY STATS — nhận props từ API data ===== */
function SummarySection({ totalMembers, activeCount, onLeaveToday, attendanceIssues }) {
    // Tỷ lệ active: activeCount / totalMembers × 100
    const activeRate = totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Members" value={totalMembers} />
            <StatCard
                label="Active"
                value={activeCount}
                badge={`${activeRate}%`}
                badgeColor="green"
                valueColor="text-green-600"
            />
            <StatCard label="On Leave Today" value={onLeaveToday} valueColor="text-primary" />
            <StatCard label="Attendance Issues" value={attendanceIssues} valueColor="text-orange-500" />
        </div>
    );
}

/* Thẻ stat nhỏ — dùng trong SummarySection */
function StatCard({ label, value, badge, badgeColor, valueColor = "" }) {
    const badgeClass = badgeColor === "green"
        ? "bg-green-100 text-green-700"
        : "bg-slate-100 text-slate-600";

    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium text-[#4c739a] dark:text-slate-400">{label}</p>
            <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
                {badge && (
                    <span className={`text-xs font-bold px-1.5 rounded ${badgeClass}`}>{badge}</span>
                )}
            </div>
        </div>
    );
}

/* ===== FILTER SECTION — search + dropdown trạng thái ===== */
function FilterSection({ search, onSearchChange, statusFilter, onStatusFilterChange }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
            {/* Ô tìm kiếm */}
            <div className="flex-1 min-w-[240px]">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2 border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary"
                        placeholder="Search by name or ID"
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            {/* Dropdown filter theo trạng thái attendance hôm nay */}
            <select
                className="border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm px-4 py-2 focus:ring-primary min-w-[160px]"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
            >
                <option value="all">All Attendance</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="on-leave">On Leave</option>
            </select>
        </div>
    );
}

/* ===== MEMBERS TABLE — nhận mảng members từ props ===== */
function MembersTable({ members, navigate }) {
    if (members.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-12 text-center shadow-sm">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">group_off</span>
                <p className="mt-2 text-slate-500 text-sm font-medium">No members found</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#cfdbe7] dark:border-slate-700">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Position</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Today</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Join Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((member) => (
                        // Mỗi row click → navigate tới profile của nhân viên đó
                        <MemberRow
                            key={member.employeeId}
                            member={member}
                            onClick={() => navigate(`/manager/profile/${member.employeeId}`)}
                        />
                    ))}
                </tbody>
            </table>
            {/* Footer đơn giản: hiển thị số lượng kết quả */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-[#cfdbe7] dark:border-slate-700">
                <span className="text-sm text-[#4c739a] dark:text-slate-400 font-medium">
                    Showing {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
}

/* ===== MemberRow — 1 hàng trong bảng ===== */
function MemberRow({ member, onClick }) {
    // Lấy chữ cái đầu của tên để hiển thị avatar fallback
    const initials = member.fullName
        .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <tr
            onClick={onClick}
            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
            {/* Cột Employee: avatar + tên + mã */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                        <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="size-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                    ) : (
                        // Avatar fallback: vòng tròn màu với chữ cái đầu
                        <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-700">
                            {initials}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-bold">{member.fullName}</p>
                        <p className="text-xs text-[#4c739a] dark:text-slate-400">#{member.empCode}</p>
                    </div>
                </div>
            </td>

            {/* Cột Position */}
            <td className="px-6 py-4">
                <p className="text-sm font-medium">{member.positionName}</p>
                <p className="text-xs text-slate-400">{member.departmentName}</p>
            </td>

            {/* Cột Employment Status */}
            <td className="px-6 py-4">
                <EmploymentStatusBadge status={member.employmentStatus} />
            </td>

            {/* Cột Attendance Today */}
            <td className="px-6 py-4">
                <AttendanceTodayCell member={member} />
            </td>

            {/* Cột Join Date */}
            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {member.hireDate ? formatDate(member.hireDate) : "—"}
            </td>

            {/* Cột Action */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
            </td>
        </tr>
    );
}

/* Badge trạng thái nhân sự */
function EmploymentStatusBadge({ status }) {
    const cfg = {
        active:       { label: "Active",      cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        inactive:     { label: "Inactive",    cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400" },
        on_probation: { label: "Probation",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    };
    const { label, cls } = cfg[status] || cfg.active;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
            {label}
        </span>
    );
}

/* Cell hiển thị trạng thái attendance hôm nay */
function AttendanceTodayCell({ member }) {
    // Map status → màu dot + label
    const cfg = {
        present:  { dot: "bg-green-500",  label: "Present",  extra: member.checkinTime ? `${member.checkinTime}` : "" },
        absent:   { dot: "bg-red-500",    label: "Absent",   extra: "" },
        "on-leave": { dot: "bg-blue-500",   label: "On Leave", extra: "" },
    };
    const { dot, label, extra } = cfg[member.attendanceTodayStatus] || cfg.absent;
    return (
        <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full flex-shrink-0 ${dot}`} />
            <div>
                <span className="text-sm font-medium">{label}</span>
                {extra && <p className="text-[10px] text-slate-400">{extra}</p>}
            </div>
        </div>
    );
}

/* Format "2022-01-12" → "12 Jan 2022" */
function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
        });
    } catch {
        return dateStr;
    }
}