function BotHeader() {
    return (
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="size-12 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white shadow-md" data-alt="AI assistant circular logo with abstract pattern">
                        <span className="material-symbols-outlined text-2xl">smart_toy</span>
                    </div>
                    <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                </div>
                <div>
                    <h1 className="text-slate-900 dark:text-white text-base font-bold">HR Assistant</h1>
                    <p className="text-xs text-green-600 dark:text-green-500 font-semibold flex items-center gap-1">
                        Online
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <span className="material-symbols-outlined">history</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </div>
        </div>
    )
}

function MessageBox() {
    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-20 py-8 flex flex-col gap-8">
            {/* <!-- AI Welcome Message --> */}
            <div className="flex items-start gap-4 max-w-[80%]">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">Hello! I'm your Smart Ops HR Assistant. How can I help you today? You can ask me about your leave balance, payroll, or attendance.</p>
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">09:30 AM</span>
                </div>
            </div>
            {/* <!-- User Message --> */}
            <div className="flex items-start justify-end gap-4 max-w-full">
                <div className="flex flex-col gap-1 items-end max-w-[80%]">
                    <div className="bg-primary text-white p-4 rounded-xl rounded-tr-none shadow-lg shadow-primary/20">
                        <p className="text-sm leading-relaxed font-medium">How many leave days do I have left?</p>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-slate-400">09:31 AM</span>
                        <span className="material-symbols-outlined text-[12px] text-primary">done_all</span>
                    </div>
                </div>
                <div className="size-8 rounded-full bg-cover bg-center shrink-0" data-alt="User avatar small thumbnail" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsCcFksOlH9V_wtHk7jqC_oSECC9gS3PT9eUdQa5AZ6LgJrQRcgJctGwxwUKBM5F8l1Dii8tbZvTQCGuJDjl8QwBx2DORT-cGcmyI6EJ6ZqBT8cg3PrSzJHgYu1VkUk98wFsO49gpg3G83Z6hHHfj0PiPFJwjLkkYxlWnzwfyp1FhwaY7K6-M-KIq9mMyZMgj8hclsAskUpd0jTwAkFDz0DXDdGt_AYCuvqrQjlBB600y3NRaPEtGSGDBJUAJfII6KUOn015kPEps");' }}></div>
            </div>
            {/* <!-- AI Response Message --> */}
            <div className="flex items-start gap-4 max-w-[80%]">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                            You currently have <span className="font-bold text-primary">12 leave days</span> remaining. <br /><br />
                            <span className="text-xs text-slate-500 dark:text-slate-400 italic">Last update: Oct 24, 2024.</span>
                        </p>
                    </div>
                    {/* Action Chips */}
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-full transition-colors border border-primary/20">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            View My Attendance
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-full transition-colors shadow-md">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create Leave Request
                        </button>
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">09:31 AM</span>
                </div>
            </div>
        </div>
    )
}

function SuggestedItem({ suggestedContent }) {
    return (
        <button className="whitespace-nowrap px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full transition-colors border border-slate-200 dark:border-slate-700">
            {suggestedContent}
        </button>
    )
}

function SuggestedSection() {
    return (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap mr-2">Suggestions:</span>
            <SuggestedItem suggestedContent="What is my attendance status today?" />
            <SuggestedItem suggestedContent="When will I receive my salary?" />
            <SuggestedItem suggestedContent="Show my latest payslip" />
        </div>
    )
}

function ChatInput() {
    return (
        <div className="relative flex items-center">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center px-4 py-1 border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all">
                <span className="material-symbols-outlined text-slate-400 mr-2">attachment</span>
                <input className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500" placeholder="Ask HR Assistant..." type="text" />
                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">mood</span>
                </button>
            </div>
            <button className="ml-3 size-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-transform active:scale-95">
                <span className="material-symbols-outlined">send</span>
            </button>
        </div>
    )
}

function TypedSection() {
    return (
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                {/* <!-- Suggested Questions Pills --> */}
                <SuggestedSection />

                {/* <!-- Main Input --> */}
                <ChatInput />
                <p className="text-[10px] text-center text-slate-400">
                    AI-generated responses may contain inaccuracies. Verify critical HR data in your official documents.
                </p>
            </div>
        </div>
    )
}

export default function ChatbotScreen() {
    return (
        <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative">
            {/* <!-- Bot Header --> */}
            <BotHeader />

            {/* <!-- Messages Container --> */}
            <MessageBox />

            {/* <!-- Bottom Input Section --> */}
            <TypedSection />

        </main>
    );
}