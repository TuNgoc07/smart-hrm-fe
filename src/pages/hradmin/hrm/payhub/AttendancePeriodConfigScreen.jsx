import { useState, useEffect } from "react";

/**
 * AttendancePeriodConfigScreen
 *
 * Màn hình cấu hình kỳ chấm công dành cho HR Admin.
 * Truy cập từ: Payhub → Attendance Period Config
 *
 * Chức năng:
 *  1. Hiển thị cấu hình hiện tại (cycleStartDay)
 *  2. Form cập nhật cycleStartDay (1–28)
 *  3. Preview kỳ hiện tại + 5 kỳ tiếp theo ngay sau khi nhập
 *  4. Lưu về backend qua POST /api/hradmin/payroll-cycles/attendance-period-config
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/** Helper: lấy header với Bearer token */
function getHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
}

/** Tính ngày bắt đầu/kết thúc kỳ chứa 'today' từ cycleStartDay (mirror logic backend) */
function deriveCurrentPeriod(startDay, today = new Date()) {
    const day = today.getDate();
    let periodStart;
    if (day >= startDay) {
        /* Hôm nay đã qua ngày bắt đầu → kỳ bắt đầu tháng này */
        periodStart = new Date(today.getFullYear(), today.getMonth(), startDay);
    } else {
        /* Chưa đến ngày bắt đầu → kỳ bắt đầu từ tháng trước */
        periodStart = new Date(today.getFullYear(), today.getMonth() - 1, startDay);
    }
    /* Kết thúc = 1 ngày trước start của kỳ tiếp theo */
    const nextStart = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, startDay);
    const periodEnd = new Date(nextStart - 86400000);
    return { start: periodStart, end: periodEnd };
}

/** Format Date → "dd MMM yyyy" */
function fmtDate(d) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Tạo danh sách 6 kỳ preview (kỳ hiện tại + 5 kỳ tiếp theo) */
function buildPreviewCycles(startDay) {
    if (!startDay || startDay < 1 || startDay > 28) return [];
    const today = new Date();
    const { start: currentStart } = deriveCurrentPeriod(startDay, today);
    const cycles = [];
    for (let i = 0; i < 6; i++) {
        /* Dịch forward i tháng so với kỳ hiện tại */
        const start = new Date(currentStart.getFullYear(), currentStart.getMonth() + i, startDay);
        const nextStart = new Date(start.getFullYear(), start.getMonth() + 1, startDay);
        const end = new Date(nextStart - 86400000);
        cycles.push({
            label: `${fmtDate(start)} – ${fmtDate(end)}`,
            isCurrent: i === 0,
        });
    }
    return cycles;
}

export default function AttendancePeriodConfigScreen() {
    /* ── State ─────────────────────────────────────────────────────── */
    const [config, setConfig] = useState(null);      /* config từ DB */
    const [loading, setLoading] = useState(true);    /* đang fetch */
    const [saving, setSaving] = useState(false);     /* đang save */
    const [startDay, setStartDay] = useState("");    /* giá trị input */
    const [description, setDescription] = useState(""); /* mô tả */
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ── Fetch config hiện tại từ backend ─────────────────────────── */
    useEffect(() => {
        fetch(`${API_BASE}/api/hradmin/payroll-cycles/attendance-period-config`, {
            headers: getHeaders(),
        })
            .then(r => r.json())
            .then(json => {
                if (json.status === "success" && json.data?.cycleStartDay) {
                    /* Đã có config → pre-fill form */
                    setConfig(json.data);
                    setStartDay(String(json.data.cycleStartDay));
                    setDescription(json.data.description || "");
                }
            })
            .catch(() => setError("Do not load config. Please try again."))
            .finally(() => setLoading(false));
    }, []);

    /* ── Preview cycles (re-compute khi startDay thay đổi) ─────────── */
    const previewCycles = buildPreviewCycles(Number(startDay));

    /* ── Submit handler ─────────────────────────────────────────────── */
    const handleSave = async () => {
        setError("");
        setSuccess("");
        const day = Number(startDay);
        if (!day || day < 1 || day > 28) {
            setError("Please enter a valid day from 1 to 28.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/hradmin/payroll-cycles/attendance-period-config`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({ cycleStartDay: day, description }),
                }
            );
            const json = await res.json();
            if (!res.ok || json.status !== "success") {
                throw new Error(json.message || "Failed to save.");
            }
            /* Cập nhật state từ response mới */
            setConfig(json.data);
            setSuccess("Attendance period configuration has been saved successfully!");
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    /* ── Render ─────────────────────────────────────────────────────── */
    return (
        <div className="space-y-8 max-w-4xl">
            {/* ── Header ── */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Attendance Period Configuration
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Configure the start day of the attendance period. The system will automatically calculate the period for all months.
                </p>
            </div>

            {/* ── Current Config Banner (nếu đã có) ── */}
            {config && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">info</span>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                Current configuration: Start day of the period <span className="text-blue-600">{config.cycleStartDay}</span> every month
                            </p>
                            {/* Hiển thị kỳ hiện tại auto-derived từ backend */}
                            {config.currentPeriodLabel && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                    Current period: <span className="font-semibold">{config.currentPeriodLabel}</span>
                                </p>
                            )}
                            {config.configuredBy && (
                                <p className="text-xs text-slate-400 mt-1">
                                    Cấu hình bởi: {config.configuredBy}
                                    {config.updatedAt && ` • ${new Date(config.updatedAt).toLocaleDateString("vi-VN")}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Config Form ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">settings</span>
                        Cài đặt kỳ chấm công
                    </h2>

                    {loading ? (
                        /* Loading skeleton */
                        <div className="space-y-3">
                            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* ── Input: Ngày bắt đầu kỳ ── */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Ngày bắt đầu kỳ chấm công <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="28"
                                        value={startDay}
                                        onChange={e => {
                                            /* Reset feedback khi user đang nhập */
                                            setError("");
                                            setSuccess("");
                                            setStartDay(e.target.value);
                                        }}
                                        placeholder="Ví dụ: 10"
                                        className="w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center text-xl font-bold px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        <p>every month</p>
                                        <p className="text-xs text-slate-400">(1 – 28)</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Limit to 28 to avoid errors with February (28 days).
                                </p>
                            </div>

                            {/* ── Input: Mô tả ── */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Mô tả (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Ví dụ: Kỳ từ ngày 10 mỗi tháng"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* ── Error / Success feedback ── */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    {success}
                                </div>
                            )}

                            {/* ── Submit Button ── */}
                            <button
                                onClick={handleSave}
                                disabled={saving || !startDay}
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
                            >
                                {saving ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        {config ? "Update configuration" : "Save configuration"}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Period Preview Panel ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">preview</span>
                        Preview Attendance Period
                    </h2>

                    {!startDay || previewCycles.length === 0 ? (
                        /* Chưa nhập ngày → hiển thị placeholder */
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl mb-3">
                                calendar_month
                            </span>
                            <p className="text-sm text-slate-400">
                                Enter a start day to preview the attendance period
                            </p>
                        </div>
                    ) : (
                        /* Danh sách 6 kỳ preview */
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                                Kỳ hiện tại + 5 kỳ tiếp theo
                            </p>
                            {previewCycles.map((cycle, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                        cycle.isCurrent
                                            ? "bg-primary/10 border-primary/30 dark:bg-primary/20"
                                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {cycle.isCurrent && (
                                            /* Badge "Current" chỉ hiện trên kỳ đầu tiên */
                                            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase">
                                                Hiện tại
                                            </span>
                                        )}
                                        <span className={`text-sm font-medium ${
                                            cycle.isCurrent
                                                ? "text-primary font-bold"
                                                : "text-slate-600 dark:text-slate-300"
                                        }`}>
                                            {cycle.label}
                                        </span>
                                    </div>
                                    <span className="material-symbols-outlined text-[18px] text-slate-300 dark:text-slate-600">
                                        chevron_right
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Info Box: Giải thích logic ── */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">help</span>
                    How the system calculates the attendance period
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="space-y-1">
                        <p className="font-bold text-slate-600 dark:text-slate-300">Example: Start day = 10</p>
                        <p>Today: 25/05/2026</p>
                        <p className="text-primary font-semibold">→ Period: 10/05 – 09/06/2026</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-600 dark:text-slate-300">Example: Start day = 10</p>
                        <p>Today: 08/05/2026</p>
                        <p className="text-primary font-semibold">→ Period: 10/04 – 09/05/2026</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-600 dark:text-slate-300">Automatic fallback</p>
                        <p>If no config is set, the system will use the default calendar month.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
