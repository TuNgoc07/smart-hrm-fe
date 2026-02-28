import { useState } from "react";

export default function CheckinModal({ onClose }) {
    const [showConfirmCheckin, setShowConfirmCheckin] = useState(false);

    const showConfirmModal = () => {
        setShowConfirmCheckin(true);
    }

    const closeConfirmModal = () => {
        setShowConfirmCheckin(false);
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 modal-blur">
                <div className="bg-white dark:bg-[#16222e] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                        <div>
                            <h2 className="text-xl font-extrabold text-[#0d141b] dark:text-white">Attendance</h2>
                            <p className="text-sm font-medium text-[#4c739a]">Tuesday, October 24, 2023</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="p-8 flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center">
                            <div className="text-5xl font-extrabold tracking-tight text-[#0d141b] dark:text-white mb-3">
                                09:00:12 <span className="text-2xl font-bold text-primary">AM</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-full">
                                <span className="text-lg">🔴</span>
                                <span className="text-red-700 dark:text-red-400 text-sm font-bold uppercase tracking-wide">Not checked in</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4c739a] mb-4">Work Info</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#4c739a] font-medium">Location</p>
                                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">Head Office – HCM</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-sm">language</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#4c739a] font-medium">IP Address</p>
                                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">115.78.x.x</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={showConfirmModal}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group">
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">login</span>
                            Check-in
                        </button>
                    </div>
                    <div className="px-8 pb-6 text-center">
                        <p className="text-xs text-[#4c739a]">
                            Please ensure you are within the designated work perimeter.
                        </p>
                    </div>
                </div>
            </div>

            {showConfirmCheckin && <ConfirmCheckinModal onClose={closeConfirmModal} />}
        </>
    );
}

function ConfirmCheckinModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            {/* <!-- Attendance Check-in Modal --> */}
            <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* <!-- Modal Header --> */}
                <ModalHeader onClose = {onClose} />

                {/* <!-- Modal Content --> */}
                <div className="px-8 py-2 flex flex-col items-center">
                    {/* <!-- Digital Clock --> */}
                    <DigitalClock time="08:58:45 AM" status="Not checked in yet" />

                    {/* <!-- Verification Details --> */}
                    <VerificationSection />

                    {/* <!-- Map/Verification Visualization (Optional) --> */}
                    <MapVisualization />

                    {/* <!-- Main Action Button --> */}
                    <ConfirmButton />

                    {/* <!-- Compliance Note --> */}
                    <ComplianceNote />
                </div>
                {/* <!-- Modal Footer (Subtle) --> */}
                <ModalFooter />

            </div>
        </div>
    );
}

function ModalHeader({onClose}) {
    return (
        <div className="px-8 pt-8 pb-2">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Attendance Check-in</h1>
                    <p className="text-primary font-medium mt-1">Mon, Oct 21, 2024</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
}

function ModalFooter() {
    return (
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                Need Help?
            </button>
            <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-green-500 text-sm">verified_user</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Session</span>
            </div>
        </div>
    );
}

function VerificationCard({ icon, title, description }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{title}</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{description}</span>
            </div>
        </div>
    );
}

function VerificationSection() {
    return (
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
            <VerificationCard icon="location_on" title="Location" description="Head Office - HCM" />
            <VerificationCard icon="language" title="Network IP" description="115.78.x.x" />
        </div>
    );

}

function DigitalClock({ time, status }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 w-full rounded-2xl py-8 mb-6 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
            <span className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums">{time}</span>
            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {status}
            </div>
        </div>
    );
}

function MapVisualization() {
    return (
        <div className="w-full h-32 mb-8 rounded-xl bg-slate-200 dark:bg-slate-800 relative overflow-hidden group">
            <img className="w-full h-full object-cover" dataalt="Simplified map visualization of current location" datalocation="Ho Chi Minh City" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtiUNRbi4mEFQ0dnrLuJKILTi-uB496-9C6OKUcK3FuUa4T9M5XPGwrBCwMvb-3FqNAt0H8_JOcpeTpYCyXRhbIXzD6TMY97xLdHTaKdsXtV3SgHef9-qEp93VkkSmyxMiQoD3dIkHuXCV_QRM1z4loHVhiRZKdR2JcxAEhqIHa2HtYDcAf7piQUoHVKY4FUIgu2onay_t4Je2fM-RCbZ7sLt1Q56sRTLJhyZgQn7z8IdZlubmUAkbvqrLkg-TACiXiw2vlaS5bLM" />
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-lg border-2 border-primary">
                    <span className="material-symbols-outlined text-primary text-xl">person_pin_circle</span>
                </div>
            </div>
        </div>
    );
}

function ConfirmButton() {
    return (
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined">how_to_reg</span>
            CONFIRM CHECK-IN
        </button>
    );
}

function ComplianceNote() {
    return (
        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Your location and timestamp will be recorded automatically for compliance. Ensuring transparency and safety within the workplace.
            </p>
        </div>
    );
}