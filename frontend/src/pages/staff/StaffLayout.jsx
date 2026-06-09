import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";
import AdminHeader from "../admin/AdminHeader"; // Reuse the admin header for user info/logout

export default function StaffLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <StaffSidebar />

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
