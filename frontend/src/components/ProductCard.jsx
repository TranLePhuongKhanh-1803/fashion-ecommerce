/**
 * Product Card Component
 */
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';


const BACKEND_URL = 'http://localhost:8000';

const ProductCard = ({ product }) => {
  useEffect(() => {
  if (product) {
    console.log('SHOP PRODUCT:', product);
  }
}, [product]);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const liked = isInWishlist(product.id);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    await toggleWishlist(product.id);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    const result = await addToCart(product.id, 1);

    if (result?.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    setAdding(false);
  };

  /* ================= IMAGE LOGIC ================= */
const imageSrc =
  Array.isArray(product.images) && product.images.length > 0
    ? BACKEND_URL + product.images[0]
    : product.image
    ? BACKEND_URL + product.image
    : 'https://via.placeholder.com/400';




  /* ================= PRICE ================= */
  const price = Number(product.discount_price || product.price);
  const originalPrice = product.discount_price
    ? Number(product.price)
    : null;

  const discount = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100
      )
    : null;

  return (
    <div className="product-card group relative bg-white rounded-lg overflow-hidden shadow-md">
      <Link to={`/product/${product.id}`}>
        {/* Product Image */}
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
<img
  src={imageSrc}
  alt={product.name}
  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
  onError={(e) => {
    e.target.src = 'https://via.placeholder.com/400';
  }}
/>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300 shadow-sm ${
              liked
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
            title={liked ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart size={18} className={liked ? 'fill-red-500' : ''} />
          </button>

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

          {/* Category & Brand */}
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
