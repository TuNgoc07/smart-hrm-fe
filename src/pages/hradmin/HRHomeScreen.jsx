import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckinModal from '../../common/CheckinModal';
import CheckoutModal from '../../common/CheckoutModal';
import NewEmployee from './hrm/employeeManagement/NewEmployee';

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const quickAccessItems = [
  { label: "Checkin", icon: "login", path: "/checkin" },
  { label: "Checkout", icon: "logout", path: "/checkout" },
  { label: "New Employee", icon: "person_add", path: "/new-employee" },
  { label: "Face Registration", icon: "post_add", path: "/face-registration" },
];

const recentActivityItems = [
  {
    title: "Onboarding Completed",
    desc: "5 new hires finalized their profiles",
    time: "15 minutes ago",
    color: "bg-green-500",
  },
  {
    title: "New Candidate Applied",
    desc: "Applied for UI Designer role",
    time: "2 hours ago",
    color: "bg-blue-500",
  },
  {
    title: "Leave Approved",
    desc: "Manager approved Mark's request",
    time: "Yesterday",
    color: "bg-amber-500",
  },
  {
    title: "System Maintenance",
    desc: "Payroll module updated successfully",
    time: "Yesterday",
    color: "bg-slate-400",
  },
  {
    title: "Contract Alert",
    desc: "David's contract expires in 7 days",
    time: "Oct 21, 2023",
    color: "bg-red-500",
  },
];

function StatCard({ title, value, icon, percent }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <span className="material-symbols-outlined">
            {icon}
          </span>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
          {percent}
        </span>
      </div>

      <p className="text-slate-500 text-sm">{title}</p>
      <h3 className="text-3xl font-extrabold mt-1">{value}</h3>
    </div>
  );
}

function PendingActionItem({ item, icon, bg }) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-slate-50">
      <div className="flex items-center gap-4">
        {item.employeeInfo?.employeeAvatarUrl ? (
          <img
            src={item.employeeInfo.employeeAvatarUrl}
            alt={item.employeeInfo?.employeeName || "Employee avatar"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}
          >
            <span className="material-symbols-outlined text-sm">
              {icon}
            </span>
          </div>
        )}

        <div>
          <p className="font-bold">{item.requestInfo?.title}</p>
          <p className="text-sm text-slate-500">
            {item.requestInfo?.description} • {item.requestInfo?.submittedAt}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary">
          Review
        </button>
        <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-500">
          Skip
        </button>
      </div>
    </div>
  );
}

function QuickAccessButton({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item.path)}
      className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/50 transition text-center"
    >
      <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition">
        <span className="material-symbols-outlined">
          {item.icon}
        </span>
      </div>
      <span className="text-sm font-bold">{item.label}</span>
    </button>
  );
}

function RecentActivityItem({ item }) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full ${item.color}`}
      ></div>

      <p className="font-bold text-sm">{item.title}</p>
      <p className="text-xs text-slate-500">{item.desc}</p>
      <span className="text-[10px] uppercase font-bold text-slate-400">
        {item.time}
      </span>
    </div>
  );
}

function WelcomeSection() {
  const [employee, setEmployee] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("token = " + token)
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("full url:", `${API_BASE_URL}/api/hradmin/me`);
    const request = async () => {
      if (!token) {
        console.log("Không tìm thấy token");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/hradmin/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("home response", JSON.stringify(data.employeeInfo));
      setEmployee(data.employeeInfo);
    };

    request();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary px-8 py-10 text-white">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <p className="text-primary-100 font-medium">
            {formattedDate}
          </p>
          <h1 className="text-4xl font-black">
            Welcome back, {employee?.employeeName}
          </h1>
          <p className="text-white/80">
            You have 45 pending requests and 8 contracts expiring soon.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white text-primary font-bold rounded-lg shadow">
            View Reports
          </button>
          <button className="px-5 py-2.5 bg-white/20 text-white font-bold rounded-lg">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="40"
          />
          <circle cx="200" cy="200" r="100" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}

function Stats({ stats }) {
  const statsItems = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees,
      change: "+12%",
      icon: "👥",
    },
    {
      title: "Total Positions",
      value: stats?.totalPositions,
      change: "+5%",
      icon: "📄",
    },
    {
      title: "Total Departments",
      value: stats?.totalDepartments,
      change: "-3%",
      icon: "⏳",
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests,
      change: "+2%",
      icon: "📅",
    },
  ];
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsItems?.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </section>
  );
}

function PendingActionsSection({ stats }) {
  const icons = {
    employee: "👥",
    leave: "📅",
    performance: "📊",
  };
  const bgs = [
    { bg: "bg-slate-100 text-slate-500" },
    { bg: "bg-blue-100 text-blue-600" },
    { bg: "bg-green-100 text-green-600" },
    { bg: "bg-yellow-100 text-yellow-600" },
  ];

  const pendingActionItems = stats?.pendingActions || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">Pending Actions</h2>
        <button className="text-primary font-bold text-sm">View All</button>
      </div>

      <div className="divide-y">
        {pendingActionItems.map((item, i) => (
          <PendingActionItem key={i} item={item} icon={icons[i]} bg={bgs[i].bg} />
        ))}
      </div>
    </div>
  );
}

function QuickAccessSection({ onClick }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Quick Access</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccessItems.map((item, i) => (
          <QuickAccessButton key={i} item={item} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}

function RecentActivitySection() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

      <div className="relative pl-6 space-y-8">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-100"></div>

        {recentActivityItems.map((item, i) => (
          <RecentActivityItem key={i} item={item} />
        ))}
      </div>

      <button className="mt-6 w-full py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-500 hover:text-primary">
        See full log
      </button>
    </div>
  );
}

export default function HRHomeScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [newEmployeeModalOpen, setNewEmployeeModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const request = async () => {
      // if (!token) {
      //   console.log("Không tìm thấy token");
      //   return;
      // }

      const res = await fetch(`${API_BASE_URL}/api/hradmin/home`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("response", JSON.stringify(data));
      setStats(data);
    };
    request();

  }, []);

  function navigateTo(path) {
    if (path === '/checkin') {
      // navigate('/checkin');
      setCheckinModalOpen(true);
    }
    else if (path === '/checkout') {
      setCheckoutModalOpen(true);
    }
    else if (path === '/new-employee') {
      setNewEmployeeModalOpen(true);
    }
    else {
      navigate(path);
    }
  }

  return (
    <div className="space-y-8">
      {/* ===== WELCOME ===== */}
      <WelcomeSection />

      {/* ===== STATS ===== */}
      <Stats stats={stats} />

      {/* ===== MAIN GRID ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          <PendingActionsSection stats={stats} />
          <QuickAccessSection onClick={navigateTo} />
        </div>
        {/* RIGHT */}
        <RecentActivitySection />
      </section>
      {checkinModalOpen && <CheckinModal onClose={() => setCheckinModalOpen(false)} />}
      {checkoutModalOpen && <CheckoutModal onClose={() => setCheckoutModalOpen(false)} />}
      {newEmployeeModalOpen && <NewEmployee onClose={() => setNewEmployeeModalOpen(false)} />}
    </div>
  );
}
