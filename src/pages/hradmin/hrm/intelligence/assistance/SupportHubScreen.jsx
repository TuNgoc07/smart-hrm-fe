export default function SupportHubScreen() {
    return (
      <div className="flex  bg-background-light ">
  
        {/* ================= MAIN ================= */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* ===== HEADER ===== */}
          <header className="bg-white px-6 py-3 flex justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">AI & Automation</span>
              <span>/</span>
              <span className="font-semibold">HR AI Assistant</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-500">notifications</span>
              <span className="material-symbols-outlined text-slate-500">help</span>
            </div>
          </header>
  
          {/* ===== CONTEXT BAR ===== */}
          <div className="bg-white border-b px-6 py-2 flex gap-3 ">
            <ContextBtn label="Scope" value="Company Wide" icon="expand_more" />
            <ContextBtn label="Period" value="Oct 2024" icon="calendar_today" />
            <ContextBtn label="Module" value="Payroll & OT" icon="tune" />
          </div>
  
          {/* ===== CHAT AREA ===== */}
          <div className="flex-1 p-6 bg-white">
            <div className=" space-y-8">
  
              {/* AI greeting */}
              <AIMessage>
                Hello Alex, I'm ready to help you with HR analytics and automated
                workflows. What would you like to investigate today?
              </AIMessage>
  
              {/* User message */}
              <UserMessage>
                What is the total OT cost for the IT department this month?
              </UserMessage>
              
              {/* AI structured response */}
              <AIResponseCard />
  
            </div>
          </div>
  
          {/* ===== FOOTER INPUT ===== */}
          <footer className="sticky bottom-0 bg-white border-t p-4">
            <div className="space-y-3">
  
              <div className="flex gap-2 overflow-x-auto">
                <Suggestion text="Who forgot to check-in most?" />
                <Suggestion text="Top 5 overtime earners" />
                <Suggestion text="Forecast payroll for next month" />
              </div>
  
              <div className="flex items-end gap-2 bg-slate-100 rounded-xl p-2">
                <span className="material-symbols-outlined text-slate-500">
                  attach_file
                </span>
                <textarea
                  rows={1}
                  placeholder="Ask me about employee trends, payroll anomalies, or pending tasks..."
                  className="flex-1 bg-transparent resize-none outline-none text-sm"
                />
                <span className="material-symbols-outlined text-slate-500">mic</span>
                <button className="bg-primary text-white p-2 rounded-lg">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
  
              <p className="text-center text-[10px] text-slate-500">
                AI can make mistakes. Please verify important HR decisions.
              </p>
            </div>
          </footer>
        </main>
      </div>
    );
  }
  
  /* ================= SUB COMPONENTS ================= */
  
  function NavItem({ icon, label, active }) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
          ${active ? "bg-primary/10 text-primary font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  
  function ContextBtn({ label, value, icon }) {
    return (
      <button className="flex items-center gap-2 bg-slate-100 px-4 h-9 rounded-lg text-sm">
        <span className="text-xs uppercase text-slate-500">{label}:</span>
        <span className="font-medium">{value}</span>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </button>
    );
  }
  
  function AIMessage({ children }) {
    return (
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
        </div>
        <div className="bg-white p-4 rounded-xl border max-w-[80%]">
          <p className="text-sm">{children}</p>
          <p className="text-[11px] text-slate-500 mt-1">AI Assistant • Just now</p>
        </div>
      </div>
    );
  }
  
  function UserMessage({ children }) {
    return (
      <div className="flex justify-end gap-3">
        <div className="bg-primary text-white p-4 rounded-xl rounded-br-none max-w-[70%]">
          <p className="text-sm">{children}</p>
          <p className="text-[11px] opacity-80 mt-1 text-right">
            HR Admin • 2m ago
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-300" />
      </div>
    );
  }
  
  function AIResponseCard() {
    return (
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
        </div>
  
        <div className="bg-white border rounded-xl shadow-md max-w-[85%] overflow-hidden">
          <div className="p-5 space-y-4">
            <Section title="Summary">
              The total Overtime (OT) cost for the <b>IT Department</b> in October
              2024 has increased compared to last month.
            </Section>
  
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total OT Cost"
                value="$14,250.00"
                note="+12.4% vs Sept"
                highlight
              />
              <StatCard
                title="Hours Logged"
                value="320 hrs"
                note="Avg 14.5 hrs / employee"
              />
            </div>
  
            <Section title="Trends">
              <div className="h-24 flex items-end gap-2">
                {[40, 55, 50, 70].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${
                      i === 3 ? "bg-primary" : "bg-slate-300"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                OT peaked during Cloud Migration project (week 3)
              </p>
            </Section>
          </div>
  
          <div className="bg-slate-50 border-t p-4 flex gap-2">
            <ActionBtn icon="list_alt" text="View IT Dept Records" />
            <ActionBtn icon="download" text="Export Detailed Report" />
          </div>
        </div>
      </div>
    );
  }
  
  function Section({ title, children }) {
    return (
      <div>
        <p className="text-xs font-bold uppercase text-slate-500 mb-1">
          {title}
        </p>
        <div className="text-sm">{children}</div>
      </div>
    );
  }
  
  function StatCard({ title, value, note, highlight }) {
    return (
      <div
        className={`p-4 rounded-lg border ${
          highlight ? "bg-primary/5 border-primary/20" : "bg-slate-50"
        }`}
      >
        <p className="text-xs text-slate-500">{title}</p>
        <p className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>
          {value}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">{note}</p>
      </div>
    );
  }
  
  function ActionBtn({ icon, text }) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        {text}
      </button>
    );
  }
  
  function Suggestion({ text }) {
    return (
      <button className="px-4 py-1.5 rounded-full border bg-white text-sm text-slate-600 hover:text-primary hover:border-primary">
        {text}
      </button>
    );
  }
  