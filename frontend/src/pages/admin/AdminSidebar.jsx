import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen sticky top-0 shadow-lg">
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-slate-700">
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-wide">🛍️ Store</h2>
          <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 p-4 mt-6">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">📦</span>
          <span>Sản phẩm</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">🛒</span>
          <span>Đơn hàng</span>
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">🎟️</span>
          <span>Mã giảm giá</span>
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">🏭</span>
          <span>Kho hàng</span>
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`
          }
        >
          <span className="text-xl">👥</span>
          <span>Khách hàng</span>
        </NavLink>

        <div className="my-2 border-t border-slate-700/50"></div>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white`
          }
        >
          <span className="text-xl">🌐</span>
          <span>Về trang người dùng</span>
        </NavLink>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-900 p-4">
        <p className="text-xs text-slate-400 text-center">© 2024 Fashion Store</p>
      </div>
    </aside>
  );
}
