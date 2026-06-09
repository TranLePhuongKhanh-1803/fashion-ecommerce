/**
 * Product Detail Page
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { Star } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Review states
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getById(id);
      const data = res.data;

      setProduct(data);
      setRelatedProducts(data.related_products || []);
      setVariants(data.variants || []);

      // Default image
      setSelectedImage(0);

      // Auto-select first exact variant if available
      if (data.variants && data.variants.length > 0) {
        // Try to find one with stock
        const available = data.variants.find(v => v.stock > 0);
        const first = available || data.variants[0];
        
        setSelectedSize(first.size);
        setSelectedColor(first.color);
        setSelectedVariant(first);
      } else {
        // Fallback or legacy (no variants)
        if (data.size) setSelectedSize(data.size.split(',')[0].trim());
        if (data.color) setSelectedColor(data.color.split(',')[0].trim());
      }
    } catch (err) {
      console.error(err);
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await reviewAPI.getByProduct(id);
      if (res.data) {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avg_rating || 0);
        setTotalReviews(res.data.total_reviews || 0);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      await reviewAPI.create(id, { rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      loadReviews(); // Refresh list
    } catch (err) {
      alert(err.message || 'Không thể gửi đánh giá. Bạn có thể đã đánh giá sản phẩm này rồi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // When size or color selection changes, find the matching variant
  useEffect(() => {
    if (variants.length > 0 && selectedSize && selectedColor) {
      const match = variants.find(
        v => v.size === selectedSize && v.color === selectedColor
      );
      setSelectedVariant(match || null);
      setQuantity(1); // Reset quantity when variant changes
    }
  }, [selectedSize, selectedColor, variants]);

  if (loading) return <Loader />;
  if (!product) return null;

  /* ================= IMAGE LOGIC (QUAN TRỌNG) ================= */
  const parsedImages =
  typeof product.images === 'string'
    ? JSON.parse(product.images)
    : product.images;

const images =
  Array.isArray(parsedImages) && parsedImages.length > 0
    ? parsedImages
    : product.image
    ? [product.image]
    : [];

const mainImage =
  images[selectedImage]
    ? BACKEND_URL + images[selectedImage]
    : 'https://via.placeholder.com/600';


  /* ================= PRICE ================= */
  const price = product.discount_price
    ? Number(product.discount_price)
    : Number(product.price);

  const originalPrice = product.discount_price
    ? Number(product.price)
    : null;

  const discount = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100
      )
    : null;

  /* ================= OPTIONS ================= */
  // Extract unique sizes and colors from variants, or fallback to product string
  const sizes = variants.length > 0 
    ? [...new Set(variants.map(v => v.size))].sort()
    : product.size ? product.size.split(',').map(s => s.trim()) : [];

  const colors = variants.length > 0
    ? [...new Set(variants.map(v => v.color))].sort()
    : product.color ? product.color.split(',').map(c => c.trim()) : [];

  // Determine current stock
  const currentStock = selectedVariant ? Number(selectedVariant.stock) : Number(product.stock);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariant) {
      alert("Vui lòng chọn Size và Màu hợp lệ!");
      return;
    }
    setAdding(true);
    // Passing variant_id inside addToCart payload (need to adapt context)
    // Wait, useCart's addToCart only accepts productId and quantity currently.
    // I need to change CartContext! Let's pass an object instead or 3rd param.
    // Assuming context is updated to addToCart(productId, quantity, variantId)
    const result = await addToCart(product.id, quantity, selectedVariant?.id);

    if (result.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    setAdding(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-black">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ================= IMAGES ================= */}
        <div>
          <div className="bg-gray-100 rounded-lg aspect-square overflow-hidden mb-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded overflow-hidden w-20 h-20 ${
                    selectedImage === index
                      ? 'border-black'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={BACKEND_URL + img}
                    alt={`${product.name}-${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= INFO ================= */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">${price.toFixed(2)}</span>
            {originalPrice && (
              <>
                <span className="line-through text-gray-400">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="bg-yellow-500 text-white px-2 py-1 text-sm rounded">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Size */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold mb-2">Size</p>
              <div className="flex gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size
                        ? 'bg-black text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="font-semibold mb-2">Color</p>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded ${
                      selectedColor === color
                        ? 'bg-black text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold">Quantity</span>
            <input
              type="number"
              value={quantity}
              min="1"
              max={currentStock}
              onChange={e => setQuantity(Math.max(1, Math.min(Number(e.target.value), currentStock)))}
              className="w-20 border px-2 py-1"
              disabled={currentStock === 0}
            />
            {currentStock > 0 ? (
              <span className="text-sm text-gray-500">
                {currentStock} in stock
              </span>
            ) : (
              <span className="text-sm font-semibold text-red-600">
                Out of stock
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || currentStock === 0 || (variants.length > 0 && !selectedVariant)}
            className="w-full bg-black text-white py-4 rounded text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? 'Adding...' : currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {showToast && <div className="toast">✓ Added to cart!</div>}

      {/* ================= REVIEWS SECTION ================= */}
      <section className="mt-16 border-t pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Đánh giá sản phẩm</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={18} className={s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-lg font-semibold">{avgRating}</span>
              <span className="text-gray-500">({totalReviews} đánh giá)</span>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {isAuthenticated ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4">Viết đánh giá của bạn</h3>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-sm text-gray-600 mr-2">Điểm:</span>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setReviewRating(s)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={s <= (hoverRating || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-2">{reviewRating}/5</span>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows="3"
              className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none"
            />
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="mt-3 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-center">
            <p className="text-gray-500">Vui lòng <Link to="/login" className="text-blue-600 font-medium hover:underline">đăng nhập</Link> để viết đánh giá.</p>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {review.user_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user_name}</p>
                      <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= RELATED ================= */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
