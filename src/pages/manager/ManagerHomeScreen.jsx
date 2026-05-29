import { useState, useEffect } from 'react';



const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");



export default function ManagerHomeScreen() {

  const [homeStats, setHomeStats] = useState();



  useEffect(() => {

    const token = localStorage.getItem("token");



    const request = async () => {

      if (!token) {

        return;

      }



      const request = await fetch(`${API_BASE_URL}/api/manager/home`, {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      });



      const data = await request.json();

      console.log("data:  ", JSON.stringify(data));

      setHomeStats(data);



    };

    request();

  }, []);





  return (

    <div className="flex flex-col gap-8">



      {/* ===== QUICK STATS ===== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard

          title="Team Size"

          icon="groups"

          value={homeStats?.quickStats?.teamMembers || "0"}

          trend={homeStats?.quickStats?.teamMembersTrend || ""}

        />

        <StatCard

          title="Pending Approvals"

          icon="pending_actions"

          value={homeStats?.quickStats?.pendingApprovals || "0"}

          subtitle={(homeStats?.quickStats?.urgentApprovals || 0) + " urgent"}

        />

        <StatCard

          title="Today's Attendance"

          icon="schedule"

          value={homeStats?.quickStats?.presentToday || "0"}

          trend={(homeStats?.quickStats?.attendanceRate || "0%") + " than last month"}

        />

      </div>



      {/* ===== MAIN GRID ===== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">



        {/* ===== LEFT COLUMN ===== */}

        <div className="lg:col-span-2 flex flex-col gap-4">



          {/* Pending Actions */}

          <div className="flex items-center justify-between mb-2">

            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight">

              Pending Actions

            </h3>

            <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-bold">

              3 Urgent

            </span>

          </div>



          <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#cfdbe7] dark:border-slate-800 overflow-hidden divide-y divide-[#cfdbe7] dark:divide-slate-800">

            {!homeStats?.pendingActions?.length ? (

              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">

                <span className="material-symbols-outlined text-4xl">task_alt</span>

                <p className="text-sm font-medium">No pending requests at the moment</p>

              </div>

            ) : homeStats.pendingActions.map((action) => (

              <ActionItem

                key={action.requestId}

                icon={action.icon}

                title={action.title}

                submittedAt={action.submittedAt}

                action={action.actionLabel || "Review"}

                priority={action.priority || "medium"}

              />

            ))}

          </div>



          {/* Recent Activity */}

          <div className="mt-4">

            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight mb-4">

              Recent Activity

            </h3>



            <div className="flex flex-col gap-4">

              {homeStats?.recentActivities?.map((activity, index) => (

                <TimelineItem

                  key={index}

                  active={activity.active}

                  title={activity.title}

                  meta={activity.meta}

                />

              ))}

              {/* <TimelineItem

                active

                title="Leave request approved for Sarah Connor"

                meta="Approved by Manager • 15 minutes ago"

              />

              <TimelineItem

                title="OT request submitted by Marcus Aurelius"

                meta="Backend Engineer • 45 minutes ago"

              />

              <TimelineItem

                last

                title="Attendance exception resolved for Mike Johnson"

                meta="System • 2 hours ago"

              /> */}

            </div>

          </div>

        </div>



        {/* ===== RIGHT COLUMN ===== */}

        <div className="flex flex-col gap-6">



          {/* Quick Access */}

          <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#cfdbe7] dark:border-slate-800">

            <h4 className="text-[#0d141b] dark:text-white text-sm font-bold uppercase tracking-wider mb-4">

              Quick Access

            </h4>



            <div className="grid gap-3">

              <QuickLink icon="people" label="Team Directory" />

              <QuickLink icon="calendar_month" label="Leave Calendar" />

              <QuickLink icon="fact_check" label="Attendance Reports" />

            </div>

          </div>



          {/* Team Focus */}

          <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-xl text-white shadow-lg overflow-hidden relative">

            <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-xl text-white">

              <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">

                Current Focus

              </h4>

              <p className="text-xl font-bold mb-2">

                Q4 Team Performance Review

              </p>

              <p className="text-sm opacity-90 mb-6">

                5 pending leave requests • 2 attendance exceptions • 83% attendance rate this month

              </p>

              <button className="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm">

                View Team Overview

              </button>

            </div>



            <div className="absolute -right-8 -bottom-8 opacity-20">

              <span className="material-symbols-outlined text-[120px]">

                architecture

              </span>

            </div>

          </div>



          {/* Today Schedule */}

          <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#cfdbe7] dark:border-slate-800">

            <h4 className="text-[#0d141b] dark:text-white text-sm font-bold uppercase tracking-wider mb-4">

              Today's Schedule

            </h4>



            <div className="flex flex-col gap-4">

              {homeStats?.todaySchedule?.map((schedule, index) => (

                <ScheduleItem

                  key={index}

                  title={schedule.title}

                  time={schedule.time}

                  status={schedule.status}

                  avatar={schedule.avatarUrl}

                />

              ))}

              {/* <ScheduleItem

                title="On Leave: John Doe"

                time="Oct 24-27 • Annual Leave"

                status="away"

              />

              <ScheduleItem

                title="OT Request: Jane Smith"

                time="Today 18:00-22:00 • 4 hours"

                status="pending"

              /> */}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}



/* ===== SMALL COMPONENTS ===== */



function StatCard({ title, icon, value, trend, subtitle }) {

  return (

    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#cfdbe7] dark:border-slate-800 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">

      <div className="flex justify-between items-start">

        <p className="text-[#4c739a] text-sm font-semibold uppercase tracking-wider">

          {title}

        </p>

        <span className="material-symbols-outlined text-primary">

          {icon}

        </span>

      </div>



      <p className="text-[#0d141b] dark:text-white text-3xl font-black">

        {value}

      </p>



      {trend && (

        <div className="flex items-center gap-1.5 text-[#078838] text-sm font-bold">

          <span className="material-symbols-outlined text-[16px]">

            trending_up

          </span>

          <span>{trend}</span>

        </div>

      )}



      {subtitle && (

        <p className="text-[#4c739a] text-sm font-medium">{subtitle}</p>

      )}

    </div>

  );

}



function ActionItem({ icon, title, submittedAt, action, priority }) {

  const priorityColors = {

    high: "bg-red-100 text-red-700",

    medium: "bg-amber-100 text-amber-700",

    low: "bg-green-100 text-green-700",

  };



  return (

    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">

      <div className="bg-[#e7edf3] dark:bg-slate-700 p-3 rounded-lg text-primary">

        <span className="material-symbols-outlined">{icon}</span>

      </div>

      <div className="flex-1">

        <div className="flex items-center gap-2">

          <p className="text-[#0d141b] dark:text-white font-bold">

            {title}

          </p>

          {priority && (

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityColors[priority] || priorityColors.low}`}>

              {priority}

            </span>

          )}

        </div>

        <p className="text-[#4c739a] text-sm">{submittedAt}</p>

      </div>

      <button className="px-4 py-2 bg-[#e7edf3] dark:bg-slate-700 text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-all">

        {action}

      </button>

    </div>

  );

}



function TimelineItem({ title, meta, active, last }) {

  return (

    <div className="flex gap-4">

      <div className="relative flex flex-col items-center">

        <div

          className={`size-2.5 rounded-full mt-2 ${active ? "bg-primary" : "bg-slate-300"

            }`}

        />

        {!last && (

          <div className="w-0.5 grow bg-[#cfdbe7] dark:bg-slate-800 my-1" />

        )}

      </div>

      <div>

        <p className="text-sm font-bold text-[#0d141b] dark:text-white">

          {title}

        </p>

        <p className="text-xs text-[#4c739a]">{meta}</p>

      </div>

    </div>

  );

}



function QuickLink({ icon, label }) {

  return (

    <a

      href="#"

      className="flex items-center justify-between p-3 rounded-lg border border-[#cfdbe7] dark:border-slate-700 hover:border-primary transition-all"

    >

      <div className="flex items-center gap-3">

        <span className="material-symbols-outlined text-primary">

          {icon}

        </span>

        <span className="text-sm font-bold text-[#0d141b] dark:text-white">

          {label}

        </span>

      </div>

      <span className="material-symbols-outlined text-slate-300">

        chevron_right

      </span>

    </a>

  );

}



function ScheduleItem({ title, time, status, avatar }) {

  return (

    <div className="flex gap-3 items-center">

      <img

        src={avatar || "https://randomuser.me/api/portraits/men/32.jpg"}

        alt="Employee"

        className="w-10 h-10 rounded-full object-cover"

      />

      <div className="flex-1">

        <p className="text-sm font-bold text-[#0d141b] dark:text-white">

          {title}

        </p>

        <p className="text-xs text-[#4c739a]">{time}</p>

      </div>

      <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 min-w-[50px]">

        <span className="text-xs font-bold text-primary uppercase">Oct</span>

        <span className="text-lg font-black">24</span>

      </div>

    </div>

  );

}

