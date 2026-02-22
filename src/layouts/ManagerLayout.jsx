import { Outlet } from "react-router-dom";
import ManagerHeader from "../shared/headers/ManagerHeader";
import ManagerSidebar from "../shared/sidebars/ManagerSidebar";

export default function ManagerLayout() {
  return (
    <div className="flex min-h-screen bg-background-light">
      
      {/* Sidebar cố định */}
      <ManagerSidebar />

      {/* Main content */}
      <main className="flex-1">
        <ManagerHeader />

        {/* Nội dung page */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
