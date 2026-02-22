export default function AIInsightsDashboard() {
    return (
      <div className="space-y-8">
  
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            AI Insights Dashboard
          </h1>
  
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-bold uppercase">
              AI Status: Scanning...
            </span>
          </div>
        </div>
  
        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Attrition Risk"
            value="32%"
            badge="High Risk"
            badgeColor="red"
            icon="trending_up"
            sub="+4% from last month"
          />
          <KPICard
            title="Attendance Risk"
            value="5%"
            badge="Low Risk"
            badgeColor="green"
            icon="calendar_month"
            sub="-2% improvement"
          />
          <KPICard
            title="Burnout Index"
            value="Medium"
            badge="Steady"
            badgeColor="amber"
            icon="psychology"
            sub="No major change"
          />
          <KPICard
            title="HR Attention Needed"
            value="12 Cases"
            badge="+3 new"
            badgeColor="primary"
            icon="priority_high"
            sub="Awaiting response"
          />
        </div>
  
        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  
          {/* ===== LEFT: RISK ALERTS ===== */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Risk Alerts & Anomalies
              </h2>
              <button className="text-primary font-bold text-sm hover:underline">
                View All
              </button>
            </div>
  
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Insight Subject</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4">AI Reasoning</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
  
                <tbody className="divide-y">
                  <RiskRow
                    name="John Doe"
                    risk="High"
                    riskColor="red"
                    reason="Recent OT spike + 3 leave requests"
                  />
                  <RiskRow
                    name="Jane Smith"
                    risk="Medium"
                    riskColor="amber"
                    reason="Consistent late clock-ins (Warehouse)"
                  />
                  <RiskRow
                    name="Robert Chen"
                    risk="High"
                    riskColor="red"
                    reason="High burnout score + low engagement"
                  />
                </tbody>
              </table>
            </div>
          </div>
  
          {/* ===== RIGHT: FORECAST ===== */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">
              Attrition Forecast
            </h2>
  
            <div className="bg-white border rounded-xl p-6 h-[300px] flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    6-Month Prediction
                  </p>
                  <p className="font-bold">
                    Trend Analysis
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">
                    Target: &lt; 15%
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Confidence: 92%
                  </p>
                </div>
              </div>
  
              <div className="flex-1 flex items-end gap-1 pt-8">
                {[40, 55, 50, 75, 85, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/70 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
  
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                <span>SEP</span>
                <span>OCT</span>
                <span>NOV</span>
                <span>DEC</span>
                <span>JAN</span>
                <span>FEB</span>
              </div>
            </div>
          </div>
        </div>
  
        {/* ================= PATTERNS ================= */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            Detected Patterns & Behavioral Anomalies
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard
              title="Potential Fraud"
              color="red"
              confidence="94%"
              headline="QR Abuse Detected in Warehouse"
              desc="Multiple clock-ins detected at same GPS coordinates within seconds."
            />
            <InsightCard
              title="Operational Risk"
              color="amber"
              confidence="88%"
              headline="Manager B - High OT Rate"
              desc="Team shows 45% higher overtime than comparable units."
            />
            <InsightCard
              title="Insight"
              color="primary"
              confidence="91%"
              headline="Peak Productivity Window"
              desc="Engineering output peaks between 10AM – 1PM."
            />
          </div>
        </div>
  
        {/* ================= AI ACTION CENTER ================= */}
        <div className="space-y-4 pb-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              electric_bolt
            </span>
            <h2 className="text-lg font-bold">
              AI Action Center
            </h2>
          </div>
  
          <ActionCard
            icon="person_search"
            title="Schedule 1:1 with John Doe"
            desc="High attrition risk detected by AI model"
            primary="Create HR Task"
            secondary="Open Profile"
          />
  
          <ActionCard
            icon="rule"
            title="Review OT policy for IT Dept"
            desc="Automation suggests adjustment to prevent burnout"
            primary="Review Policy"
            secondary="Dismiss"
          />
        </div>
  
      </div>
    );
  }
  
  /* ================= SUB COMPONENTS ================= */
  
  function KPICard({ title, value, badge, badgeColor, icon, sub }) {
    const badgeMap = {
      red: "bg-red-100 text-red-600",
      green: "bg-green-100 text-green-600",
      amber: "bg-amber-100 text-amber-600",
      primary: "bg-primary/10 text-primary",
    };
  
    return (
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-slate-500">{title}</p>
          <span className="material-symbols-outlined text-primary">
            {icon}
          </span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${badgeMap[badgeColor]}`}>
            {badge}
          </span>
          <span className="text-xs text-slate-500">{sub}</span>
        </div>
      </div>
    );
  }
  
  function RiskRow({ name, risk, riskColor, reason }) {
    const colorMap = {
      red: "bg-red-100 text-red-700",
      amber: "bg-amber-100 text-amber-700",
    };
  
    return (
      <tr>
        <td className="px-6 py-4 font-medium">{name}</td>
        <td className="px-6 py-4">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${colorMap[riskColor]}`}>
            {risk}
          </span>
        </td>
        <td className="px-6 py-4 text-slate-500">{reason}</td>
        <td className="px-6 py-4 text-right space-x-3">
          <button className="text-primary font-bold text-sm">View</button>
          <button className="text-slate-500 font-bold text-sm">Dismiss</button>
        </td>
      </tr>
    );
  }
  
  function InsightCard({ title, color, confidence, headline, desc }) {
    const borderMap = {
      red: "border-red-500",
      amber: "border-amber-500",
      primary: "border-primary",
    };
  
    return (
      <div className={`bg-white p-5 rounded-xl border-l-4 ${borderMap[color]} border`}>
        <div className="flex justify-between mb-3">
          <span className={`font-bold text-${color}-600 text-sm`}>
            {title}
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            {confidence} Confidence
          </span>
        </div>
        <p className="font-bold mb-1">{headline}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    );
  }
  
  function ActionCard({ icon, title, desc, primary, secondary }) {
    return (
      <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-white rounded-full p-2">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        </div>
  
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold">
            {primary}
          </button>
          <button className="border px-4 py-2 rounded-lg text-xs font-bold">
            {secondary}
          </button>
        </div>
      </div>
    );
  }
  