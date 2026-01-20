/**
 * Home Page
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getFeatured(8);
      setFeaturedProducts(data.data || []);
    } catch (error) {
      console.error('Failed to load featured products:', error);
      // Set empty array instead of crashing
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-primary-black to-primary-gray text-white flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 fade-in">
            Discover Your Style
          </h1>
          <p className="text-xl md:text-2xl mb-8 fade-in">
            Modern fashion for the modern you
          </p>
          <Link
            to="/shop"
            className="btn-primary text-lg px-8 py-4 inline-block fade-in"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 text-lg">Choose your style</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              key: 'shirts',
              label: 'Shirts',
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900',
            },
            {
              key: 'jackets',
              label: 'Jackets',
              image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900',
            },
            {
              key: 'pants',
              label: 'Pants',
              image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900',
            },
            {
              key: 'dresses',
              label: 'Dresses',
              image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900',
            },
            {
              key: 'shoes',
              label: 'Shoes',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900',
            },
            {
              key: 'shorts',
              label: 'Shorts',
              image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900',
            },
            {
              key: 'sweaters',
              label: 'Sweaters',
              image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900',
            },
            {
              key: 'accessories',
              label: 'Accessories',
              image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900',
            },
          ].map((cat) => (
            <Link
              key={cat.key}
              to={`/shop?category=${encodeURIComponent(cat.key)}`}
              className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  e.target.src = 'https://via.placeholder.com/900x675/cccccc/666666?text=' + encodeURIComponent(cat.label);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                  <span className="font-semibold text-primary-black">{cat.label}</span>
                  <span className="text-sm text-gray-600">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600 text-lg">Handpicked for you</p>
        </div>

        {loading ? (
          <Loader />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No featured products available</p>
            <Link
              to="/shop"
              className="btn-secondary text-lg px-8 py-4 inline-block"
            >
              View All Products
            </Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="btn-secondary text-lg px-8 py-4 inline-block"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-primary-beige py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="slide-up">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                <p className="text-gray-600">On orders over $100</p>
              </div>
            </div>
            <div className="slide-up">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-4xl mb-4">↩️</div>
                <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy</p>
              </div>
            </div>
            <div className="slide-up">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                <p className="text-gray-600">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
