import { useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../shared/sidebars/EmployeeSidebar";
import EmployeeHeader from "../shared/headers/EmployeeHeader";
import { NotificationProvider } from "../context/NotificationContext";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-background-light">
        <EmployeeSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1">
          <EmployeeHeader onMenuClick={() => setSidebarOpen(true)} />
          <Outlet />
        </main>
      </div>
    </NotificationProvider>
  );
}
