import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../shared/sidebars/EmployeeSidebar";
import EmployeeHeader from "../shared/headers/EmployeeHeader";
import useNotificationPolling from "../hooks/useNotificationPolling";


export default function EmployeeLayout() {
  useNotificationPolling();

  return (
     <div className="flex min-h-screen bg-background-light">

          {/* Sidebar - án trên mobile, hiên trên tablet+ */}
          <div className="hidden md:block">
            <EmployeeSidebar />
          </div>

          {/* Main content */}
          <main className="flex-1">
            <EmployeeHeader />

            {/* Nội dung page */}
            <div className="p-4 sm:p-6 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
  );
}
