/**
 * Cart Context - Global Cart State Management
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load cart from API
  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      setCart({
        items: data.data?.items || [],
        total: data.data?.total || 0,
        count: data.data?.count || (data.data?.items?.length || 0),
      });
    } catch (error) {
      // Not logged in or cart error - reset to empty cart
      console.error('Failed to load cart:', error.message || 'Not authenticated');
      setCart({ items: [], total: 0, count: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const data = await cartAPI.addItem({ product_id: productId, quantity });
      setCart({
        items: data.data.items || [],
        total: data.data.total || 0,
        count: data.data.items?.length || 0,
      });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const data = await cartAPI.updateItem(itemId, { quantity });
      setCart({
        items: data.data.items || [],
        total: data.data.total || 0,
        count: data.data.items?.length || 0,
      });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to update cart' };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const data = await cartAPI.removeItem(productId);
      setCart({
        items: data.data.items || [],
        total: data.data.total || 0,
        count: data.data.items?.length || 0,
      });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to remove item' };
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clearCart();
      setCart({ items: [], total: 0, count: 0 });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to clear cart' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load cart on mount
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    cart,
    loading,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
