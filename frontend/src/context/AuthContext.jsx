/**
 * Auth Context - Global Authentication State Management
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

const checkAuth = async () => {
  try {
    setLoading(true);
    const data = await authAPI.getMe();

    console.log('AUTH USER:', data.data); 

    setUser(data.data);
  } catch (error) {
    setUser(null);
    console.error('Auth check failed:', error.message || 'Not authenticated');
  } finally {
    setLoading(false);
  }
};

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      setUser(data.data.user);
      // Save JWT token
      if (data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authAPI.register({ name, email, password });
      setUser(data.data.user);
      // Save JWT token
      if (data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('auth_token');
      return { success: true };
    } catch (error) {
      setUser(null);
      localStorage.removeItem('auth_token');
      return { success: true }; // Logout locally even if API fails
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
