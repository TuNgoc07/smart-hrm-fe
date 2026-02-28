export default function ProfileTab({ employee }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card title="General Information" icon="person">
                    <Row label="Full Name" value={employee.name} />
                    <Row label="Date of Birth" value={employee.general.dob} />
                    <Row label="Gender" value={employee.general.gender} />
                    <Row
                        label="Nationality"
                        value={employee.general.nationality}
                    />
                    <Row label="Marital Status" value={employee.general.marital} />
                </Card>

                <Card title="Identification" icon="id_card">
                    <Row
                        label="ID / Passport No."
                        value={employee.identification.idNumber}
                    />
                    <Row
                        label="Issue Date"
                        value={employee.identification.issueDate}
                    />
                    <Row
                        label="Place of Issue"
                        value={employee.identification.place}
                    />
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Contact Information" icon="contact_page">
                    <Row
                        label="Personal Email"
                        value={employee.contact.personalEmail}
                        link
                    />
                    <Row
                        label="Work Email"
                        value={employee.contact.workEmail}
                        link
                    />
                    <Row
                        label="Phone Number"
                        value={employee.contact.phone}
                    />
                    <Row
                        label="LinkedIn"
                        value={employee.contact.linkedin}
                        link
                    />
                </Card>

                <Card title="Address Details" icon="location_on">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                            Permanent Address
                        </p>
                        <p className="text-sm font-semibold">
                            {employee.address.permanent}
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                            Current Residence
                        </p>
                        <p className="text-sm font-semibold">
                            {employee.address.current}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
function Card({ title, icon, children }) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50 font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                    {icon}
                </span>
                {title}
            </div>
            <div className="p-6 space-y-4">{children}</div>
        </div>
    );
}

function Row({ label, value, link }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">{label}</span>
            {link ? (
                <span className="text-sm font-bold text-primary hover:underline cursor-pointer">
                    {value}
                </span>
            ) : (
                <span className="text-sm font-bold">{value}</span>
            )}
        </div>
    );
}