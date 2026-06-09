/**
 * Wishlist Page
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { wishlistAPI } from '../services/api';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';

const BACKEND_URL = 'http://localhost:8000';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, navigate]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.getAll();
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setItems(prev => prev.filter(item => item.product_id !== productId));
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-red-500" />
        <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
        <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
          {items.length} sản phẩm
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-xl text-gray-500 mb-2">Chưa có sản phẩm yêu thích</p>
          <p className="text-gray-400 mb-6">Hãy duyệt cửa hàng và bấm vào biểu tượng ❤️ để thêm sản phẩm</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag size={18} />
            Khám phá cửa hàng
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const imageSrc =
              Array.isArray(item.images) && item.images.length > 0
                ? BACKEND_URL + item.images[0]
                : item.image
                ? BACKEND_URL + item.image
                : 'https://via.placeholder.com/150';

            const price = Number(item.discount_price || item.price);
            const originalPrice = item.discount_price ? Number(item.price) : null;

            return (
              <div
                key={item.wishlist_id}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/product/${item.product_id}`} className="shrink-0">
                  <img
                    src={imageSrc}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product_id}`} className="hover:text-blue-600 transition-colors">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-400 uppercase mt-1">{item.category} {item.brand && `· ${item.brand}`}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
                    {originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/product/${item.product_id}`}
                    className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Xem
                  </Link>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
