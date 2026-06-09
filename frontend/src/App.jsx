/**
 * Main App Component
 */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";

/* USER PAGES */
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import UserOrders from "./pages/UserOrders";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import Wishlist from "./pages/Wishlist";

/* ADMIN */
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCouponForm from "./pages/admin/AdminCouponForm";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminImportStock from "./pages/admin/AdminImportStock";
import AdminInventoryLogs from "./pages/admin/AdminInventoryLogs";

import StaffRoute from "./routes/StaffRoute";
import StaffLayout from "./pages/staff/StaffLayout";

/* ============================= */
/* APP CONTENT (handle layout)   */
/* ============================= */
function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isStaffRoute = location.pathname.startsWith("/staff");
  const isBackendPannel = isAdmin || isStaffRoute;

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER chỉ hiện ở USER */}
      {!isBackendPannel && <Header />}

      <main className="flex-grow bg-gray-50">
        <Routes>
          {/* ================= USER ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/vnpay_return" element={<PaymentResult />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/about" element={<AboutUs />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetails />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="coupons/new" element={<AdminCouponForm />} />
            <Route path="coupons/edit/:id" element={<AdminCouponForm />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="inventory/import" element={<AdminImportStock />} />
            <Route path="inventory/logs" element={<AdminInventoryLogs />} />
          </Route>

          {/* ================= STAFF ROUTES ================= */}
          <Route
            path="/staff"
            element={
              <StaffRoute>
                <StaffLayout />
              </StaffRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetails />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="inventory/import" element={<AdminImportStock />} />
            <Route path="inventory/logs" element={<AdminInventoryLogs />} />
          </Route>
        </Routes>
      </main>

      {/* FOOTER chỉ hiện ở USER */}
      {!isBackendPannel && <Footer />}
      
      {/* CHAT WIDGET chỉ hiện ở USER */}
      {!isBackendPannel && <ChatWidget />}
    </div>
  );
}

/* ============================= */
/* ROOT APP                      */
/* ============================= */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <AppContent />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
