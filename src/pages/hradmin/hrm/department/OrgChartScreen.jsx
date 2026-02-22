import { useState } from "react";
import OrgQuickView from "./OrgQuickView";

export default function OrgChartScreen() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    return (
      <div className="flex flex-col gap-6">
  
        {/* CONTROL BAR */}
        <ControlBar />
  
        {/* ORG CHART CANVAS */}
        <OrgChartCanvas onSelect = {setSelectedEmployee} />

        {/* OVERLAY */}
        {selectedEmployee && (
            <div
            className="fixed inset-0 bg-slate-200/40 backdrop-blur-sm z-30"
            onClick={() => setSelectedEmployee(null)}
            />
        )}

        {/* SIDE PANEL */}
        <OrgQuickView
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
        />
    
      </div>
    );
  }
  
  /* ================= CONTROL BAR ================= */
  
  function ControlBar() {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <SearchInput />
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Product</option>
            <option>Marketing</option>
            <option>Sales</option>
          </select>
        </div>
  
        <div className="flex items-center gap-2">
          <IconBtn icon="zoom_in" />
          <IconBtn icon="zoom_out" />
          <IconBtn icon="fullscreen_exit" />
          <button className="ml-2 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </div>
      </div>
    );
  }
  
  function SearchInput() {
    return (
      <div className="relative flex-1 max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          placeholder="Search employee or position..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        />
      </div>
    );
  }
  
  /* ================= ORG CHART ================= */
  
  function OrgChartCanvas({onSelect}) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 overflow-auto">
        <div className="flex flex-col items-center">
  
          {/* CEO */}
          <OrgNode
            name="Sarah Jenkins"
            title="Chief Executive Officer"
            avatar="https://randomuser.me/api/portraits/women/68.jpg"
            manager
            onClick={() => 
                onSelect({
                    name: "Alexander Bennett",
                    title: "Chief Executive Officer",
                    department: "Executive",
                    location: "San Francisco, CA (HQ)",
                    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
                    reportsTo: null,
                  })
            }
          />
  
          <VerticalLine />
  
          <HorizontalLine width="800px" />
  
          <div className="flex gap-24">
  
            <OrgColumn
              person={{
                name: "Marcus Reed",
                title: "Chief Technology Officer",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              children={[
                {
                  name: "David Chen",
                  title: "VP of Engineering",
                  avatar: "https://randomuser.me/api/portraits/men/45.jpg",
                },
                {
                  name: "Elena Rodriguez",
                  title: "VP of Product",
                  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                },
              ]}
            />
  
            <OrgNode
              name="Julia Wong"
              title="Chief Marketing Officer"
              avatar="https://randomuser.me/api/portraits/women/55.jpg"
              manager
              onClick={() =>
                onSelect({
                  name: "Julia Wong",
                  title: "Chief Marketing Officer",
                  department: "Core Product & Platform",
                  location: "San Francisco, CA (HQ)",
                  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                  reportsTo: "Alexander Bennett",
                })
              }
            />
  
            <OrgNode
              name="Robert Pike"
              title="Chief Operations Officer"
              avatar="https://randomuser.me/api/portraits/men/77.jpg"
              manager
              onClick={() =>
                onSelect({
                  name: "Robert Pike",
                  title: "Chief Operations Officer",
                  department: "Core Product & Platform",
                  location: "San Francisco, CA (HQ)",
                  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                  reportsTo: "Alexander Bennett",
                })
              }
            />
  
          </div>
        </div>
      </div>
    );
  }
  
  /* ================= ORG ELEMENTS ================= */
  
  function OrgColumn({ person, children }) {
    return (
      <div className="flex flex-col items-center">
        <VerticalLine />
        <OrgNode {...person} manager />
        <VerticalLine height="32px" />
        <HorizontalLine width="200px" />
  
        <div className="flex gap-8">
          {children.map((c) => (
            <OrgNode key={c.name} {...c} />
          ))}
        </div>
      </div>
    );
  }
  
  function OrgNode({ name, title, avatar, manager, onClick }) {
    return (
      <div
      onClick={onClick} 
      className="w-64 bg-white border border-slate-200 rounded-xl p-4 shadow hover:border-primary transition-all">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full border"
          />
  
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{title}</p>
          </div>
  
          {manager && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
              Manager
            </span>
          )}
        </div>
      </div>
    );
  }
  
  /* ================= UI HELPERS ================= */
  
  function IconBtn({ icon }) {
    return (
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
        <span className="material-symbols-outlined">{icon}</span>
      </button>
    );
  }
  
  function VerticalLine({ height = "48px" }) {
    return <div className="w-px bg-slate-300" style={{ height }} />;
  }
  
  function HorizontalLine({ width }) {
    return <div className="h-px bg-slate-300" style={{ width }} />;
  }
  