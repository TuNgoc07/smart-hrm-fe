import { useState, useEffect } from "react";
import { fetchMyPayslips, fetchMyPayslipDetail, formatCurrency } from "../../../../utils/employeeApi";

function Breadcrumbs() {
    return (
        <div className="space-y-4">
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <a className="hover:text-primary" href="#">Home</a>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <a className="hover:text-primary" href="#">HR</a>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-slate-900 dark:text-white">My Payslip</span>
            </nav>
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Payslip</h1>
                <p className="text-slate-500 mt-1">View your monthly salary breakdown and download payslip documents.</p>
            </div>
        </div>
    );
}

function PayslipControls({ payslips, selectedId, onSelect }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-56">
                <select
                    value={selectedId || ""}
                    onChange={e => onSelect(Number(e.target.value))}
                    className="form-input w-full rounded-lg text-sm border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary"
                >
                    {payslips.map(p => (
                        <option key={p.payslipId} value={p.payslipId}>{p.cycleName}</option>
                    ))}
                </select>
            </div>
            <div className="flex h-7 items-center justify-center gap-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 border border-emerald-200 dark:border-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Paid</p>
            </div>
        </div>
    );
}

function Header({ payslips, selectedId, onSelect }) {
    return (
        <header className="py-4 flex items-center justify-between">
            <Breadcrumbs />
            <div className="flex items-center gap-4">
                <PayslipControls payslips={payslips} selectedId={selectedId} onSelect={onSelect} />
            </div>
        </header>
    );
}

function DashboardContent({ detail, loading }) {
    if (loading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 h-40" />
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 h-48" />
                    <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 h-48" />
                </div>
            </div>
        );
    }
    if (!detail) {
        return <div className="p-12 text-center text-slate-400">No payslip data available.</div>;
    }
    return (
        <div className="flex flex-col gap-6">
            <SummaryCard detail={detail} />
            <BreakdownSection detail={detail} />
            <AttendanceReferenceSection detail={detail} />
            <Footer />
        </div>
    );
}


function SummaryCard({ detail }) {
    const period = detail.periodStart && detail.periodEnd
        ? `${detail.periodStart} – ${detail.periodEnd}`
        : detail.cycleName;
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-[#e7edf3] dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
            <div className="relative">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Net Salary — {period}</p>
                <h3 className="text-4xl font-extrabold text-[#0d141b] dark:text-white mb-6">
                    {formatCurrency(detail.netSalary)}
                </h3>
                <div className="flex flex-wrap gap-8 items-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">event_available</span>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Payment Date</p>
                            <p className="text-sm font-semibold">{detail.lockedAt || "–"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">trending_up</span>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Gross Income</p>
                            <p className="text-sm font-semibold">{formatCurrency(detail.grossIncome)}</p>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <button className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function EarningRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
            <p className="text-sm font-bold">{formatCurrency(value)}</p>
        </div>
    );
}

function EarningCard({ detail }) {
    const totalOtPay = (detail.otNormalPay || 0) + (detail.otWeekendPay || 0) + (detail.otHolidayPay || 0);
    const totalAllowances = (detail.mealAllowance || 0) + (detail.transportAllowance || 0) + (detail.otherAllowances || 0);
    return (
        <div className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col">
            <div className="p-5 border-b border-emerald-100 dark:border-emerald-900/30">
                <h4 className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Earnings
                </h4>
            </div>
            <div className="p-5 flex-1 space-y-4">
                <EarningRow label="Base Salary" value={detail.baseSalary} />
                <EarningRow label="Prorated Salary" value={detail.proratedSalary} />
                {totalOtPay > 0 && <EarningRow label="Overtime Pay" value={totalOtPay} />}
                {totalAllowances > 0 && <EarningRow label="Allowances" value={totalAllowances} />}
                <EarningRow label="Bonus" value={detail.bonus} />
                <EarningRow label="Commission" value={detail.commission} />
            </div>
            <div className="p-5 bg-emerald-100/50 dark:bg-emerald-900/20 mt-auto rounded-b-xl">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Gross Income</p>
                    <p className="text-lg font-extrabold text-emerald-900 dark:text-emerald-300">{formatCurrency(detail.grossIncome)}</p>
                </div>
            </div>
        </div>
    );
}

function DeductionCard({ detail }) {
    const insurance = (detail.bhxhEmployee || 0) + (detail.bhytEmployee || 0) + (detail.bhtnEmployee || 0);
    return (
        <div className="bg-rose-50/30 dark:bg-rose-900/5 rounded-xl border border-rose-100 dark:border-rose-900/30 flex flex-col">
            <div className="p-5 border-b border-rose-100 dark:border-rose-900/30">
                <h4 className="text-rose-800 dark:text-rose-400 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">remove_circle</span>
                    Deductions
                </h4>
            </div>
            <div className="p-5 flex-1 space-y-4">
                {insurance > 0 && <EarningRow label="Social / Health Insurance" value={insurance} />}
                <EarningRow label="Personal Income Tax (PIT)" value={detail.pit} />
                <EarningRow label="Unpaid Leave (LWOP)" value={detail.lwop} />
                <EarningRow label="Penalty" value={detail.penalty} />
            </div>
            <div className="p-5 bg-rose-100/50 dark:bg-rose-900/20 mt-auto rounded-b-xl">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-rose-900 dark:text-rose-300">Total Deductions</p>
                    <p className="text-lg font-extrabold text-rose-900 dark:text-rose-300">{formatCurrency(detail.totalDeductions)}</p>
                </div>
            </div>
        </div>
    );
}

function BreakdownSection({ detail }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EarningCard detail={detail} />
            <DeductionCard detail={detail} />
        </div>
    );
}

function AttendanceReferenceSection({ detail }) {
    const totalOtHours = (detail.otNormalHours || 0) + (detail.otWeekendHours || 0) + (detail.otHolidayHours || 0);
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-[#e7edf3] dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg">OT Breakdown</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">timer</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Normal OT</p>
                        <p className="text-xl font-bold">{detail.otNormalHours || 0}h</p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">weekend</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Weekend OT</p>
                        <p className="text-xl font-bold">{detail.otWeekendHours || 0}h</p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined">celebration</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Holiday OT</p>
                        <p className="text-xl font-bold">{detail.otHolidayHours || 0}h</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <div className="flex justify-center gap-4 py-8 border-t border-slate-200 dark:border-slate-800">
            <button className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                View Full Payslip (PDF)
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export Record
            </button>
        </div>
    );
}

export default function MyPayslipScreen() {
    const [payslips, setPayslips] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchMyPayslips()
            .then(res => {
                const list = res.data || [];
                setPayslips(list);
                if (list.length > 0) setSelectedId(list[0].payslipId);
            })
            .catch(console.error)
            .finally(() => setListLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setDetailLoading(true);
        fetchMyPayslipDetail(selectedId)
            .then(res => setDetail(res.data))
            .catch(console.error)
            .finally(() => setDetailLoading(false));
    }, [selectedId]);

    return (
        <main className="flex-1 flex flex-col overflow-y-auto">
            <Header payslips={payslips} selectedId={selectedId} onSelect={setSelectedId} />
            <DashboardContent detail={detail} loading={listLoading || detailLoading} />
        </main>
    );
}