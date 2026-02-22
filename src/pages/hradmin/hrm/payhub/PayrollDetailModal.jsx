export default function PayrollDetailModal({ data, onClose }) {
  const totalOT =
  Array.isArray(data.otDetails)
    ? data.otDetails.reduce((s, i) => s + i.amount, 0)
    : 0;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold">
              Payroll Detail –
              <span className="text-primary ml-1">{data.name}</span>
              <span className="text-slate-500 font-medium ml-1">
                ({data.code})
              </span>
            </h3>

            <span className="px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold">
              {data.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-12 gap-8">

            {/* ===== LEFT COLUMN ===== */}
            <div className="col-span-12 lg:col-span-7 space-y-8">

              {/* Attendance & Base */}
              <Section title="Attendance & Base" icon="📅">
                <Card>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label>Days Worked</Label>
                      <Value>
                        {data.daysWorked} / {data.totalDays}
                        <span className="text-xs text-slate-500 ml-1">
                          (1 day unpaid leave)
                        </span>
                      </Value>
                    </div>
                    <div className="text-right">
                      <Label>Base Salary</Label>
                      <Value>
                        {data.baseSalary.toLocaleString()} VND
                      </Value>
                    </div>
                  </div>

                  <Divider />

                  <Row label={`Pro-rated Base (${data.daysWorked} days)`}>
                    {(data.baseSalary * data.daysWorked / data.totalDays).toLocaleString()}
                  </Row>
                </Card>
              </Section>

              {/* Overtime */}
              <Section title="Overtime (OT)" icon="⏱">
                <Card noPadding>
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left text-xs text-slate-500">
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3 text-center">Hours</th>
                        <th className="px-5 py-3 text-center">Multiplier</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.otDetails.map((ot, i) => (
                        <tr key={i}>
                          <td className="px-5 py-3">{ot.type}</td>
                          <td className="px-5 py-3 text-center">{ot.hours}</td>
                          <td className="px-5 py-3 text-center">{ot.multiplier}</td>
                          <td className="px-5 py-3 text-right">
                            {ot.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary/5 font-bold">
                        <td className="px-5 py-3 text-primary" colSpan={3}>
                          Total OT Pay
                        </td>
                        <td className="px-5 py-3 text-right text-primary">
                          {totalOT.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </Card>
              </Section>

              {/* Allowances */}
              <Section title="Allowances" icon="🎁">
                {data.allowances.map((a, i) => (
                  <RowCard key={i} label={a.label} value={a.amount} />
                ))}
              </Section>

              {/* Deductions */}
              <Section title="Deductions & Penalties" icon="🧾" danger>
                {data.deductions.map((d, i) => (
                  <RowCard
                    key={i}
                    label={d.label}
                    value={d.amount}
                    danger
                  />
                ))}
              </Section>
            </div>

            {/* ===== RIGHT COLUMN ===== */}
            <div className="col-span-12 lg:col-span-5 space-y-8">

              {/* Audit */}
              <Section title="Audit Information" icon="🛡">
                <Card>
                  <Label>Calculation Formula</Label>
                  <code className="block bg-slate-100 p-3 rounded-lg text-xs">
                    {data.audit.formula}
                  </code>

                  <Divider />

                  <Label>Attendance Data Source</Label>
                  <a className="text-primary text-sm font-bold hover:underline">
                    {data.audit.attendanceFile}
                  </a>
                </Card>
              </Section>

              {/* Final Adjustment */}
              <Section title="Final Adjustment" icon="✏️">
                <Card>
                  <Input label="Manual Bonus" />
                  <Input label="Adjustment Penalty" />
                  <Textarea label="Reason / Comment" required />
                </Card>
              </Section>

            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-8 py-4 border-t flex justify-end gap-3 bg-slate-50 sticky bottom-0">
          <button onClick={onClose} className="px-6 py-2 border rounded-xl font-bold">
            Cancel
          </button>
          <button className="px-8 py-2 bg-primary text-white rounded-xl font-bold">
            Save Adjustments
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, icon, danger, children }) {
  return (
    <section>
      <h4 className={`font-bold text-sm uppercase mb-4 flex items-center gap-2 ${danger ? "text-red-600" : "text-slate-500"}`}>
        <span>{icon}</span> {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Card({ children, noPadding }) {
  return (
    <div className={`bg-slate-50 rounded-xl border ${noPadding ? "" : "p-5"}`}>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function RowCard({ label, value, danger }) {
  return (
    <div className={`flex justify-between p-4 rounded-lg border ${danger ? "bg-red-50 border-red-200" : "bg-white"}`}>
      <span>{label}</span>
      <span className={`font-bold ${danger ? "text-red-600" : ""}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function Label({ children }) {
  return <p className="text-xs text-slate-500 font-bold uppercase mb-2">{children}</p>;
}

function Value({ children }) {
  return <p className="text-lg font-bold">{children}</p>;
}

function Divider() {
  return <div className="my-4 border-t" />;
}

function Input({ label }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <input className="w-full border rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}

function Textarea({ label, required }) {
  return (
    <div className="space-y-1">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <textarea rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
