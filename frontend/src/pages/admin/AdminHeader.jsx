import { useAuth } from "../../context/AuthContext";

const AdminHeader = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to your store</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">👋 {user?.name}</p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
