import { Outlet } from "react-router-dom";
import HRHeader from "../shared/headers/HRHeader";
import HRSidebar from "../shared/sidebars/HRSidebar";

export default function HRAdminLayout() {
  return (
    <div className="flex min-h-screen bg-background-light">
      <HRSidebar />

      <main className="flex-1 ml-72">
        <HRHeader />

        {/* 🔥 CÁI QUAN TRỌNG NHẤT */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
