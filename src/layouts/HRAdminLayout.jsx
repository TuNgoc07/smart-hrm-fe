import { useState } from "react";
import { Outlet } from "react-router-dom";
import HRHeader from "../shared/headers/HRHeader";
import HRSidebar from "../shared/sidebars/HRSidebar";

export default function HRAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background-light">
      <HRSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1">
        <HRHeader onMenuClick={() => setSidebarOpen(true)} />

        <Outlet />
      </main>
    </div>
  );
}
