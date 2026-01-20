/**
 * Shop Page
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Filter from '../components/Filter';
import Loader from '../components/Loader';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Get filters from URL params
        const params = {
          category: searchParams.get('category') || '',
          min_price: searchParams.get('min_price') || '',
          max_price: searchParams.get('max_price') || '',
          brand: searchParams.get('brand') || '',
          size: searchParams.get('size') || '',
          color: searchParams.get('color') || '',
          search: searchParams.get('search') || '',
          sort: searchParams.get('sort') || 'id DESC',
        };

        // Remove empty params
        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key];
        });

        const data = await productAPI.getAll(params);
        setProducts(data?.data || data || []);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        // Show error message if it's a network error
        if (error.message && error.message.includes('Không thể kết nối')) {
          console.error('Backend server không chạy. Vui lòng chạy: cd backend/public && php -S localhost:8000');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [
    searchParams.get('category'),
    searchParams.get('min_price'),
    searchParams.get('max_price'),
    searchParams.get('brand'),
    searchParams.get('size'),
    searchParams.get('color'),
    searchParams.get('search'),
    searchParams.get('sort'),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Filters */}
        <div className="lg:col-span-1">
          <Filter />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <Loader />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500 mb-2">No products found</p>
              <p className="text-gray-400 mb-4">Try adjusting your filters or check if backend server is running</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary px-6 py-2"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
