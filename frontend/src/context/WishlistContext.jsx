/**
 * Wishlist Context - Global Wishlist State Management
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistAPI.getIds();
      setWishlistIds(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setWishlistIds([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  const isInWishlist = (productId) => {
    return wishlistIds.includes(Number(productId));
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Vui lòng đăng nhập để sử dụng' };
    }

    const id = Number(productId);
    try {
      if (isInWishlist(id)) {
        await wishlistAPI.remove(id);
        setWishlistIds(prev => prev.filter(pid => pid !== id));
        return { success: true, action: 'removed' };
      } else {
        await wishlistAPI.add(id);
        setWishlistIds(prev => [...prev, id]);
        return { success: true, action: 'added' };
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
      return { success: false, message: err.message || 'Lỗi' };
    }
  };

  const value = {
    wishlistIds,
    loading,
    isInWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlistIds,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
