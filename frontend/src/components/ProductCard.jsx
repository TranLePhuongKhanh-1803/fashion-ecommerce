/**
 * Product Card Component
 */
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAdding(true);
    const result = await addToCart(product.id, 1);
    
    if (result.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    
    setAdding(false);
  };
const price = Number(product.discount_price || product.price);
const originalPrice = product.discount_price
  ? Number(product.price)
  : null;

  const discount = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  return (
    <div className="product-card group relative bg-white rounded-lg overflow-hidden shadow-md">
      <Link to={`/product/${product.id}`}>
        {/* Product Image */}
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <img
            src={product.image || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-2 left-2 bg-primary-gold text-white px-2 py-1 rounded text-sm font-bold">
              -{discount}%
            </div>
          )}

          {/* Quick Add Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="bg-primary-black text-white px-6 py-2 rounded-md hover:bg-primary-gray transition-colors disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-gray transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary-black">
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Category & Brand Badge */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-xs text-primary-gray font-medium">
                {product.brand}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast">
          ✓ Added to cart!
        </div>
      )}
    </div>
  );
};

export default ProductCard;
