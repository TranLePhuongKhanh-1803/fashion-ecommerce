/**
 * Header Component
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import Logo from './Logo';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-28 relative">
          
          {/* Left Area: Navigation (Desktop) & Menu Button (Mobile) */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-primary-black hover:text-primary-gray transition-colors mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-primary-black hover:text-primary-gray transition-colors font-medium">
                Home
              </Link>
              <Link to="/shop" className="text-primary-black hover:text-primary-gray transition-colors font-medium">
                Shop
              </Link>
              <Link to="/shop?category=dresses" className="text-primary-black hover:text-primary-gray transition-colors font-medium">
                Collection
              </Link>
              <Link to="/about" className="text-primary-black hover:text-primary-gray transition-colors font-medium">
                About
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" className="text-red-600 font-semibold hover:underline">
                  Admin
                </Link>
              )}
              {user?.role === "staff" && (
                <Link to="/staff" className="text-amber-600 font-semibold hover:underline">
                  Staff Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Center Area: Logo (Absolute Centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Link to="/" className="hover:opacity-80 transition-opacity block">
              <Logo className="w-40 md:w-64 h-auto object-contain transform scale-110 md:scale-125" />
            </Link>
          </div>

          {/* Right Area: Search & Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar (Desktop) */}
            <form onSubmit={handleSearch} className="hidden xl:flex items-center">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-black w-48"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-black text-white rounded-r-md hover:bg-primary-gray transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Search Icon (Mobile/Tablet) */}
            <button
              onClick={() => navigate('/shop')}
              className="xl:hidden text-primary-black hover:text-primary-gray transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-primary-black hover:text-primary-gray transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart && cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </Link>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="text-primary-black hover:text-red-500 transition-colors" title="Danh sách yêu thích">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* User Icon / Account */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="text-primary-black hover:text-primary-gray transition-colors pt-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user?.name}
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-primary-black hover:text-primary-gray transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t mt-4 pt-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-primary-black hover:text-primary-gray transition-colors">
                Home
              </Link>
              <Link to="/shop" className="text-primary-black hover:text-primary-gray transition-colors">
                Shop
              </Link>
              
              <Link to="/shop?category=dresses" className="text-primary-black hover:text-primary-gray transition-colors">
                Collection
              </Link>
              <Link to="/about" className="text-primary-black hover:text-primary-gray transition-colors">
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
