import { useEffect, useState } from "react";
import { fetchAiInsightsSummary } from "../../../../../utils/hrApi";

/**
 * AIInsightsDashboard — trang HR Admin hiển thị AI Insights.
 *
 * Data flow:
 *   Component mount → fetchAiInsightsSummary(lookbackDays) → backend /api/hradmin/ai-insights/summary
 *     → AiInsightsServiceImpl.getSummary()
 *       → getAttendanceAnomalies() : rule-based late/absent detection
 *       → getPayrollAnomalies()    : statistical outlier detection
 *     → response { kpi, attendanceAnomalies, payrollAnomalies, generatedAt }
 *   → render KPI cards + 2 anomaly tables
 */
export default function AIInsightsDashboard() {
    // ── State ───────────────────────────────────────────────────────────────
    const [data, setData] = useState(null);        // AiInsightsSummaryDTO
    const [loading, setLoading] = useState(true);  // loading state
    const [error, setError] = useState(null);      // error message
    const [lookbackDays, setLookbackDays] = useState(30); // lookback window
    const [activeTab, setActiveTab] = useState("attendance"); // tab: attendance | payroll

    // ── Data Fetch ───────────────────────────────────────────────────────────
    useEffect(() => {
        loadInsights();
    }, [lookbackDays]); // re-fetch khi thay đổi lookback window

    async function loadInsights() {
        setLoading(true);
        setError(null);
        try {
            const summary = await fetchAiInsightsSummary(lookbackDays);
            setData(summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ── Derived values ───────────────────────────────────────────────────────
    const kpi = data?.kpi ?? {};
    const attendanceList = data?.attendanceAnomalies ?? [];
    const payrollList = data?.payrollAnomalies ?? [];

    // Thời gian generate insights, format thân thiện
    const generatedAt = data?.generatedAt
        ? new Date(data.generatedAt).toLocaleString("vi-VN")
        : null;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">

            {/* ── HEADER ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Insights Dashboard</h1>
                    {/* Hiển thị thời gian generate gần nhất */}
                    {generatedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                            Cập nhật lần cuối: {generatedAt}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Selector: khoảng thời gian phân tích chấm công */}
                    <select
                        value={lookbackDays}
                        onChange={e => setLookbackDays(Number(e.target.value))}
                        className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        title="Khoảng thời gian phân tích chấm công"
                    >
                        <option value={14}>14 ngày qua</option>
                        <option value={30}>30 ngày qua</option>
                        <option value={60}>60 ngày qua</option>
                        <option value={90}>90 ngày qua</option>
                    </select>

                    {/* Nút refresh thủ công */}
                    <button
                        onClick={loadInsights}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-60"
                    >
                        <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
                            refresh
                        </span>
                        {loading ? "Đang phân tích..." : "Làm mới"}
                    </button>

                    {/* Badge trạng thái AI */}
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <span className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-green-500"}`} />
                        <span className="text-primary text-xs font-bold uppercase">
                            {loading ? "Scanning..." : "Ready"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── ERROR BANNER ─────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    <div>
                        <p className="font-bold text-red-700 text-sm">Không thể tải AI Insights</p>
                        <p className="text-xs text-red-500">{error}</p>
                    </div>
                </div>
            )}

            {/* ── KPI CARDS ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Attendance anomalies tổng */}
                <KPICard
                    title="Bất thường chấm công"
                    value={loading ? "—" : `${kpi.totalAttendanceAnomalies ?? 0} NV`}
                    badge={`${kpi.highRiskAttendanceCount ?? 0} HIGH risk`}
                    badgeColor={kpi.highRiskAttendanceCount > 0 ? "red" : "green"}
                    icon="calendar_month"
                    sub={`Phân tích ${lookbackDays} ngày qua`}
                    loading={loading}
                />

                {/* KPI 2: Payroll anomalies tổng */}
                <KPICard
                    title="Bất thường lương"
                    value={loading ? "—" : `${kpi.totalPayrollAnomalies ?? 0} NV`}
                    badge={`${kpi.highRiskPayrollCount ?? 0} HIGH risk`}
                    badgeColor={kpi.highRiskPayrollCount > 0 ? "red" : "green"}
                    icon="payments"
                    sub="So sánh với 6 kỳ trước"
                    loading={loading}
                />

                {/* KPI 3: HR attention needed */}
                <KPICard
                    title="HR Cần Xử Lý"
                    value={loading ? "—" : `${kpi.totalHrAttentionNeeded ?? 0} Cases`}
                    badge="HIGH risk cả 2 loại"
                    badgeColor={kpi.totalHrAttentionNeeded > 0 ? "amber" : "green"}
                    icon="priority_high"
                    sub="Ưu tiên cao nhất"
                    loading={loading}
                />

                {/* KPI 4: Tổng anomalies */}
                <KPICard
                    title="Tổng Anomalies"
                    value={loading ? "—" : `${(kpi.totalAttendanceAnomalies ?? 0) + (kpi.totalPayrollAnomalies ?? 0)}`}
                    badge="Đã phát hiện"
                    badgeColor="primary"
                    icon="troubleshoot"
                    sub="Attendance + Payroll"
                    loading={loading}
                />
            </div>

            {/* ── TAB NAVIGATION ───────────────────────────────────────────── */}
            <div className="border-b flex gap-1">
                {/* Tab 1: Attendance anomalies */}
                <button
                    onClick={() => setActiveTab("attendance")}
                    className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === "attendance"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">calendar_month</span>
                        Bất thường Chấm công
                        {/* Badge đếm số anomalies */}
                        {attendanceList.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {attendanceList.length}
                            </span>
                        )}
                    </span>
                </button>

                {/* Tab 2: Payroll anomalies */}
                <button
                    onClick={() => setActiveTab("payroll")}
                    className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === "payroll"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">payments</span>
                        Bất thường Lương
                        {payrollList.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {payrollList.length}
                            </span>
                        )}
                    </span>
                </button>
            </div>

            {/* ── TAB CONTENT ─────────────────────────────────────────────── */}

            {/* Tab: Attendance Anomalies */}
            {activeTab === "attendance" && (
                <AttendanceAnomalyTable
                    items={attendanceList}
                    loading={loading}
                    lookbackDays={lookbackDays}
                />
            )}

            {/* Tab: Payroll Anomalies */}
            {activeTab === "payroll" && (
                <PayrollAnomalyTable
                    items={payrollList}
                    loading={loading}
                />
            )}

        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ATTENDANCE ANOMALY TABLE
   Hiển thị danh sách nhân viên có bất thường chấm công từ backend.
   Mỗi row: tên, phòng ban, riskLevel badge, lateCount, absentCount, reasons.
═══════════════════════════════════════════════════════════════════════════ */
function AttendanceAnomalyTable({ items, loading, lookbackDays }) {
    if (loading) return <TableSkeleton rows={5} />;

    if (items.length === 0) return (
        <EmptyState
            icon="check_circle"
            title="Không phát hiện bất thường chấm công"
            desc={`Không có nhân viên nào vi phạm ngưỡng trong ${lookbackDays} ngày qua`}
            color="green"
        />
    );

    return (
        <div className="space-y-3">
            {/* Mô tả ngưỡng phát hiện — giúp HR hiểu logic AI */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
                <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                <span>
                    <b>Ngưỡng phát hiện:</b> HIGH = đi muộn ≥5 lần HOẶC vắng ≥3 ngày &nbsp;|&nbsp;
                    MEDIUM = đi muộn ≥3 lần HOẶC vắng ≥2 ngày (trong {lookbackDays} ngày qua)
                </span>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-5 py-3 text-left">Nhân viên</th>
                            <th className="px-5 py-3 text-left">Phòng ban / Chức vụ</th>
                            <th className="px-5 py-3 text-center">Mức rủi ro</th>
                            <th className="px-5 py-3 text-center">Đi muộn</th>
                            <th className="px-5 py-3 text-center">Vắng mặt</th>
                            <th className="px-5 py-3 text-center">Tổng phút muộn</th>
                            <th className="px-5 py-3 text-left">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map(item => (
                            <AttendanceAnomalyRow key={item.employeeId} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * AttendanceAnomalyRow — 1 row trong bảng attendance anomaly.
 * Mỗi row mở rộng được để xem chi tiết reasons.
 */
function AttendanceAnomalyRow({ item }) {
    const [expanded, setExpanded] = useState(false); // toggle expand reasons

    return (
        <>
            <tr className="hover:bg-slate-50 transition-colors">
                {/* Tên nhân viên */}
                <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                        {/* Avatar initials */}
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {item.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div>
                            <p className="font-medium">{item.fullName}</p>
                            <p className="text-[10px] text-slate-400">ID: {item.employeeId}</p>
                        </div>
                    </div>
                </td>

                {/* Phòng ban / Chức vụ */}
                <td className="px-5 py-3 text-slate-600">
                    <p className="text-xs font-medium">{item.department}</p>
                    <p className="text-[10px] text-slate-400">{item.position}</p>
                </td>

                {/* Risk level badge */}
                <td className="px-5 py-3 text-center">
                    <RiskBadge level={item.riskLevel} />
                </td>

                {/* Số lần đi muộn */}
                <td className="px-5 py-3 text-center">
                    <span className={`text-sm font-bold ${item.lateCount >= 5 ? "text-red-600" : item.lateCount >= 3 ? "text-amber-600" : "text-slate-700"}`}>
                        {item.lateCount} lần
                    </span>
                </td>

                {/* Số ngày vắng */}
                <td className="px-5 py-3 text-center">
                    <span className={`text-sm font-bold ${item.absentCount >= 3 ? "text-red-600" : item.absentCount >= 2 ? "text-amber-600" : "text-slate-700"}`}>
                        {item.absentCount} ngày
                    </span>
                </td>

                {/* Tổng phút muộn */}
                <td className="px-5 py-3 text-center text-slate-600 text-sm">
                    {item.totalLateMinutes > 0 ? `${item.totalLateMinutes} phút` : "—"}
                </td>

                {/* Toggle expand */}
                <td className="px-5 py-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                    >
                        {expanded ? "Ẩn" : "Xem chi tiết"}
                        <span className="material-symbols-outlined text-sm">
                            {expanded ? "expand_less" : "expand_more"}
                        </span>
                    </button>
                </td>
            </tr>

            {/* Expanded row: hiển thị reasons + period */}
            {expanded && (
                <tr className="bg-amber-50/60">
                    <td colSpan={7} className="px-5 py-3">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Chi tiết phát hiện — {item.analyzedPeriod}
                            </p>
                            {item.reasons?.map((reason, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                    <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                                    <span>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAYROLL ANOMALY TABLE
   Hiển thị danh sách nhân viên có bất thường lương từ backend.
   Mỗi row: tên, phòng ban, cycle, riskLevel, currentGross, avgGross, deviation%.
═══════════════════════════════════════════════════════════════════════════ */
function PayrollAnomalyTable({ items, loading }) {
    if (loading) return <TableSkeleton rows={5} />;

    if (items.length === 0) return (
        <EmptyState
            icon="check_circle"
            title="Không phát hiện bất thường lương"
            desc="Lương của tất cả nhân viên trong cycle mới nhất nằm trong ngưỡng bình thường"
            color="green"
        />
    );

    return (
        <div className="space-y-3">
            {/* Mô tả thuật toán */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
                <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                <span>
                    <b>Ngưỡng phát hiện:</b> HIGH = gross lệch &gt;40% HOẶC OT tăng &gt;100% &nbsp;|&nbsp;
                    MEDIUM = gross lệch &gt;25% HOẶC OT tăng &gt;60% (so với trung bình 6 kỳ trước)
                </span>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-5 py-3 text-left">Nhân viên</th>
                            <th className="px-5 py-3 text-left">Phòng ban</th>
                            <th className="px-5 py-3 text-left">Kỳ lương</th>
                            <th className="px-5 py-3 text-center">Mức rủi ro</th>
                            <th className="px-5 py-3 text-right">Gross hiện tại</th>
                            <th className="px-5 py-3 text-right">Gross TB (6 kỳ)</th>
                            <th className="px-5 py-3 text-center">Lệch %</th>
                            <th className="px-5 py-3 text-left">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map(item => (
                            <PayrollAnomalyRow key={item.employeeId} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * PayrollAnomalyRow — 1 row trong bảng payroll anomaly.
 */
function PayrollAnomalyRow({ item }) {
    const [expanded, setExpanded] = useState(false);

    // Format tiền VND với dấu phân cách hàng nghìn
    const fmtVnd = val => val != null
        ? new Intl.NumberFormat("vi-VN").format(val) + "đ"
        : "—";

    // Màu hiển thị % lệch: đỏ nếu tăng cao, xanh nếu bình thường
    const deviationColor = pct => {
        if (pct > 40 || pct < -30) return "text-red-600 font-bold";
        if (pct > 25 || pct < -20) return "text-amber-600 font-bold";
        return "text-slate-600";
    };

    return (
        <>
            <tr className="hover:bg-slate-50 transition-colors">
                {/* Tên nhân viên */}
                <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {item.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div>
                            <p className="font-medium">{item.fullName}</p>
                            <p className="text-[10px] text-slate-400">ID: {item.employeeId}</p>
                        </div>
                    </div>
                </td>

                {/* Phòng ban */}
                <td className="px-5 py-3 text-xs text-slate-600">{item.department}</td>

                {/* Cycle label */}
                <td className="px-5 py-3 text-xs text-slate-600">{item.cycleLabel}</td>

                {/* Risk badge */}
                <td className="px-5 py-3 text-center">
                    <RiskBadge level={item.riskLevel} />
                </td>

                {/* Gross hiện tại */}
                <td className="px-5 py-3 text-right text-sm font-medium">
                    {fmtVnd(item.currentGrossSalary)}
                </td>

                {/* Gross trung bình baseline */}
                <td className="px-5 py-3 text-right text-sm text-slate-500">
                    {fmtVnd(item.avgGrossSalary)}
                </td>

                {/* % lệch gross */}
                <td className="px-5 py-3 text-center">
                    <span className={`text-sm ${deviationColor(item.grossDeviationPct)}`}>
                        {item.grossDeviationPct > 0 ? "+" : ""}{item.grossDeviationPct?.toFixed(1)}%
                    </span>
                </td>

                {/* Toggle expand */}
                <td className="px-5 py-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                    >
                        {expanded ? "Ẩn" : "Chi tiết"}
                        <span className="material-symbols-outlined text-sm">
                            {expanded ? "expand_less" : "expand_more"}
                        </span>
                    </button>
                </td>
            </tr>

            {/* Expanded: chi tiết OT deviation + reasons */}
            {expanded && (
                <tr className="bg-orange-50/60">
                    <td colSpan={8} className="px-5 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* OT deviation info */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">OT Pay Analysis</p>
                                <div className="flex gap-4 text-xs">
                                    <span>OT hiện tại: <b>{fmtVnd(item.currentOtPay)}</b></span>
                                    <span>OT TB: <b>{fmtVnd(item.avgOtPay)}</b></span>
                                    <span className={deviationColor(item.otDeviationPct)}>
                                        Lệch: {item.otDeviationPct > 0 ? "+" : ""}{item.otDeviationPct?.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Reasons từ backend */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lý do phát hiện</p>
                                {item.reasons?.map((reason, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                        <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                                        <span>{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * KPICard — card hiển thị 1 chỉ số tổng hợp trên hàng đầu dashboard.
 * Có loading skeleton khi đang fetch data.
 */
function KPICard({ title, value, badge, badgeColor, icon, sub, loading }) {
    // Map màu badge từ string name → Tailwind class
    const badgeMap = {
        red:     "bg-red-100 text-red-600",
        green:   "bg-green-100 text-green-600",
        amber:   "bg-amber-100 text-amber-600",
        primary: "bg-primary/10 text-primary",
    };

    return (
        <div className="bg-white p-6 rounded-xl border">
            <div className="flex justify-between mb-2">
                <p className="text-sm text-slate-500">{title}</p>
                <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>

            {/* Loading skeleton cho value */}
            {loading
                ? <div className="h-8 bg-slate-100 rounded animate-pulse w-24 mb-2" />
                : <p className="text-2xl font-bold">{value}</p>
            }

            <div className="mt-2 flex items-center gap-2">
                {loading
                    ? <div className="h-4 bg-slate-100 rounded animate-pulse w-20" />
                    : <>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${badgeMap[badgeColor] ?? badgeMap.primary}`}>
                            {badge}
                        </span>
                        <span className="text-xs text-slate-500">{sub}</span>
                    </>
                }
            </div>
        </div>
    );
}

/**
 * RiskBadge — badge màu hiển thị risk level (HIGH/MEDIUM/LOW).
 */
function RiskBadge({ level }) {
    const map = {
        HIGH:   "bg-red-100 text-red-700 border border-red-200",
        MEDIUM: "bg-amber-100 text-amber-700 border border-amber-200",
        LOW:    "bg-green-100 text-green-700 border border-green-200",
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${map[level] ?? map.LOW}`}>
            {level}
        </span>
    );
}

/**
 * TableSkeleton — placeholder rows khi đang loading.
 */
function TableSkeleton({ rows = 4 }) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 h-10" />
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 border-t">
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/5" />
                    </div>
                    <div className="h-5 bg-slate-100 rounded-full animate-pulse w-16" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-12" />
                </div>
            ))}
        </div>
    );
}

/**
 * EmptyState — hiển thị khi không có anomaly nào.
 */
function EmptyState({ icon, title, desc, color = "green" }) {
    const colorMap = {
        green: "text-green-500 bg-green-50 border-green-200",
        blue:  "text-blue-500 bg-blue-50 border-blue-200",
    };
    return (
        <div className={`rounded-xl border p-10 text-center ${colorMap[color] ?? colorMap.green}`}>
            <span className="material-symbols-outlined text-4xl mb-3 block">{icon}</span>
            <p className="font-bold text-base mb-1">{title}</p>
            <p className="text-sm opacity-80">{desc}</p>
        </div>
    );
}