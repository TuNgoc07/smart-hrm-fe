import React from "react";
import { useNavigate } from "react-router-dom";

// ── Metric Card ────────────────────────────────────────────────────────────────
function MetricCard({ metric }) {
    const { label, value, trend, trend_direction } = metric;
    const isUp = trend_direction === "up";
    const isDown = trend_direction === "down";
    const hasTrend = trend && (isUp || isDown);

    return (
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-[#e7edf3] dark:border-slate-700">
            <p className="text-xs text-[#4c739a] font-medium mb-1">{label}</p>
            {hasTrend ? (
                <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-sm ${isUp ? "text-red-500" : "text-emerald-500"}`}>
                        {isUp ? "trending_up" : "trending_down"}
                    </span>
                    <p className={`text-2xl font-extrabold ${isUp ? "text-red-500" : "text-emerald-500"}`}>{value}</p>
                </div>
            ) : (
                <div>
                    <p className="text-2xl font-extrabold text-[#0d141b] dark:text-white">{value}</p>
                    {trend && (
                        <p className="text-xs text-[#4c739a] mt-0.5">{trend}</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Metrics Grid ───────────────────────────────────────────────────────────────
function MetricsGrid({ metrics }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => (
                <MetricCard key={i} metric={m} />
            ))}
        </div>
    );
}

// ── Data Table ─────────────────────────────────────────────────────────────────
function DataTable({ table }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#e7edf3] dark:border-slate-700">
            <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        {table.columns.map((col, i) => (
                            <th
                                key={i}
                                className="px-3 py-2.5 text-left font-semibold text-[#4c739a] uppercase tracking-wide whitespace-nowrap"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-700 bg-white dark:bg-slate-900">
                    {table.rows.map((row, ri) => (
                        <tr
                            key={ri}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                            {row.map((cell, ci) => (
                                <td
                                    key={ci}
                                    className="px-3 py-2.5 text-[#0d141b] dark:text-slate-300"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Action Buttons ─────────────────────────────────────────────────────────────
function ActionButtons({ buttons }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-wrap gap-2 pt-2">
            {buttons.map((btn, i) =>
                i === 0 ? (
                    <button
                        key={i}
                        onClick={() => btn.route && navigate(btn.route)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                        {btn.icon && (
                            <span className="material-symbols-outlined text-sm">{btn.icon}</span>
                        )}
                        {btn.label}
                    </button>
                ) : (
                    <button
                        key={i}
                        onClick={() => btn.route && navigate(btn.route)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[#0d141b] dark:text-white text-xs font-bold border border-[#cfdbe7] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {btn.icon && (
                            <span className="material-symbols-outlined text-sm">{btn.icon}</span>
                        )}
                        {btn.label}
                    </button>
                )
            )}
        </div>
    );
}

// ── Main MessageRenderer ───────────────────────────────────────────────────────
/**
 * Renders an AI response message.
 * Supports ui_type: text | metrics | table | list
 * Always renders answer text + any available metrics/table/action_buttons.
 * Renders suggested_questions as clickable follow-up chips below the card.
 *
 * @param {string} content - The AI answer text
 * @param {object|null} uiComponents - { ui_type, metrics, table, action_buttons, suggested_questions }
 * @param {function} onFollowUp - Called with the question string when a follow-up chip is clicked
 */
export default function MessageRenderer({ content, uiComponents, onFollowUp }) {
    const ui = uiComponents;
    const hasMetrics = Array.isArray(ui?.metrics) && ui.metrics.length > 0;
    const hasTable = ui?.table?.columns?.length > 0 && ui?.table?.rows?.length > 0;
    const hasActions = Array.isArray(ui?.action_buttons) && ui.action_buttons.length > 0;
    const hasSuggestions = Array.isArray(ui?.suggested_questions) && ui.suggested_questions.length > 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="ai-gradient-border p-5 shadow-sm">
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-[#0d141b] dark:text-slate-200 leading-relaxed">
                        {content}
                    </p>
                    {hasMetrics && <MetricsGrid metrics={ui.metrics} />}
                    {hasTable && <DataTable table={ui.table} />}
                    {hasActions && <ActionButtons buttons={ui.action_buttons} />}
                </div>
            </div>

            {hasSuggestions && (
                <div className="flex flex-wrap gap-2 pl-1 pt-1">
                    {ui.suggested_questions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => onFollowUp && onFollowUp(q)}
                            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-[#4c739a] rounded-full text-xs border border-[#e7edf3] dark:border-slate-700 hover:border-primary hover:text-primary transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
