import { useState, useEffect } from "react";
import { fetchMyPayslips, fetchMyPayslipDetail, formatCurrency, downloadPayslipPdf } from "../../../../utils/employeeApi";

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
                    {payslips?.map(p => (
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

function DashboardContent({ detail, loading, onDownload }) {
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
            <SummaryCard detail={detail} onDownload={onDownload} />
            <BreakdownSection detail={detail} />
            <AttendanceReferenceSection detail={detail} />
            <Footer onDownload={onDownload} />
        </div>
    );
}


function SummaryCard({ detail, onDownload }) {
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
                        <button onClick={onDownload} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ItemRow({ label, value, sub, highlight }) {
    if (value === undefined || value === null || value === 0) return null;
    return (
        <div className={`flex justify-between items-start py-1.5 ${highlight ? "font-semibold" : ""}`}>
            <div>
                <p className={`text-sm ${highlight ? "text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>{label}</p>
                {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
            </div>
            <p className={`text-sm font-bold ml-4 whitespace-nowrap ${highlight ? "text-slate-900 dark:text-white" : ""}`}>{formatCurrency(value)}</p>
        </div>
    );
}

function SectionDivider({ label }) {
    return (
        <div className="flex items-center gap-2 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
        </div>
    );
}

function EarningCard({ detail }) {
    const hasOt = (detail.otNormalHours || 0) + (detail.otWeekendHours || 0) + (detail.otHolidayHours || 0) > 0;
    const hasAllowances = (detail.mealAllowance || 0) + (detail.transportAllowance || 0) + (detail.otherAllowances || 0) > 0;
    return (
        <div className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col">
            <div className="p-5 border-b border-emerald-100 dark:border-emerald-900/30">
                <h4 className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Earnings
                </h4>
            </div>
            <div className="p-5 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="pb-3 space-y-0.5">
                    <SectionDivider label="Base Pay" />
                    <ItemRow label="Base Salary" value={detail.baseSalary} />
                    <ItemRow label="Prorated Salary" value={detail.proratedSalary} highlight />
                </div>
                {hasOt && (
                    <div className="py-3 space-y-0.5">
                        <SectionDivider label="Overtime" />
                        <ItemRow
                            label="OT Weekday (×1.5)"
                            value={detail.otNormalPay}
                            sub={detail.otNormalHours ? `${detail.otNormalHours}h worked` : null}
                        />
                        <ItemRow
                            label="OT Weekend (×2.0)"
                            value={detail.otWeekendPay}
                            sub={detail.otWeekendHours ? `${detail.otWeekendHours}h worked` : null}
                        />
                        <ItemRow
                            label="OT Public Holiday (×3.0)"
                            value={detail.otHolidayPay}
                            sub={detail.otHolidayHours ? `${detail.otHolidayHours}h worked` : null}
                        />
                    </div>
                )}
                {hasAllowances && (
                    <div className="py-3 space-y-0.5">
                        <SectionDivider label="Allowances" />
                        <ItemRow label="Meal Allowance" value={detail.mealAllowance} />
                        <ItemRow label="Transport Allowance" value={detail.transportAllowance} />
                        <ItemRow label="Other Allowances" value={detail.otherAllowances} />
                    </div>
                )}
                {((detail.bonus || 0) + (detail.commission || 0) > 0) && (
                    <div className="pt-3 space-y-0.5">
                        <SectionDivider label="Variable Pay" />
                        <ItemRow label="Bonus" value={detail.bonus} />
                        <ItemRow label="Commission" value={detail.commission} />
                    </div>
                )}
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
            <div className="p-5 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                {insurance > 0 && (
                    <div className="pb-3 space-y-0.5">
                        <SectionDivider label="Social Insurance (Employee)" />
                        <ItemRow label="BHXH — Social Insurance (8%)" value={detail.bhxhEmployee} />
                        <ItemRow label="BHYT — Health Insurance (1.5%)" value={detail.bhytEmployee} />
                        <ItemRow label="BHTN — Unemployment Insurance (1%)" value={detail.bhtnEmployee} />
                    </div>
                )}
                <div className="py-3 space-y-0.5">
                    <SectionDivider label="Personal Income Tax" />
                    {detail.taxableIncome > 0 && (
                        <div className="flex justify-between items-center py-1">
                            <p className="text-[12px] text-slate-400 italic">Taxable Income</p>
                            <p className="text-[12px] text-slate-400 italic">{formatCurrency(detail.taxableIncome)}</p>
                        </div>
                    )}
                    <ItemRow label="PIT — Personal Income Tax" value={detail.pit} highlight />
                </div>
                {((detail.lwop || 0) + (detail.penalty || 0) > 0) && (
                    <div className="pt-3 space-y-0.5">
                        <SectionDivider label="Other Deductions" />
                        <ItemRow label="LWOP — Unpaid Leave" value={detail.lwop} sub="baseSalary / standardDays × unpaidDays" />
                        <ItemRow label="Late Penalty" value={detail.penalty} sub="Late minutes × hourly rate" />
                    </div>
                )}
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

function OtTypeRow({ icon, iconBg, iconColor, label, rate, hours, pay }) {
    const hasData = (hours || 0) > 0 || (pay || 0) > 0;
    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${hasData ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" : "border-dashed border-slate-200 dark:border-slate-700 opacity-50"}`}>
            <div className={`size-10 shrink-0 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasData ? `${iconBg} ${iconColor}` : "bg-slate-100 text-slate-400 dark:bg-slate-700"}`}>{rate}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{hours || 0} hours worked</p>
            </div>
            <div className="text-right shrink-0">
                <p className={`text-base font-extrabold ${hasData ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600"}`}>
                    {formatCurrency(pay || 0)}
                </p>
            </div>
        </div>
    );
}

function AttendanceReferenceSection({ detail }) {
    const totalOtHours = (detail.otNormalHours || 0) + (detail.otWeekendHours || 0) + (detail.otHolidayHours || 0);
    const totalOtPay   = (detail.otNormalPay  || 0) + (detail.otWeekendPay  || 0) + (detail.otHolidayPay  || 0);
    if (totalOtHours === 0 && totalOtPay === 0) return null;
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-[#e7edf3] dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h4 className="font-bold text-lg">Overtime Summary</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Detailed breakdown of OT hours and pay by day type</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold">Total OT</p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalOtHours}h &nbsp;·&nbsp; {formatCurrency(totalOtPay)}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <OtTypeRow
                    icon="timer"
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                    label="Weekday OT"
                    rate="×1.5"
                    hours={detail.otNormalHours}
                    pay={detail.otNormalPay}
                />
                <OtTypeRow
                    icon="weekend"
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    iconColor="text-purple-600 dark:text-purple-400"
                    label="Weekend OT"
                    rate="×2.0"
                    hours={detail.otWeekendHours}
                    pay={detail.otWeekendPay}
                />
                <OtTypeRow
                    icon="celebration"
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                    iconColor="text-amber-600 dark:text-amber-400"
                    label="Public Holiday OT"
                    rate="×3.0"
                    hours={detail.otHolidayHours}
                    pay={detail.otHolidayPay}
                />
            </div>
        </section>
    );
}

function Footer({ onDownload }) {
    return (
        <div className="flex justify-center gap-4 py-8 border-t border-slate-200 dark:border-slate-800">
            <button onClick={onDownload} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                View Full Payslip (PDF)
            </button>
            <button onClick={onDownload} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download PDF
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
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!selectedId) return;
        setDownloading(true);
        try {
            await downloadPayslipPdf(selectedId);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download payslip. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        fetchMyPayslips()
            .then(res => {
                const list = res.data || [];
                console.log("payslip:" + JSON.stringify(list));
                setPayslips(list.data);
                if (list.data.length > 0) setSelectedId(list.data[0].payslipId);
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
            <DashboardContent detail={detail} loading={listLoading || detailLoading} onDownload={handleDownload} />
        </main>
    );
}