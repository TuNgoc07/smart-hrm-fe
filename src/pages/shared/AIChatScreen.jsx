import React, { useState, useEffect, useRef } from "react";
import { sendAiChatMessage, fetchAiChatHistory } from "../../utils/employeeApi";
import MessageRenderer from "../../components/ai/MessageRenderer";

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLE_STARTERS = {
    hr_admin: {
        content:
            "Xin chào! Tôi là HR AI Assistant. Tôi có thể giúp bạn phân tích dữ liệu toàn công ty — chấm công, lương, hợp đồng, đơn từ và nhân sự. Bạn muốn xem thông tin gì hôm nay?",
        uiComponents: {
            ui_type: "text",
            metrics: [],
            table: null,
            action_buttons: [],
            suggested_questions: [
                "Ai chưa chấm công hôm nay?",
                "Tổng chi phí OT tháng này là bao nhiêu?",
                "Có hợp đồng nào sắp hết hạn không?",
                "Thống kê nhân viên đi trễ tuần này?",
            ],
        },
    },
    manager: {
        content:
            "Xin chào! Tôi là HR AI Assistant. Tôi có thể giúp bạn theo dõi tình hình nhóm — chấm công, đơn từ và hiệu suất từng thành viên trong phòng ban. Bạn cần kiểm tra gì?",
        uiComponents: {
            ui_type: "text",
            metrics: [],
            table: null,
            action_buttons: [],
            suggested_questions: [
                "Ai trong team chưa check-in hôm nay?",
                "Ai đi trễ nhiều nhất tuần này?",
                "Có đơn xin nghỉ phép nào đang chờ duyệt không?",
                "Tổng giờ OT của team tháng này?",
            ],
        },
    },
    employee: {
        content:
            "Xin chào! Tôi là HR AI Assistant. Tôi có thể giúp bạn tra cứu thông tin cá nhân — lịch sử chấm công, bảng lương, số ngày phép còn lại và đơn từ. Bạn cần hỗ trợ gì?",
        uiComponents: {
            ui_type: "text",
            metrics: [],
            table: null,
            action_buttons: [],
            suggested_questions: [
                "Tôi còn bao nhiêu ngày phép năm nay?",
                "Bảng lương tháng này của tôi như thế nào?",
                "Lịch chấm công của tôi tuần này?",
                "Đơn xin nghỉ phép của tôi đang ở trạng thái nào?",
            ],
        },
    },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getUserRole() {
    try {
        const roles = JSON.parse(localStorage.getItem("roles") || "[]");
        if (roles.includes("hr_admin")) return "hr_admin";
        if (roles.includes("manager")) return "manager";
        return "employee";
    } catch {
        return "employee";
    }
}

function getUserRoleLabel(role) {
    const map = { hr_admin: "HR ADMIN", manager: "MANAGER", employee: "EMPLOYEE" };
    return map[role] || "USER";
}

function safeParseAiMessage(rawContent, uiComponents) {
    if (!rawContent || typeof rawContent !== "string") return { content: rawContent, uiComponents };
    const trimmed = rawContent.trim();
    if (!trimmed.startsWith("{")) return { content: rawContent, uiComponents };
    try {
        const parsed = JSON.parse(trimmed);
        if (!parsed.answer) return { content: rawContent, uiComponents };
        const extractedUi = uiComponents ?? (parsed.ui_type !== undefined ? {
            ui_type: parsed.ui_type || "text",
            metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
            table: parsed.table && parsed.table.columns ? parsed.table : null,
            action_buttons: Array.isArray(parsed.action_buttons) ? parsed.action_buttons : [],
            suggested_questions: Array.isArray(parsed.suggested_questions) ? parsed.suggested_questions : [],
        } : null);
        return { content: parsed.answer, uiComponents: extractedUi };
    } catch {
        return { content: rawContent, uiComponents };
    }
}

function formatTime(timestamp) {
    if (!timestamp) return "";
    try {
        const normalized = timestamp.replace(" ", "T");
        return new Date(normalized).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RoleStarterBubble({ roleKey, onFollowUp }) {
    const starter = ROLE_STARTERS[roleKey] || ROLE_STARTERS.employee;
    return (
        <div className="flex items-start gap-3 justify-start px-6 py-6">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-5">
                <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <div className="flex flex-col gap-1 items-start max-w-[80%]">
                <p className="text-[#4c739a] text-[11px] font-bold uppercase tracking-wider">
                    AI Assistant
                </p>
                <MessageRenderer
                    content={starter.content}
                    uiComponents={starter.uiComponents}
                    onFollowUp={onFollowUp}
                />
            </div>
        </div>
    );
}

function LoadingBubble() {
    return (
        <div className="flex items-start gap-3 justify-start px-6">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-5">
                <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
                <p className="text-[#4c739a] text-[11px] font-bold uppercase tracking-wider">
                    AI Assistant
                </p>
                <div className="ai-gradient-border px-5 py-4 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                        <span
                            className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                        />
                        <span
                            className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                        />
                        <span
                            className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function AIChatScreen() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const userRoleKey = getUserRole();
    const userRole = getUserRoleLabel(userRoleKey);

    const currentPeriod = new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setHistoryLoading(true);
            const data = await fetchAiChatHistory();
            if (data && Array.isArray(data)) {
                const msgs = [];
                [...data].reverse().forEach((h) => {
                    msgs.push({ role: "user", content: h.question, timestamp: h.timestamp });
                    const { content, uiComponents } = safeParseAiMessage(h.answer, null);
                    msgs.push({
                        role: "assistant",
                        content,
                        uiComponents,
                        timestamp: h.timestamp,
                    });
                });
                setMessages(msgs);
            }
        } catch (e) {
            console.error("Failed to load chat history:", e);
        } finally {
            setHistoryLoading(false);
        }
    };

    const sendMessage = async (questionOverride) => {
        const q = (questionOverride || input).trim();
        if (!q || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: q }]);
        setLoading(true);

        try {
            const res = await sendAiChatMessage(q);
            const { content, uiComponents } = safeParseAiMessage(res.answer, res.uiComponents);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content,
                    uiComponents,
                    timestamp: res.timestamp,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "AI service is temporarily unavailable. Please try again later.",
                    uiComponents: null,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const isEmpty = messages.length === 0 && !historyLoading;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] min-h-0">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-8">
                    <h1 className="text-[17px] font-extrabold text-[#0d141b] dark:text-white tracking-tight">
                        HR AI Assistant
                    </h1>
                    <div className="hidden sm:flex items-center gap-6">
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-[#4c739a] uppercase tracking-widest">
                                SCOPE
                            </span>
                            <span className="text-sm font-bold text-primary flex items-center gap-0.5 mt-0.5">
                                Whole Company
                                <span className="material-symbols-outlined text-sm">
                                    keyboard_arrow_down
                                </span>
                            </span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-[#4c739a] uppercase tracking-widest">
                                PERIOD
                            </span>
                            <span className="text-sm font-bold text-primary flex items-center gap-0.5 mt-0.5">
                                {currentPeriod}
                                <span className="material-symbols-outlined text-sm">
                                    keyboard_arrow_down
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setMessages([])}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-[#e7edf3] dark:border-slate-700"
                    >
                        <span className="material-symbols-outlined text-sm">table_rows</span>
                        Clear Conversation
                    </button>
                    <button
                        onClick={() => setMessages([])}
                        className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Clear conversation"
                    >
                        <span className="material-symbols-outlined text-xl text-[#4c739a]">
                            table_rows
                        </span>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-xl text-[#4c739a]">settings</span>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-xl text-[#4c739a]">
                            notifications
                        </span>
                    </button>
                </div>
            </div>

            {/* ── Messages Area ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-[#f6f7f8] dark:bg-[#101922]">
                {historyLoading ? (
                    <div className="flex items-center justify-center h-full gap-2 text-[#4c739a]">
                        <span className="material-symbols-outlined animate-spin text-xl">
                            progress_activity
                        </span>
                        <span className="text-sm">Loading conversation...</span>
                    </div>
                ) : isEmpty ? (
                    <RoleStarterBubble roleKey={userRoleKey} onFollowUp={sendMessage} />
                ) : (
                    <div className="py-6 space-y-6">
                        {messages.map((msg, i) =>
                            msg.role === "user" ? (
                                /* ── User Message ─────────────────────────── */
                                <div key={i} className="flex items-start gap-3 justify-end px-6">
                                    <div className="flex flex-col gap-1 items-end max-w-[72%]">
                                        <p className="text-[#4c739a] text-[11px] font-bold uppercase tracking-wider">
                                            {userRole}
                                        </p>
                                        <div className="bg-primary px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                                            <p className="text-white text-sm leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>
                                        {msg.timestamp && (
                                            <span className="text-[10px] text-[#4c739a]">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-5">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">
                                            person
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* ── AI Message ───────────────────────────── */
                                <div key={i} className="flex items-start gap-3 justify-start px-6">
                                    <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-5">
                                        <span className="material-symbols-outlined text-white text-lg">
                                            auto_awesome
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-start max-w-[80%]">
                                        <p className="text-[#4c739a] text-[11px] font-bold uppercase tracking-wider">
                                            AI Assistant
                                        </p>
                                        <MessageRenderer
                                            content={msg.content}
                                            uiComponents={msg.uiComponents}
                                            onFollowUp={sendMessage}
                                        />
                                        {msg.timestamp && (
                                            <span className="text-[10px] text-[#4c739a]">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {loading && <LoadingBubble />}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ───────────────────────────────────────────────── */}
            <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-[#e7edf3] dark:border-slate-800">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                    className="flex items-center gap-3 px-6 py-4"
                >
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 rounded-xl focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                        <span className="material-symbols-outlined text-[#4c739a] text-xl shrink-0">
                            auto_awesome
                        </span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything about employee data..."
                            disabled={loading}
                            className="flex-1 bg-transparent text-sm text-[#0d141b] dark:text-white placeholder:text-[#4c739a] focus:outline-none"
                        />
                        <button
                            type="button"
                            className="text-[#4c739a] hover:text-primary transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-xl">attach_file</span>
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors"
                    >
                        <span className="hidden sm:inline">Send</span>
                        <span className="material-symbols-outlined text-base">send</span>
                    </button>
                </form>
                <p className="text-center text-[11px] text-[#4c739a] pb-3">
                    AI can analyze data but cannot perform automated actions like final approvals
                </p>
            </div>
        </div>
    );
}
