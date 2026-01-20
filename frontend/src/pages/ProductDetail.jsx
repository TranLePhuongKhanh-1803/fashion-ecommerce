/**
 * Product Detail Page
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';

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

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getById(id);
      setProduct(data.data);
      
      if (data.data.related_products) {
        setRelatedProducts(data.data.related_products);
      }
      
      // Set first image as selected
      if (data.data.images) {
        const images = JSON.parse(data.data.images);
        setSelectedImage(0);
      }
      
      // Set default size and color if available
      if (data.data.size) {
        const sizes = data.data.size.split(',');
        if (sizes.length > 0) {
          setSelectedSize(sizes[0].trim());
        }
      }
      if (data.data.color) {
        const colors = data.data.color.split(',');
        if (colors.length > 0) {
          setSelectedColor(colors[0].trim());
        } else {
          setSelectedColor(data.data.color);
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product.id, quantity);
    
    if (result.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    
    setAdding(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-500">Product not found</p>
        <Link to="/shop" className="btn-primary mt-4 inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

 const price = product?.discount_price
  ? Number(product.discount_price)
  : Number(product.price);

const originalPrice = product?.discount_price
  ? Number(product.price)
  : null;

const discount = product?.discount_price
  ? Math.round(
      ((Number(product.price) - Number(product.discount_price)) /
        Number(product.price)) *
        100
    )
  : null;

  const images = product.images ? JSON.parse(product.images) : [product.image];
  const mainImage = images[selectedImage] || product.image || 'https://via.placeholder.com/600';
  
  // Parse sizes and colors
  const availableSizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
  const availableColors = product.color ? (product.color.includes(',') ? product.color.split(',').map(c => c.trim()) : [product.color]) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-black">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-primary-black">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-primary-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div>
          <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-gray-100 rounded-lg overflow-hidden aspect-square border-2 ${
                    selectedImage === index ? 'border-primary-black' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-primary-black">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="bg-primary-gold text-white px-3 py-1 rounded text-sm font-bold">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Details */}
          <div className="space-y-4 mb-8">
            {product.brand && (
              <div>
                <span className="font-semibold">Brand: </span>
                <span className="text-gray-600">{product.brand}</span>
              </div>
            )}
            <div>
              <span className="font-semibold">Category: </span>
              <span className="text-gray-600 uppercase">{product.category}</span>
            </div>
            <div>
              <span className="font-semibold">Stock: </span>
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <label className="block font-semibold mb-3">
                Size: {selectedSize && <span className="text-primary-black">{selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-md transition-colors ${
                      selectedSize === size
                        ? 'border-primary-black bg-primary-black text-white'
                        : 'border-gray-300 hover:border-primary-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="mb-6">
              <label className="block font-semibold mb-3">
                Color: {selectedColor && <span className="text-primary-black">{selectedColor}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-md transition-colors ${
                      selectedColor === color
                        ? 'border-primary-black bg-primary-black text-white'
                        : 'border-gray-300 hover:border-primary-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <label className="font-semibold">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 focus:outline-none"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0 || (availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor)}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding 
                ? 'Adding to Cart...' 
                : product.stock === 0 
                ? 'Out of Stock'
                : (availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor)
                ? 'Please select size/color'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast">
          ✓ Added to cart!
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
