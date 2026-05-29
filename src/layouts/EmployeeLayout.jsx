import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../shared/sidebars/EmployeeSidebar";
import EmployeeHeader from "../shared/headers/EmployeeHeader";
import { NotificationProvider } from "../context/NotificationContext";

export default function EmployeeLayout() {
  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-background-light">
        <div className="hidden md:block">
          <EmployeeSidebar />
        </div>
        <main className="flex-1">
          <EmployeeHeader />
          <div className="p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}
