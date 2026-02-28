import { useState } from "react";
import { Routes , Route} from "react-router-dom";

function Breadcrumbs() {
    return (
        <div className="space-y-4">
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <a className="hover:text-primary" href="#">Home</a>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <a className="hover:text-primary" href="#">HR</a>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-slate-900 dark:text-white">New Request</span>
            </nav>
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create New HR Request</h1>
                <p className="text-slate-500 mt-1">Select your request category and fill in the required information for processing.</p>
            </div>
        </div>
    );
}

function RequestTypeSelector() {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-[10px] font-bold tracking-tighter">01</span>
                <h3 className="text-lg font-bold">Select Request Type</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary gap-2 text-center transition-all">
                    <span className="material-symbols-outlined text-3xl">event_busy</span>
                    <span className="text-sm font-bold">Leave Request</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/50 hover:text-primary gap-2 text-center transition-all">
                    <span className="material-symbols-outlined text-3xl">more_time</span>
                    <span className="text-sm font-bold">Overtime</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/50 hover:text-primary gap-2 text-center transition-all">
                    <span className="material-symbols-outlined text-3xl">rule</span>
                    <span className="text-sm font-bold">Adjustment</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/50 hover:text-primary gap-2 text-center transition-all">
                    <span className="material-symbols-outlined text-3xl">home_work</span>
                    <span className="text-sm font-bold">Remote / WFH</span>
                </button>
            </div>
        </section>
    )
}

function FormHeader({ stepNumber, title }) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-[10px] font-bold tracking-tighter">{stepNumber}</span>
            <h3 className="text-lg font-bold">{title}</h3>
        </div>
    );
}

function FormFields() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Type</label>
                <select className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary">
                    <option defaultValue="Annual Leave">Annual Leave</option>
                    <option>Medical Leave</option>
                    <option>Personal Leave</option>
                    <option>Compensatory Off</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Balance</label>
                <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    12 Days Available
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
                    type="date"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
                <input 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary" 
                    type="date" />
            </div>
        </div>
    );
}

function CalculatedDuration() {
    return (
        <div className="p-3 bg-primary/5 rounded-lg flex items-center justify-between border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
                <span className="text-sm font-bold uppercase tracking-wide">Calculated Duration</span>
            </div>
            <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">2 Days</span>
        </div>
    );
}

function ReasonTextarea() {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reason / Justification</label>
            <textarea className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary" placeholder="Please provide a brief explanation for your request..." rows="4"></textarea>
        </div>
    );
}

function AttachmentUpload() {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Attachments (Optional)</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                <p className="text-sm font-bold">Click or drag to upload</p>
                <p className="text-xs">PDF, JPG, PNG (Max 5MB)</p>
            </div>
        </div>
    );
}

function MainFormCard() {
    return (
        <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <FormFields />
            <CalculatedDuration />
            <ReasonTextarea />
            <AttachmentUpload />
        </div>
    );
}

function ApprovalChain() {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Approval Chain</h4>
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover bg-center" alt="Manager profile picture" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9qqxhQb0FcroeMdgRNgR1qF0s0V98XIebRr_MPZCGEIPlj_6qqM6tRxOr0uQJlIMoCHTA6qN9H0_mTVvPAM1ekE2upxoIH_36PSM7mc3TEVSBlskC6H0dx1OBqOBk9kW4N87Ai2IJN01jwu2b5GpNKtd38lg1LyW7_M8Zd3robgdhd2o_78oHxWMohAuKZcpQUuTf8T1JgKuW5G1soBI2qZF43adMU3YIX1pN1W1cDHAdASERf1NTDezSyXsMQRWN6Vzyk28bsPQ')" }}></div>
                <div>
                    <p className="text-sm font-bold">Alex Thompson</p>
                    <p className="text-[10px] text-slate-500">Direct Manager</p>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <span className="material-symbols-outlined text-base">info</span>
                Estimated processing: 24h
            </div>
        </div>
    );
}

function PolicyReminder() {
    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Policy Reminder</h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                <li>Requests should be submitted at least 48 hours in advance.</li>
                <li>Annual leave requires direct manager approval via email or portal.</li>
                <li>Supporting docs mandatory for medical leaves &gt; 1 day.</li>
            </ul>
        </div>
    );
}

function InfoSidebar() {
    return (
        <div className="lg:w-72 space-y-4">
            <ApprovalChain />
            <PolicyReminder />
        </div>
    );
}

function DynamicFormArea() {
    return (
        <>
            <section className="space-y-4">
                <FormHeader stepNumber="02" title="Leave Request Details" />
                <div className="flex flex-col lg:flex-row gap-6">
                    <MainFormCard />
                    <InfoSidebar />
                </div>
            </section>
        </>
    );
}

function ActionButton() {
    return (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-4">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                Cancel Request
            </button>
            <button className="px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2">
                Submit Request
                <span className="material-symbols-outlined text-sm">send</span>
            </button>
        </div>
    );
}


export default function NewRequestScreen() {
    return (
        <main className="flex-1 overflow-y-auto">
            <div className=" space-y-8">
                <Breadcrumbs />
                <RequestTypeSelector />
                <DynamicFormArea />
                <ActionButton />
            </div>
        </main>
    );
}

