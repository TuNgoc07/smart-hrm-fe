export default function HRHeader() {
    return (
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-xl w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm"
              placeholder="Search employees, documents, or apps..."
            />
          </div>
  
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined">notifications</span>
            <span className="material-symbols-outlined">help</span>
  
            <img
              className="w-8 h-8 rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAummvz8S57QX0W6ckuVRwnqQuBTBuGHr_-TEnAbR7VetwvZiWyvisVJvlBFZ7KYMt9yvlWPf7V3e56SNLKAWE1diMQKyrzd099Ycasr8d-48mkZ61Vw8FaTxC6X2q5-ZDMXJLxpiz09kjWkqD11ElQXPBLaowxe993Jwbtkr6QA6-q7D9Iq-z1JHSw33RaJYadD6JVg5E29R2VOhB2UtAfF9l1titg2C84sgYAI1760a4UiQAAeo6wxVd6t3nOtYV1v4UxFB1OUgU"
            />
          </div>
        </div>
      </header>
    );
  }
  