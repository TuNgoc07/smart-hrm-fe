import { useNavigate } from "react-router-dom";

export default function RequestsScreen() {
  const navigate = useNavigate();
    const kpiItems = [
        {title: "Total Pending" ,amount: 20, note: "Requests", isHover: "isHover" },
        {title: "AttendanceAttendance" ,amount: 55, note: "Pending" },
        {title: "Leave" ,amount: 6, note: "Pending" },
        {title: "Overdue" ,amount: 2, note: "Action NeededNeeded", danger : "danger" },
    ];
    const requests = [
        {
            employee: {
                name: "Marcus Wong",
                avt: "https://randomuser.me/api/portraits/men/45.jpg",
                emp_id: "EMP-1939"
            },
            request: {
                type: "Attendance",
                date: "Oct 23 2025",
                summary:"Late Arrival...",
                status:"4h remaining"
            }
        },
        {
            employee: {
                name: "David Kella",
                avt: "https://randomuser.me/api/portraits/men/45.jpg",
                emp_id: "EMP-1939"
            },
            request: {
                type: "Annual Leave",
                date: "Oct 23 2025",
                summary:"Late Arrival...",
                status:"4h remaining"
            }
        },
        {
            employee: {
                name: "Alex Jonhon",
                avt: "https://randomuser.me/api/portraits/men/45.jpg",
                emp_id: "EMP-1939"
            },
            request: {
                type: "Late",
                date: "Oct 23 2025",
                summary:"Late Arrival...",
                status:"4h remaining"
            }
        },
    ]

    const actionRequires =[
        {
            employee: {
                name: "Sahrah Kelhi",
                avt: "https://randomuser.me/api/portraits/men/21.jpg",
                emp_id: "EMP-1939"
            },
            require:{
                title: "Overtime (OT)",
                status: "Due 2h ago"
            }
        },
        {
            employee: {
                name: "Marcus Wong",
                avt: "https://randomuser.me/api/portraits/men/40.jpg",
                emp_id: "EMP-1939"
            },
            require:{
                title: "Sick Leave",
                status: "Due 2days ago"
            }
        }
    ];

    return (
      <div className="mx-auto w-full">
        {/* TITLE */}
        <Title/>
        
        {/* KPI */}
        <KPISection kpiItems = {kpiItems} />

        {/* Action Required Section */}
        <ActionRequiredSection requires = {actionRequires}/>
  
        {/* TABLE */}
        <div className="bg-white dark:bg-[#15202b] border rounded-2xl shadow-sm overflow-hidden">
          {/* TABS */}
          <Tabs/>
          
          {/* TABLE */}
          <AttendanceTable navigate = {navigate} requests = {requests}/>
  
          {/* FOOTER */}
          <Footer/>
        </div>
      </div>
    );
  }
  function ActionRequiredSection({requires}){
    return(
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                <h3 className="text-[#0d141b] dark:text-white font-bold text-lg">Action Required</h3>
                <span className="text-[#4c739a] text-sm font-normal">— Overdue requests requiring immediate attention</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mb-8">
                {requires.map((require) => (
                    <ActionRequiredCard require = {require} />
                ))}
            </div>
        </div>
        
    );
  }

  function ActionRequiredCard({require}){
    return (
        <div className="rounded-lg xl:col-span-6 bg-red-50 border border-red-100 flex px-6 py-5 items-center">
            <div className="">
                <img 
                className="w-9 h-9 rounded-full border object-cover"
                src={require.employee.avt} alt ="" 
                />
            </div>
            <div className="mr-auto ml-2">
                <p className="text-[#0d141b] dark:text-white font-bold">{require.employee.name}</p>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{require.require.title} • {require.require.status}</p>
            </div>
            <div className = "flex gap-2 ">
                <button className="bg-red-500 flex items-center gap-1.5 px-4 py-2  text-white text-xs font-bold rounded-lg hover:brightness-90 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-sm">close</span>
                    Reject
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2ccb5e] text-white text-xs font-bold rounded-lg hover:brightness-90 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-sm">check</span>
                    Approve
                </button>
            </div>
        </div>
    );
  }


  function Title(){
    return (
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h3 className="text-[#0d141b] dark:text-white text-2xl font-black tracking-tight">
              Approvals
            </h3>
            <p className="text-[#4c739a] text-base">
              Product Design Team • Central Workspace
            </p>
          </div>
  
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              pending_actions
            </span>
            8 Pending Approvals
          </div>
        </div>
    );
  }

  function AttendanceTable({requests, navigate}){
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr >
                  {[
                    "Employee",
                    "Type",
                    "Date",
                    "Summary",
                    "SLA Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
  
              <tbody className="divide-y">
                    {requests.map((request) => (
                        <Tr request = {request} navigate = {navigate}/>
                    ))}
              </tbody>
            </table>
          </div>
    );
  }

  function Tr({request, navigate}){
    return (
        <tr
        onClick={() => navigate('/manager/request-details')} 
        className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <img
                    src={request.employee.avt}
                    alt={request.employee.name}
                    className="w-9 h-9 rounded-full border object-cover"
                    />
                    <div>
                    <p className="text-sm font-bold">{request.employee.name}</p>
                    <p className="text-xs text-slate-500">#{request.employee.emp_id}</p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded uppercase">
                {request.request.type}
                </span>
            </td>

            <td className="px-6 py-4">{request.request.date}</td>

            <td className="px-6 py-4 italic">{request.request.summary} </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                    <span className="material-symbols-outlined text-sm">
                        schedule
                    </span>
                    {request.request.status}
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">
                        Reject
                    </button>
                    <button className="px-3 py-1.5 bg-[#2ccb5e] text-white text-xs rounded-lg hover:bg-green-600">
                        Approval
                    </button>
                </div>
            </td>
        </tr>
    );
  }

  function KPISection({kpiItems}){
    return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {kpiItems.map((item) => (
                <KPICard title = {item.title} note = {item.note} amount ={item.amount} isHover = {item.isHover} danger = {item.danger}/>
            ))}
    </div>
    );
  }

  function KPICard({title, amount, note, danger, isHover}){
    const colorBorder = danger ? "border-red-200": isHover ? "border-blue-200" : "" ;
    const colorText = danger ? "text-red-500" : "text-black";
    return (
        <button className={`${colorBorder} ${colorText} flex flex-col gap-2 p-4 bg-white dark:bg-[#15202b] border-2  rounded-xl shadow-sm text-left`}>
            <span className="text-[#4c739a] text-xs font-bold uppercase">
              {title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{amount}</span>
              <span className="text-xs text-[#4c739a]">{note}</span>
            </div>
        </button>
    );
  }
  
  function Footer(){
    return (
        <div className="px-6 py-4 border-t flex justify-between items-center">
            <p className="text-sm text-[#4c739a]">
              Showing 4 of 8 total pending requests
            </p>
  
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded text-sm">
                Previous
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm font-bold">
                Next
              </button>
            </div>
          </div>
    );
  }

  function Tabs(){
    return (
        <div className="flex border-b px-6">
            {["All Requests", "Attendance", "Leave", "Other HR"].map(
              (tab, i) => (
                <button
                  key={tab}
                  className={`px-4 py-4 text-sm font-bold border-b-2 ${
                    i === 0
                      ? "border-primary text-primary"
                      : "border-transparent text-[#4c739a]"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
    );

  }

  