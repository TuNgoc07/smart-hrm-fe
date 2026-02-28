import React from "react"

export default function TeamCalendarScreen() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 overflow-y-auto flex flex-col gap-6">
                <CalendarHeader />
                <div className="grid xl:grid-cols-12 flex items-center justify-between ">
                    <CalendarToolbar />
                    <CalendarFilter />
                </div>
                <CalendarTable />
                <CalendarFooter />
            </div>

        </div>
    );
}

function CalendarHeader() {
    return (
        <div className="flex items-end justify-between">
            <div>
                <h4 className="text-3xl font-extrabold text-[#0d141b] dark:text-white">
                    Team Calendar
                </h4>
                <p className="text-[#4c739a] dark:text-slate-400 font-medium mt-1">
                    Product Design Team
                </p>
            </div>

            <div className="flex h-11 w-64 items-center bg-[#e7edf3] dark:bg-slate-800 p-1 rounded-full">
                <button className="flex-1 h-full bg-white dark:bg-slate-700 shadow-sm rounded-full text-sm font-bold">
                    Week
                </button>
                <button className="flex-1 h-full rounded-full text-sm font-medium text-[#4c739a]">
                    Month
                </button>
            </div>
        </div>
    );
}

function CalendarToolbar() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 xl:col-span-6">
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-full border shadow-sm">
                    <button className="p-2 rounded-full">
                        <span className="material-symbols-outlined flex items-center">chevron_left</span>
                    </button>
                    <button className="px-6 py-1 text-sm font-bold border-x ">
                        Oct 23 – Oct 29, 2023
                    </button>
                    <button className="p-2 rounded-full">
                        <span className="material-symbols-outlined flex items-center">chevron_right</span>
                    </button>
                </div>

                <button className="px-6 py-2.5 bg-white border rounded-full text-sm font-bold shadow-sm">
                    Today
                </button>
            </div>
        </div>
    );
}

function CalendarFilter() {
    return (
        <div className="flex items-center gap-2  xl:col-span-6 justify-end">
            <span className="text-xs font-bold text-[#4c739a] uppercase tracking-wider mr-2">Filter by:</span>
            <button className="px-5 py-2 bg-[#0d141b] dark:bg-white text-white dark:text-[#0d141b] rounded-full text-xs font-bold">All</button>
            <button className="px-5 py-2 bg-blue-50 dark:bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="size-2 rounded-full flex items-center">&bull;</span> Leave
            </button>
            <button className="px-5 py-2 bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="size-2 rounded-full flex items-center">&bull;</span> Remote
            </button>
            <button className="px-5 py-2 bg-green-50 dark:bg-green-400/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-400/20 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="size-2 rounded-full flex items-center">&bull;</span> Onsite
            </button>
        </div>
    );
}

function CalendarRow({ member }) {
    const getStatusClass = (status) => {
        switch (status) {
            case "ONSITE":
                return "text-green-700 dark:text-green-400";
            case "REMOTE":
                return "text-yellow-700 dark:text-yellow-400";
            case "LEAVE":
                return "text-blue-700 dark:text-blue-400";
            case "HOLIDAY":
                return "text-purple-700 dark:text-purple-400";
            default:
                return "";
        }
    };

    const getWeekendClass = (index) => {
        return index >= 5 ? "bg-slate-100/30 dark:bg-slate-800/80" : "";
    };

    return (
        <div className="grid grid-cols-8 border-b border-[#e7edf3] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="p-4 border-r border-[#e7edf3] dark:border-slate-800 flex items-center gap-3">
                <div
                    className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm"
                    style={{ backgroundImage: `url(${member.avatar})` }}
                ></div>
                <span className="text-sm dark:text-white">
                    {member.name}
                </span>
            </div>

            {member.week.map((status, index) => (
                <div key={index} className={`p-2 flex items-center justify-center ${getWeekendClass(index)}`}>
                    {status && (
                        <span className={`text-[11px] font-medium tracking-wide ${getStatusClass(status)}`}>
                            {status}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

function CalendarTable() {
    const members = [
        {
            name: "John Doe",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuC7Fwj5kzylnNIduyJ9QSYTHLeMCu3QiVIyKwAMbKwPsPiJmaXwDfqgW6lwZzDitpmgz-D-_zetScMTT-bwbP2lqOAnBfZ-B42tl5gBNvHkAQSwnZ5Q83aWsAqFZK7D1jZbOHDdw2CNPKYoc-hR7nDvz2mxmfn7r8JSM7XBHhfGJ69f1Q-3oR9Anxqvq99jdehLPCkp3kunlQAAX3bF7KJJFzZAXKgcbBmd9UwQL6gLGbSNizGrGFKuqm1GuntiqLB7hLkyzT5g6jA",
            week: ["ONSITE", "ONSITE", "REMOTE", "REMOTE", "ONSITE", "", ""],
        },
        {
            name: "Sarah Smith",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCZYCQ18ZB6aFd0Uxv60ItT4ck1qPNWis_QXfSA8frCs8zUfoSzH8LXhCNsl9cZw5qusLQzl2Ik5TqH2SlLUEhtNueyfuoNxcYmMabcToAXe7DnkTFOgXmfQxByxEr9YI8uZirLWTtXkF2L9Bza-KEF_t_5U4UnJszJJNN1CApNnmJe81-bglfaQEneLIfuXjVJTT0cRBwno7dH6H4TJQrpKj7qrSB37JySqA3XrQk7O4PqQNyjoGJ9T3dv2Ph8JhVoMsLFY0DKXlw",
            week: ["LEAVE", "LEAVE", "ONSITE", "ONSITE", "REMOTE", "", ""],
        },
        {
            name: "Alex Chen",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDETyFSZnO8WW1OlSAgLJgkIbZrcyuvsz1i7SPWmzX5rsysrF2L0p8-7t-Bfj9VchlV60s2x128A-2cnKcBgXFcxnjNq9mw3Yx0SUuAzpm3DRifNpWVVX6qMiOcG-3ZdGZspNg1RAT2-55zJ20DXhayL0aH5csqRK7K8l1x24CNLBuWr4dm9tSsgyx6XR0tPvv3xAUDjy5JvHDXGld9rLQ4rlXTy-Rjxabb3xyf_VCWVrdZ5c8uZd92gP8E8AcgebdaCK-4s4vUzQ8",
            week: ["ONSITE", "ONSITE", "ONSITE", "HOLIDAY", "HOLIDAY", "", ""],
        },
        {
            name: "Maria Garcia",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBaN-r6UeH0EFt7gMKYjdl-tRxVeIQaTlIfplYaWl_H1p5l99kNnRrP7X6_H5cRj9xSbJHCp28GPFiP3abY_RPKs8cpgv2StrTEN_UDVvdYi6T7SnTCusP_rQh9l2Kfy9Lu-YN90y6OrwlbPhnGK7H0a33aAX1tQzL98P-zqpY2rPwCqgKPOOXVU040FXjHNcYzJn_Mx4SAAX1WwatTQ-ssM9vWJxYJFQDz5O6nqGn4oOe-LWX9XdLnn6Nb_Bp4qwiRkb8BlOLKABY",
            week: ["REMOTE", "REMOTE", "REMOTE", "ONSITE", "ONSITE", "", ""],
        },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#e7edf3] dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-8 border-b border-[#e7edf3] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/50">
                <div className="p-4 border-r border-[#e7edf3] dark:border-slate-800 font-bold text-xs uppercase text-[#4c739a]">Team Member</div>
                <div className="p-4 text-center">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Mon</span>
                    <span className="block text-xl font-extrabold dark:text-white">23</span>
                </div>
                <div className="p-4 text-center">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Tue</span>
                    <span className="block text-xl font-extrabold dark:text-white">24</span>
                </div>
                <div className="p-4 text-center">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Wed</span>
                    <span className="block text-xl font-extrabold dark:text-white">25</span>
                </div>
                <div className="p-4 text-center">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Thu</span>
                    <span className="block text-xl font-extrabold dark:text-white">26</span>
                </div>
                <div className="p-4 text-center">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Fri</span>
                    <span className="block text-xl font-extrabold dark:text-white">27</span>
                </div>
                <div className="p-4 text-center bg-slate-100/30 dark:bg-slate-800/80">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Sat</span>
                    <span className="block text-xl font-extrabold dark:text-white opacity-50">28</span>
                </div>
                <div className="p-4 text-center bg-slate-100/30 dark:bg-slate-800/80">
                    <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">Sun</span>
                    <span className="block text-xl font-extrabold dark:text-white opacity-50">29</span>
                </div>
            </div>
            {members.map((member) => (
                <CalendarRow key={member.name} member={member} />
            ))}
        </div>
    );
}

function CalendarFooter() {
    const status = ["ONSITE", "REMOTE", "LEAVE", "HOLIDAY"];
    const getStatusClass = (status) => {
        switch (status) {
            case "ONSITE":
                return "text-green-700 dark:text-green-400";
            case "REMOTE":
                return "text-yellow-700 dark:text-yellow-400";
            case "LEAVE":
                return "text-blue-700 dark:text-blue-400";
            case "HOLIDAY":
                return "text-purple-700 dark:text-purple-400";
            default:
                return "";
        }
    };
    return (
        <footer className="fixed bottom-0 mt-auto dark:bg-slate-900  px-8 py-4 flex items-center justify-between gap-10">
            <div className="flex items-center gap-8">
                <span className="text-xs font-bold uppercase">
                    Availability Guide:
                </span>
                {status.map((st) => (
                    <span className={`text-xs font-bold ${getStatusClass(st)}`}>{st}</span>
                ))}
            </div>

            <div className="flex items-center gap-4 text-[10px] font-medium">
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">update</span>
                    Auto-refreshes every 5 mins
                </div>
                <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                        help_outline
                    </span>
                    Help Center
                </div>
            </div>
        </footer>
    );
}