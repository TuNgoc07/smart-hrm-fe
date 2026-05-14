import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Logo() {
  return (
    <div className="mb-16 flex items-center gap-2 opacity-80">
      <span className="material-symbols-outlined text-primary text-3xl font-bold">shield_with_heart</span>
      <span className="text-xl font-extrabold tracking-tight text-slate-800">SmartOps</span>
    </div>
  );
}

function IconSymbol() {
  return (
    <div className="frosted-icon w-20 h-20 rounded-2xl flex items-center justify-center mb-8 rotate-3">
      <span
        className="material-symbols-outlined text-4xl text-primary/80"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}
      >
        verified_user
      </span>
    </div>
  )
}

function Header() {
  return (
    <>
      <h1 className="text-slate-900 text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
        Security Reset
      </h1>
      <p className="text-slate-500 font-light text-lg max-w-sm mb-12">
        Initiate a secure password recovery for your enterprise account.
      </p>
    </>

  )
}

function Form({handleSubmit, email, setEmail, isLoading}) {
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      <div className="text-left">
        <label className="block text-slate-700 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
          Identity Verification
        </label>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            alternate_email
          </span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass w-full pl-14 pr-6 py-5 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none"
            placeholder="Email address or Employee ID"
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-premium w-full py-5 rounded-2xl text-white font-bold text-lg tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin">refresh</span>
              Sending...
            </>
          ) : (
            <>
              Send Recovery Link
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function BackButton() {
  return (
    <div className="mt-12">
      <button
        onClick={() => navigate("/login")}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-semibold transition-all duration-300 group"
      >
        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
          arrow_back
        </span>
        Return to Sign In
      </button>
    </div>
  );
}

function MainCard({handleSubmit, email, setEmail, isLoading}) {
  return (
    <div className="glass-card w-full max-w-xl rounded-[2.5rem] p-10 sm:p-16 relative">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <IconSymbol />

        {/* Header */}
        <Header />

        {/* Form */}
        <Form handleSubmit={handleSubmit} email={email} setEmail={setEmail} isLoading={isLoading} />

        {/* Back to Login */}
        <BackButton />
      </div>
    </div>
  )
}

function Footer() {
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-8 text-slate-400 text-xs font-semibold tracking-widest uppercase">
      <a href="#" className="hover:text-primary transition-colors">Privacy Protocol</a>
      <a href="#" className="hover:text-primary transition-colors">Service Terms</a>
      <a href="#" className="hover:text-primary transition-colors">Global Support</a>
    </div>
  )
}

function BackgroundSVG() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10 opacity-40 mix-blend-soft-light">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,1000 C300,800 400,900 700,600 C900,400 1000,500 1000,0 L1000,1000 Z"
          fill="url(#grad1)"
        />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "rgb(240,244,255)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "rgb(255,255,255)", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call - sau này sẽ gọi API thực tế
    setTimeout(() => {
      console.log("Recovery link sent to:", email);
      // Có thể redirect đến trang xác nhận hoặc hiển thị thông báo
      navigate("/login");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="mesh-background min-h-screen flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-[1100px] flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Main Card */}
        <MainCard handleSubmit={handleSubmit} email={email} setEmail={setEmail} isLoading={isLoading} />

        {/* Footer Links */}
        <Footer />
      </div>

      {/* Background SVG */}
      <BackgroundSVG />


      {/* Custom Styles */}
      <style>{`
        .mesh-background {
          background-color: #ffffff;
          background-image: 
            radial-gradient(at 0% 0%, hsla(210, 100%, 95%, 1) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsla(260, 100%, 96%, 1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(210, 100%, 97%, 1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(190, 100%, 95%, 1) 0px, transparent 50%);
          background-attachment: fixed;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.08),
            inset 0 1px 1px rgba(255, 255, 255, 0.7);
        }

        .frosted-icon {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.07),
            inset 0 0 15px rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
        }

        .frosted-icon::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
          opacity: 0.3;
          transform: rotate(30deg);
        }

        .btn-premium {
          background: linear-gradient(135deg, #0062FF 0%, #004dc9 100%);
          box-shadow: 0 10px 20px -5px rgba(0, 98, 255, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-premium:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(0, 98, 255, 0.5);
        }

        .input-glass {
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }

        .input-glass:focus {
          background: rgba(255, 255, 255, 0.6);
          border-color: #0062FF;
          box-shadow: 0 0 0 4px rgba(0, 98, 255, 0.1);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}