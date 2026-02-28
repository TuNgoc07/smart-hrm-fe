import { Outlet } from "react-router-dom";
import EmployeeSidebar from "../shared/sidebars/EmployeeSidebar";
import EmployeeHeader from "../shared/headers/EmployeeHeader";


export default function EmployeeLayout() {
  return (
     <div className="flex min-h-screen bg-background-light">
          
          {/* Sidebar cố định */}
          <EmployeeSidebar />
    
          {/* Main content */}
          <main className="flex-1">
            <EmployeeHeader />
    
            {/* Nội dung page */}
            <div className="p-8">
              <Outlet />
            </div>
          </main>
        </div>
  );
}
