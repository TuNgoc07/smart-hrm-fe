import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const passwordChecks = [
  {
    key: "length",
    label: "Tối thiểu 8 ký tự",
    test: (password) => password.length >= 8,
  },
  {
    key: "case",
    label: "Chữ hoa & Chữ thường",
    test: (password) => /(?=.*[a-z])(?=.*[A-Z])/.test(password),
  },
  {
    key: "number",
    label: "Ít nhất 1 chữ số",
    test: (password) => /\d/.test(password),
  },
  {
    key: "special",
    label: "Ký tự đặc biệt (!@#$)",
    test: (password) => /[!@#$]/.test(password),
  },
];

function PasswordField({ label, placeholder, value, onChange, visible, onToggle }) {
  return (
    <div className="space-y-2 group">
      <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase ml-1">{label}</label>
      <div className="relative">
        <input
          className="w-full bg-transparent border-b border-slate-300/70 py-3 px-1 pr-10 text-slate-900 focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-slate-400"
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
          type="button"
          onClick={onToggle}
        >
          <span className="material-symbols-outlined text-[20px]">{visible ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
    </div>
  );
}

function RequirementItem({ label, passed }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${passed ? "text-slate-700" : "text-slate-400"}`}>
      <span
        className={`material-symbols-outlined text-[18px] ${passed ? "text-primary" : "text-slate-300"}`}
        style={passed ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        check_circle
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function ChangePasswordScreen() {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visibleFields, setVisibleFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requirements = useMemo(
    () => passwordChecks.map((item) => ({ ...item, passed: item.test(form.newPassword) })),
    [form.newPassword]
  );

  const isPasswordValid = requirements.every((item) => item.passed);
  const isConfirmValid = form.newPassword !== "" && form.newPassword === form.confirmPassword;

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrorMessage("");
  };

  const toggleVisibility = (field) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isPasswordValid) {
      setErrorMessage("Mật khẩu mới chưa đáp ứng đầy đủ yêu cầu bảo mật.");
      return;
    }

    if (!isConfirmValid) {
      setErrorMessage("Xác nhận mật khẩu mới chưa khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Chuẩn bị payload send API cho backend
      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        userId: localStorage.getItem("userId"),
      };
      console.log("Payload: " + JSON.stringify(payload));

      const request = await fetch(`${API_BASE_URL}/api/identity/password-modification`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await request.json();
      console.log("Response: " + JSON.stringify(response));
      if (response.status === "Success") {
        // redirect đến home screen tương ứng
        const roles = JSON.parse(localStorage.getItem("roles"));
        if (roles.includes("hr_admin")) {
          navigate("/hr/home");
          return;
        }
        else if (roles.includes("manager")) {
          navigate("/manager/home");
          return;
        }
        else if (roles.includes("employee")) {
          navigate("/employee/home");
          return;
        }

        // Default case - redirect to loginScreen
        navigate("/");
      }


    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <main className="flex-grow flex items-center justify-center p-6 w-full max-w-7xl">
        <div className="glass-card w-full max-w-xl p-8 sm:p-10 rounded-xl relative overflow-hidden border border-white/60 shadow-2xl shadow-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-32 bg-primary rounded-r-full"></div>
          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Cập nhật mật khẩu</h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                Để bảo mật tài khoản, vui lòng thay đổi mật khẩu mặc định trong lần đăng nhập đầu tiên.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <PasswordField
                  label="Mật khẩu hiện tại"
                  placeholder="••••••••"
                  value={form.currentPassword}
                  onChange={updateField("currentPassword")}
                  visible={visibleFields.currentPassword}
                  onToggle={() => toggleVisibility("currentPassword")}
                />

                <PasswordField
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  value={form.newPassword}
                  onChange={updateField("newPassword")}
                  visible={visibleFields.newPassword}
                  onToggle={() => toggleVisibility("newPassword")}
                />

                <PasswordField
                  label="Xác nhận mật khẩu mới"
                  placeholder="Xác nhận mật khẩu mới"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  visible={visibleFields.confirmPassword}
                  onToggle={() => toggleVisibility("confirmPassword")}
                />
              </div>

              <div className="bg-slate-100/80 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Yêu cầu mật khẩu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requirements.map((item) => (
                    <RequirementItem key={item.key} label={item.label} passed={item.passed} />
                  ))}
                </div>
              </div>

              {errorMessage ? <p className="text-sm font-medium text-red-500">{errorMessage}</p> : null}

              {!errorMessage && form.confirmPassword && !isConfirmValid ? (
                <p className="text-sm font-medium text-red-500">Xác nhận mật khẩu mới chưa khớp.</p>
              ) : null}

              <button
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                type="submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
