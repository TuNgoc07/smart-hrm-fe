export default function PayrollConfigurationScreen() {
    return (
      <div className="space-y-8 w-full">
  
        <Header />
  
        <SalaryFormulaCard />
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AllowanceRules />
          <DeductionRules />
        </div>
  
        <AttendanceStatutory />
  
        <PolicyVersionTable />
  
      </div>
    );
  }

  function Header() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">Payroll Configuration</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Active Policy:</span>
          <select className="bg-slate-100 rounded-lg px-3 py-2 font-bold">
            <option>Office Staff Policy</option>
            <option>Factory Workers</option>
            <option>Intern Program</option>
          </select>
        </div>
      </div>

      <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
        <span className="material-symbols-outlined">add_circle</span>
        Create New Version
      </button>
    </div>
  );
}

function SalaryFormulaCard() {
    return (
      <section className="bg-white rounded-xl border p-6 space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">functions</span>
          Base Salary Formula
        </h3>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Salary Type">
            <select className="input">
              <option>Monthly Fixed</option>
              <option>Daily Rated</option>
              <option>Hourly</option>
            </select>
          </Field>
  
          <Field label="Standard Working Days">
            <input className="input" type="number" defaultValue={22} />
          </Field>
  
          <Field label="Cycle Start Date">
            <input className="input" type="date" defaultValue="2024-01-01" />
          </Field>
        </div>
  
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-xs font-bold text-primary uppercase">
              Human-readable preview
            </p>
            <p className="font-semibold">
              Actual Salary = (Base Salary / 22 Days) × Actual Days Present
            </p>
          </div>
        </div>
      </section>
    );
  }

  function AllowanceRules() {
    return (
      <section className="bg-white rounded-xl border p-6">
        <HeaderWithAction title="Allowance Rules" icon = "add_moderator" />
  
        <RuleItem
          title="Lunch Allowance"
          desc="Fixed Monthly Amount"
          value="$150.00"
        />
  
        <RuleItem
          title="Transport Allowance"
          desc="Calculated per working day"
          value="$10 / day"
        />
      </section>
    );
  }

  function DeductionRules() {
    return (
      <section className="bg-white rounded-xl border p-6">
        <HeaderWithAction title="Deduction Rules" icon = "remove_moderator"  />
  
        <RuleItem
          title="Late Penalty"
          desc="After 15 min grace period"
          value="$5.00 / event"
        />
  
        <RuleItem
          title="Unpaid Leave"
          desc="Based on Daily Rate formula"
          value="1.0x Rate"
        />
      </section>
    );
  }

  function AttendanceStatutory() {
    return (
      <section className="bg-white rounded-xl border p-6 space-y-8">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            account_balance
          </span>
          Attendance & Statutory Settings
        </h3>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
  
          <div>
            <h4 className="text-sm font-bold uppercase text-slate-500 mb-4">
              Overtime Multipliers
            </h4>
  
            <RateRow label="Standard OT (Mon–Fri)" value={150} />
            <RateRow label="Special OT (Weekend/Holiday)" value={200} />
          </div>
  
          <div>
            <h4 className="text-sm font-bold uppercase text-slate-500 mb-4">
              Tax & Insurance Contributions
            </h4>
  
            <table className="w-full text-sm">
              <tbody>
                <StatRow label="Health Insurance" employer="4.5%" employee="1.5%" />
                <StatRow label="Social Security" employer="12%" employee="8%" />
              </tbody>
            </table>
          </div>
  
        </div>
      </section>
    );
  }

  function PolicyVersionTable() {
    return (
      <section className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Version</Th>
              <Th>Effective From</Th>
              <Th>Created By</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            <VersionRow version="v2.1 (Current)" status="Active" />
            <VersionRow version="v2.0" status="Archived" />
            <VersionRow version="v1.0" status="Archived" />
          </tbody>
        </table>
      </section>
    );
  }

//   USE HELPERS
  function Field({ label, children }) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-500">{label}</label>
        {children}
      </div>
    );
  }
  
  function HeaderWithAction({ title, icon }) {
    return (
      <div className="flex items-center mb-6">
        <span class="material-symbols-outlined text-green-500 mr-1">{icon}</span>
        <h3 className="text-lg font-bold mr-auto">{title}</h3>
        <button className="text-primary text-sm font-bold hover:underline ">
          Add New
        </button>
      </div>
    );
  }
  
  function RuleItem({ title, desc, value }) {
    return (
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg mb-4">
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{value}</span>
          <span className="material-symbols-outlined text-slate-400">edit</span>
        </div>
      </div>
    );
  }
  
  function RateRow({ label, value }) {
    return (
      <div className="flex justify-between mb-3">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <input className="w-16 border rounded text-center" defaultValue={value} />
          <span>%</span>
        </div>
      </div>
    );
  }
  
  function StatRow({ label, employer, employee }) {
    return (
      <tr className="border-t">
        <td className="py-3">{label}</td>
        <td className="py-3 text-right">{employer}</td>
        <td className="py-3 text-right">{employee}</td>
      </tr>
    );
  }
  
  function VersionRow({ version, status }) {
    return (
      <tr className="border-t">
        <td className="px-6 py-4 font-bold text-primary">{version}</td>
        <td className="px-6 py-4">Jan 01, 2024</td>
        <td className="px-6 py-4">Alex Morgan</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded-full text-xs font-bold
            ${status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"}`}>
            {status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <span className="material-symbols-outlined text-slate-400 cursor-pointer">
            visibility
          </span>
        </td>
      </tr>
    );
  }
  
  function Th({ children }) {
    return (
      <th className="px-6 py-3 text-xs font-bold uppercase text-slate-500">
        {children}
      </th>
    );
  }
  