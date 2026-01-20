/**
 * Cart Page
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

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

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId);
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setTimeout(() => {
      alert('Checkout simulation: Order placed successfully!');
      clearCart();
      setShowCheckout(false);
      navigate('/shop');
    }, 2000);
  };

  if (loading) {
    return <Loader />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {cart.items.map((item) => {
       const itemPrice = item?.discount_price
  ? Number(item.discount_price)
  : Number(item.price);

const itemTotal = !isNaN(itemPrice)
  ? itemPrice * item.quantity
  : 0;


              return (
                <div
                  key={item.id}
                  className="flex items-center gap-6 pb-6 border-b last:border-b-0 last:pb-0"
                >
                  {/* Product Image */}
                  <Link to={`/product/${item.product_id}`}>
                    <img
                      src={item.image || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="text-lg font-semibold hover:text-primary-gray transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 uppercase mt-1">
                      {item.category}
                    </p>
                  <p className="text-lg font-bold mt-2">
  {!isNaN(itemPrice) ? `$${itemPrice.toFixed(2)}` : 'Updating...'}
</p>

                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={updating[item.id]}
                        className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updating[item.id]}
                        className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[6rem]">
                     <p className="text-lg font-bold">
  {!isNaN(itemTotal) ? `$${itemTotal.toFixed(2)}` : '$0.00'}
</p>

                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
                }
              }}
              className="text-red-500 hover:text-red-700 transition-colors text-sm"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
               <span className="font-semibold">
  {!isNaN(Number(cart.total))
    ? `$${Number(cart.total).toFixed(2)}`
    : '$0.00'}
</span>

              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={showCheckout}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50"
            >
              {showCheckout ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <Link
              to="/shop"
              className="block text-center mt-4 text-primary-black hover:text-primary-gray transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
