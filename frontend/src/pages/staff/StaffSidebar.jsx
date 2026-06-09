import { NavLink } from "react-router-dom";

export default function StaffSidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white h-screen sticky top-0 shadow-lg">
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-indigo-700">
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-wide">🛍️ Store</h2>
          <p className="text-xs text-indigo-300 mt-1">Staff Workspace</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 p-4 mt-6">
        <NavLink
          to="/staff"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">📊</span>
          <span>Tổng quan</span>
        </NavLink>

        <NavLink
          to="/staff/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">🛒</span>
          <span>Đơn hàng</span>
        </NavLink>

        <NavLink
          to="/staff/inventory"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">🏭</span>
          <span>Kho hàng</span>
        </NavLink>

        <NavLink
          to="/staff/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">📦</span>
          <span>Sản phẩm</span>
        </NavLink>

        <NavLink
          to="/staff/customers"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">👥</span>
          <span>Khách hàng</span>
        </NavLink>

        <div className="my-2 border-t border-indigo-700/50"></div>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-indigo-200 hover:bg-indigo-700 hover:text-white`
          }
        >
          <span className="text-xl">🌐</span>
          <span>Về trang chủ</span>
        </NavLink>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-indigo-700 bg-indigo-900 p-4">
        <p className="text-xs text-indigo-300 text-center">© 2024 Fashion Store</p>
      </div>
    </aside>
  );
}
