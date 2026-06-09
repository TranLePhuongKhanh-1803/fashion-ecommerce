/**
 * Cart Page
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { BACKEND_URL } from '../config/config';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, loadCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setUpdating({ ...updating, [itemId]: true });
    await updateQuantity(itemId, newQuantity);
    setUpdating({ ...updating, [itemId]: false });
  };

  const handleRemoveItem = async (productId, variantId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId, variantId);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <Loader />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={48} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Discover our latest collections now.</p>
          <Link 
            to="/shop" 
            className="group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white w-full py-4 rounded-xl font-medium transition-all shadow-md shadow-slate-200"
          >
            Start Shopping
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
        <p className="text-slate-500 mt-2">{cart.items.length} items in your cart</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header row (desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Items */}
            <div className="divide-y divide-slate-100">
              {cart.items.map((item) => {
                const itemPrice = item?.discount_price ? Number(item.discount_price) : Number(item.price);
                const itemTotal = !isNaN(itemPrice) ? itemPrice * item.quantity : 0;
                
                return (
                  <div key={item.id} className="p-6 md:px-8 flex flex-col md:grid md:grid-cols-12 gap-6 items-center group transition-colors hover:bg-slate-50/30">
                    {/* Product Info */}
                    <div className="col-span-6 w-full flex items-center gap-6">
                      <Link to={`/product/${item.product_id}`} className="shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                          <img
                            src={item.image ? `${BACKEND_URL}${item.image}` : 'https://via.placeholder.com/150'}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                        </div>
                      </Link>
                      <div className="flex flex-col">
                        <Link to={`/product/${item.product_id}`} className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mt-1 mb-2">
                          {item.category}
                          {item.variant_id && (
                            <span className="block mt-1 normal-case text-slate-400">
                              Size: {item.size} | Màu: {item.color}
                            </span>
                          )}
                        </p>
                        <p className="font-semibold text-slate-700">
                          {!isNaN(itemPrice) ? `$${itemPrice.toFixed(2)}` : 'Updating...'}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 w-full flex justify-between md:justify-center items-center">
                      <span className="md:hidden text-sm text-slate-500 font-medium">Quantity</span>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={updating[item.id] || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updating[item.id]}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all disabled:opacity-50"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-3 w-full flex justify-between md:justify-end items-center">
                      <span className="md:hidden text-sm text-slate-500 font-medium">Total</span>
                      <p className="text-lg font-bold text-slate-900">
                        {!isNaN(itemTotal) ? `$${itemTotal.toFixed(2)}` : '$0.00'}
                      </p>
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 w-full flex justify-end">
                      <button
                        onClick={() => handleRemoveItem(item.product_id, item.variant_id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="p-6 md:px-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <Link to="/shop" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors">
                <ArrowRight size={16} className="rotate-180" />
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-28">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">Free</span>
              </div>
              
              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      {!isNaN(Number(cart.total)) ? `$${Number(cart.total).toFixed(2)}` : '$0.00'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">including taxes</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={showCheckout}
              className="group w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-slate-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
              {showCheckout ? 'Processing...' : (
                <>
                  Proceed to Checkout
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Secure and encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
