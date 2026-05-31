import React, { useState, useEffect, useRef } from "react";
import { sendAiChatMessage, fetchAiChatHistory } from "../../utils/employeeApi";
import { Send, Bot, User, RefreshCw, ChevronRight, ArrowRight } from "lucide-react";

export default function AIChatScreen() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setHistoryLoading(true);
            const data = await fetchAiChatHistory();
            if (data && Array.isArray(data)) {
                setMessages(data.map(h => ({
                    role: "assistant",
                    content: h.answer,
                    uiComponents: h.uiComponents,
                    timestamp: h.timestamp,
                })));
            }
        } catch (e) {
            console.error("Failed to load chat history:", e);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await sendAiChatMessage(input);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: response.answer,
                uiComponents: response.uiComponents,
                sources: response.sources,
                timestamp: response.timestamp,
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.",
                uiComponents: null,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestedQuestion = (question) => {
        setInput(question);
        handleSend({ preventDefault: () => {} });
    };

    const renderMetrics = (metrics) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
            {metrics.map((m, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{m.label}</div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{m.value}</div>
                    {m.trend && (
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                            m.trend_direction === "up" ? "text-emerald-600" : 
                            m.trend_direction === "down" ? "text-red-600" : "text-slate-500"
                        }`}>
                            {m.trend_direction === "up" && <ArrowRight className="w-3 h-3 rotate-[-45deg]" />}
                            {m.trend_direction === "down" && <ArrowRight className="w-3 h-3 rotate-[135deg]" />}
                            {m.trend}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderTable = (table) => (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        {table.columns.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {table.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            {row.map((cell, ci) => (
                                <td key={ci} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderActionButtons = (buttons) => (
        <div className="flex flex-wrap gap-2 mb-4">
            {buttons.map((btn, i) => (
                <button
                    key={i}
                    onClick={() => window.location.href = btn.route}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
                >
                    {btn.icon && <span className="text-base sm:text-lg">{btn.icon}</span>}
                    <span className="truncate">{btn.label}</span>
                    <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                </button>
            ))}
        </div>
    );

    const renderSuggestedQuestions = (questions) => (
        <div className="flex flex-wrap gap-2 mb-4">
            {questions.map((q, i) => (
                <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                    {q}
                </button>
            ))}
        </div>
    );

    const renderMessage = (msg, index) => {
        const isUser = msg.role === "user";
        const ui = msg.uiComponents;

        return (
            <div key={index} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"} rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm border ${isUser ? "border-primary" : "border-slate-200 dark:border-slate-700"}`}>
                    {!isUser && ui && (
                        <div className="space-y-3">
                            {ui.metrics && ui.metrics.length > 0 && renderMetrics(ui.metrics)}
                            {ui.table && renderTable(ui.table)}
                            {ui.action_buttons && ui.action_buttons.length > 0 && renderActionButtons(ui.action_buttons)}
                            {ui.suggested_questions && ui.suggested_questions.length > 0 && renderSuggestedQuestions(ui.suggested_questions)}
                        </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.content}
                    </div>
                    {msg.timestamp && (
                        <div className={`text-xs mt-2 ${isUser ? "text-white/70" : "text-slate-400"}`}>
                            {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                    )}
                </div>
                {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">AI Assistant</h1>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">Hỏi bất kỳ điều gì về HRM của bạn</p>
                </div>
                <button
                    onClick={loadHistory}
                    disabled={historyLoading}
                    className="flex items-center gap-2 px-2 md:px-3 py-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                >
                    <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Làm mới</span>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 px-1 sm:px-2 pb-4">
                {historyLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Đang tải lịch sử...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4 px-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </div>
                        <div className="max-w-sm">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Xin chào!</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Tôi có thể giúp bạn tìm thông tin về chấm công, lương, ngày phép, đơn từ và nhiều hơn nữa.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => renderMessage(msg, i))
                )}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={loading}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
                >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Gửi</span>
                </button>
            </form>
        </div>
    );
}
