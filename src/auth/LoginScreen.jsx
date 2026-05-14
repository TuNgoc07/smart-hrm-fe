import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LeftSide() {
    return (
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-12 xl:px-24 bg-primary overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
                        </pattern>
                    </defs>
                    <rect fill="url(#grid)" height="100%" width="100%"></rect>
                </svg>
            </div>
            <div className="relative z-10">
                <div className="mb-12">
                    <div className="flex items-center gap-3 text-white">
                        <span className="material-symbols-outlined text-4xl">dashboard_customize</span>
                        <h2 className="text-2xl font-extrabold tracking-tight">SmartOps</h2>
                    </div>
                </div>
                <h1 className="text-white text-5xl xl:text-6xl font-black leading-tight tracking-tight mb-6">
                    Operate Smarter,<br />Grow Faster
                </h1>
                <p className="text-primary-100 text-xl text-white/80 max-w-lg leading-relaxed mb-10">
                    The all-in-one Smart Enterprise Operations Platform designed for high-growth teams. Streamline workflows, automate reporting, and scale your business with confidence.
                </p>
                <div className="grid grid-cols-2 gap-6 max-w-md">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                        <span className="material-symbols-outlined text-white mb-2">trending_up</span>
                        <p className="text-white font-bold text-lg">35% Increase</p>
                        <p className="text-white/60 text-sm">Operational efficiency</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                        <span className="material-symbols-outlined text-white mb-2">security</span>
                        <p className="text-white font-bold text-lg">Enterprise</p>
                        <p className="text-white/60 text-sm">Grade security &amp; SSO</p>
                    </div>
                </div>
            </div>
            {/* <!-- Background Image Overlay --> */}
            <div className="absolute inset-0 -z-10 opacity-40">
                <img alt="Modern office architecture with glass and steel" className="w-full h-full object-cover" data-alt="Modern professional high-tech office interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmGGYJubde8Yl4YLzpEa3q9OEbUtuHieh2s8TaO6QvSmHQn4gztEdfucNauTIc6rIsTpFa5dELqdM2BDn0xemCnSDhzyBoXyqbtXh3H1JrqDFmxyycMTLwffgbamFeQEeipBktUG7un5tB_OBazgmxGwL_kj4F44-e3i9dwTIqSHeX7WKBv92h8xCGfkICXg4XeeL0N_JrkzegmKYDipIippsu7bcc_knRc83dE-jPh7paFgBVTPlwe0_E0EW_uDiZJBiudJOeG68" />
            </div>
        </div>
    )
}

function Notification({ message }) {
    return (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
            <p className="text-red-600 text-sm font-medium">{message}</p>
        </div>
    )
}

function LoginForm({ forgotClick, submitForm, loginStatus }) {
    const [user, setUser] = useState({ email: "", password: "" });

    return (
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-primary/5 p-8 sm:p-12 border border-slate-200 dark:border-slate-800">
                {/* <!-- Mobile Logo --> */}
                <div className="lg:hidden flex items-center gap-3 text-primary mb-8">
                    <span className="material-symbols-outlined text-3xl">dashboard_customize</span>
                    <h2 className="text-xl font-bold tracking-tight">SmartOps</h2>
                </div>
                <div className="mb-4">
                    <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight tracking-tight">Welcome back</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Please enter your details to access your enterprise account.</p>
                </div>

                {loginStatus.status === "failed" && <Notification message={loginStatus.message + "Check your email or password again, please."} />}

                <form className="space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    submitForm(user);
                }}>
                    {/* Email Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-normal">Email Address</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                            <input className="form-input flex w-full pl-12 pr-4 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 placeholder:text-slate-400 text-base transition-all"
                                placeholder="e.g. name@company.com"
                                type="email"
                                value={user.email}
                                onChange={e => setUser({ ...user, email: e.target.value })} />
                        </div>
                    </div>
                    {/* Password Input */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-normal">Password</label>
                            <button type="button" className="text-primary hover:text-primary/80 text-sm font-bold transition-colors" onClick={forgotClick} >Forgot Password?</button>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                            <input className="form-input flex w-full pl-12 pr-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 placeholder:text-slate-400 text-base transition-all"
                                placeholder="••••••••"
                                type="password"
                                value={user.password}
                                onChange={e => setUser({ ...user, password: e.target.value })} />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" type="button">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </div>
                    </div>
                    {/* <!-- Remember Me --> */}
                    <div className="flex items-center gap-3">
                        <input className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 bg-slate-50 dark:bg-slate-800" id="remember" type="checkbox" />
                        <label className="text-slate-600 dark:text-slate-400 text-sm font-medium cursor-pointer" htmlFor="remember">Remember this device</label>
                    </div>
                    {/* <!-- Actions --> */}
                    <div className="flex flex-col gap-4 pt-2">
                        <button className="w-full flex items-center justify-center rounded-xl h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-lg shadow-primary/25"
                            type="submit">
                            Sign In
                        </button>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <button className="w-full flex items-center justify-center gap-3 rounded-xl h-14 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all" type="button">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="currentColor"></path>
                            </svg>
                            Login with SSO
                        </button>
                    </div>
                </form>
                {/* <!-- Footer --> */}
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        New to the platform?
                        <a className="text-primary font-bold hover:underline ml-1" href="#">Contact your HR Admin</a>
                    </p>
                </div>
            </div>
            {/* <!-- Bottom Footer Links --> */}
            <div className="absolute bottom-8 flex gap-6 text-slate-400 text-xs font-medium">
                <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                <a className="hover:text-primary transition-colors" href="#">Help Center</a>
            </div>
        </div>
    )
}


export default function LoginScreen() {
    const navigate = useNavigate();
    const [loginStatus, setLoginStatus] = useState({ status: "", message: "" });

    const forgotPassword = () => {
        navigate("/forgot-password");
    }

    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

    const submitForm = async (user) => {
        // Gửi request login đến backend
        const payload = {
            email: user.email,
            password: user.password
        };

        console.log("Login payload: " + JSON.stringify(payload));

        const loginRequest = await fetch(`${API_BASE_URL}/api/identity/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const loginResponse = await loginRequest.json();
        console.log("Login response: " + JSON.stringify(loginResponse));
        handleResponse(loginResponse);
    }

    const saveToken = (response) => {
        localStorage.setItem("token", response.accessToken);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("roles", JSON.stringify(response.roles));
        localStorage.setItem("employeeId", JSON.stringify(response.employeeId));
    }

    const handleResponse = (response) => {
        // Nếu loginStatus = "success" và isFirstLogin => chuyển sang trang đổi password
        if (response.status === "SUCCESS_LOGIN") {
            // Lưu token
            saveToken(response);

            if (response.changedPassword === false) {
                navigate("/change-password");
                return;
            }

            const roles = localStorage.getItem("roles");    
            if (roles.includes("hr_admin")) {
                navigate("/hr/home");
            }
            else if (roles.includes("manager")) {
                navigate("/manager/home");
            }
            else if (roles.includes("employee")) {
                navigate("/employee/home");
            }
            else {
                navigate("/");
            }
        }
        else if (response.status === "FAILED_LOGIN") {
            // Hiển thị thông báo "đăng nhập sai" 
            setLoginStatus({ status: "failed", message: response.message });
        }
        else if (response.status === "WARNING") {
            // Hiển thị page New Profile để insert vào database employee
            // navigate("/update-profile");
            console.log("WARNING: " + response.message);
        }
    }

    return (
        <div className="flex ">
            {/* Left Side: Hero/Branding */}
            <LeftSide />

            {/* <!-- Right Side: Login Form --> */}
            <LoginForm forgotClick={forgotPassword} submitForm={submitForm} loginStatus={loginStatus} />
        </div>
    )
}