import { useEffect, useMemo, useState } from "react";

// InsightCard Component
function InsightCard({ insight, isSelected, onClick }) {
    return (
        <div
            className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg hover:border-primary/20 ${isSelected ? "border-primary/50 shadow-lg" : "border-slate-200 dark:border-slate-800"
                }`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick();
                }
            }}
        >
            <div className="flex items-start gap-4">
                <div className={`size-12 ${insight.iconBg} ${insight.iconText} rounded-xl flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-2xl">{insight.icon}</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{insight.title}</h3>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded uppercase tracking-wider ${insight.severityBadge}`}>
                                {insight.severityLabel}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {insight.timeAgo}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Subject</p>
                            <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                                <span
                                    className="size-5 rounded-full bg-slate-200"
                                    data-alt="Employee profile picture"
                                    style={{ backgroundImage: `url('${insight.subjectAvatar}')` }}
                                ></span>
                                {insight.subjectName}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reason</p>
                            <p className="text-sm font-medium mt-1">{insight.reason}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence Score</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${insight.confidence}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-primary">{insight.confidence}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                        >
                            View Detail
                        </button>
                        <button
                            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            View Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// InsightDetailPanel Component
function InsightDetailPanel({ insight, isOpen, onClose }) {
    return (
        <aside
            className={`w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-20 shadow-2xl transition-all duration-250 ease-out ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                }`}
        >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold">Insight Detail</h3>
                <button
                    className="size-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary">psychology</span>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Why this insight?</h4>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insight.why}</p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Supporting Data</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {insight.supporting.map((item) => (
                            <div
                                key={item.label}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl"
                            >
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                                <p className={`text-lg font-extrabold ${item.valueClass}`}>{item.value}</p>
                                <p className="text-[10px] text-slate-500">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary">checklist</span>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Suggested Actions</h4>
                    </div>
                    <div className="space-y-3">
                        {insight.actions.map((action) => (
                            <label
                                key={action.title}
                                className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                            >
                                <input className="mt-1 rounded text-primary focus:ring-primary/20 border-slate-300" type="checkbox" />
                                <div>
                                    <p className="text-sm font-bold">{action.title}</p>
                                    <p className="text-xs text-slate-500">{action.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
                    Disclaimer: AI insights are advisory. Decisions should be made based on manager discretion and direct communication with employees.
                </p>
            </div>
        </aside>
    );
}

// InsightHeader Component
function InsightHeader() {
    return (
        <>
            <div className="px-8 pt-8 shrink-0">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Team Insights</h2>
                        <p className="text-slate-500 text-base mt-1">AI-powered suggestions for your team performance and wellbeing</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-primary text-sm">groups</span>
                            Product Design Team
                            <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                            Last 30 days
                            <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                        </button>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between mb-8 group">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined text-lg">warning</span>
                        </div>
                        <div>
                            <p className="text-amber-900 dark:text-amber-200 text-sm font-bold">Overall Team Status: 🟠 Medium Risk</p>
                            <p className="text-amber-700/80 dark:text-amber-400/80 text-xs">Based on recent attendance and workload patterns across 12 members.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-help">
                            <span className="material-symbols-outlined text-amber-400 text-base">info</span>
                        </div>
                        <a className="text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1 hover:underline" href="#">
                            View Detailed Metrics
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-xs font-bold shrink-0">All Insights</button>
                    <button className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-bold transition-colors shrink-0">Attendance</button>
                    <button className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-bold transition-colors shrink-0">Workload / OT</button>
                    <button className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-bold transition-colors shrink-0">Leave Patterns</button>
                    <button className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-bold transition-colors shrink-0">Risk Alerts</button>
                </div>
            </div>
        </>
    );
}

// Main AIInsightScreen Component
function AIInsightScreen() {
    const insights = useMemo(
        () => [
            {
                id: "burnout-risk",
                icon: "priority_high",
                iconBg: "bg-red-100 dark:bg-red-900/30",
                iconText: "text-red-600",
                title: "Burnout Risk Detected",
                severityLabel: "High Severity",
                severityBadge: "bg-red-100 dark:bg-red-900/40 text-red-600",
                timeAgo: "2 hours ago",
                subjectName: "John Doe",
                subjectAvatar:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCfXJnL6KZfqQBlxNU9f04fYtQC6916sPcUmQJnoYwqQGin7sgI3z45_p5TV0Q6vVaU1BEUzxjjzgX8kkQpLsCYxjna5GJ3-YtgeFkp62LiyViTnEQBSpY8qmzPsk5cKnHdRYkpYYnL3VGzoadhzRNrqsu9-glFIaHwachffG-ylgkS6u1E4ygQUjrZnZbpp9VFJpC0jGLbGbQbXnFIErRTLN8xnwTaDb3ApijomHf4RbsVBC8YpiuK1MBraeEdzITxICIlR09t8is",
                reason: "OT > 10h/week for 3 consecutive weeks",
                confidence: 82,
                why:
                    "John's working hours have significantly exceeded the team average for three weeks. AI analysis of communication logs suggests a high volume of late-night activity, which historically correlates with a 65% chance of resignation within 3 months if unaddressed.",
                supporting: [
                    { label: "Avg OT", value: "12.4h", sub: "+4.2h vs Team", valueClass: "text-red-500" },
                    { label: "Late Login", value: "8/10 days", sub: "Past 2 weeks", valueClass: "text-slate-900 dark:text-white" },
                ],
                actions: [
                    { title: "Review workload distribution", desc: "Check if Project X milestones can be extended." },
                    { title: "Schedule 1-on-1 Wellness Check", desc: "Discuss bandwidth and potential stress factors." },
                    { title: 'Enforce "No After-Hours" logs', desc: "Restrict server access after 8 PM for 1 week." },
                ],
            },
            {
                id: "leave-pattern",
                icon: "event_busy",
                iconBg: "bg-amber-100 dark:bg-amber-900/30",
                iconText: "text-amber-600",
                title: "Unusual Leave Pattern",
                severityLabel: "Medium Severity",
                severityBadge: "bg-amber-100 dark:bg-amber-900/40 text-amber-600",
                timeAgo: "5 hours ago",
                subjectName: "Sarah Jenkins",
                subjectAvatar:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAitYAVKVKkXFyaebv2hLPv_HZCn244IIq1jbwWcdKAvfrZ57j1ua5SKh_zx4ryKhqGNqlqqjInMHHQWBpSp28py_w-2tutmtdJN-Kl1Lamy8m6kLvHQ_VmPWlO5Yo24BL_U-5RGsIBbWSggcE_-rQ6yyg9zF86PGxroUD_9X3KkrH0qL83JQcDRv2TsBsdctOMarEgI5GKDU7CafOb5j4a7tkTROJ2K-txn3GEhVa7omTkaTbqAFLHheye10fFQEv6E5_vznUPOLQ",
                reason: "3 unplanned Monday absences in 4 weeks",
                confidence: 76,
                why:
                    "Unplanned leave is clustered on Mondays over the last month. This pattern often correlates with disengagement or underlying personal issues; early check-ins typically reduce repeat occurrences.",
                supporting: [
                    { label: "Unplanned", value: "3 days", sub: "Last 4 weeks", valueClass: "text-amber-600" },
                    { label: "Day Pattern", value: "Mon", sub: "Most frequent", valueClass: "text-slate-900 dark:text-white" },
                ],
                actions: [
                    { title: "Check-in on wellbeing", desc: "Ask if there are blockers or personal issues." },
                    { title: "Review leave policy", desc: "Ensure the process and expectations are clear." },
                    { title: "Offer schedule flexibility", desc: "Consider temporary flexible hours if needed." },
                ],
            },
            {
                id: "productivity-peak",
                icon: "trending_up",
                iconBg: "bg-blue-100 dark:bg-blue-900/30",
                iconText: "text-blue-600",
                title: "Peak Productivity Alert",
                severityLabel: "Low Severity",
                severityBadge: "bg-blue-100 dark:bg-blue-900/40 text-blue-600",
                timeAgo: "yesterday",
                subjectName: "Marcus Chen",
                subjectAvatar:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwhxZsVHIkq74ISZZEs9kUpFZLfh-f--uHTtVsBBHoEmQIpOQUm-GGpDc7pEe81T08wPND8cSQSShtHGfOUWn14WfQ2834QnvEppR0xj-gVph-XtfEet8pSZOCfxYGUI3awdKkKzWHAEMEUQamqcoHzFk4TKYpqaQMH9MQvEykfxvbgC0wQZO232OdB3VpTXSqGc_37Me0RGlyO73k54wvqNoVC0w2-i3K2rMsZr_aNvVKQEzl47vehwzfjPZrVFU3IR6d9Fa1s0U",
                reason: "20% increase in task completion rate",
                confidence: 94,
                why:
                    "Task completion rate increased significantly compared to the previous period. Recognizing this trend helps reinforce positive momentum and share best practices across the team.",
                supporting: [
                    { label: "Tasks Done", value: "+20%", sub: "vs last period", valueClass: "text-blue-600" },
                    { label: "Consistency", value: "High", sub: "Past 2 weeks", valueClass: "text-slate-900 dark:text-white" },
                ],
                actions: [
                    { title: "Recognize achievement", desc: "Share praise publicly in the team channel." },
                    { title: "Capture best practices", desc: "Ask what changed to improve throughput." },
                    { title: "Balance workload", desc: "Ensure the pace is sustainable." },
                ],
            },
        ],
        []
    );

    const [selectedInsight, setSelectedInsight] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!isDetailOpen && selectedInsight) {
            const t = setTimeout(() => setSelectedInsight(null), 250);
            return () => clearTimeout(t);
        }
    }, [isDetailOpen, selectedInsight]);

    const handleInsightClick = (insight) => {
        setSelectedInsight(insight);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <main className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-background-dark">
                <InsightHeader />

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                    {insights.map((insight) => (
                        <InsightCard
                            key={insight.id}
                            insight={insight}
                            isSelected={selectedInsight?.id === insight.id && isDetailOpen}
                            onClick={() => handleInsightClick(insight)}
                        />
                    ))}
                </div>
            </main>

            {selectedInsight && (
                <InsightDetailPanel
                    insight={selectedInsight}
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}

export default AIInsightScreen;