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
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

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
          page: searchParams.get('page') || 1,
        };

        // Remove empty params
        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key];
        });

        const data = await productAPI.getAll(params);
        
        if (data?.data && !Array.isArray(data.data) && data.data.data) {
          // Pagination mode
          setProducts(data.data.data);
          setPagination({
            current_page: data.data.current_page,
            last_page: data.data.last_page,
            total: data.data.total
          });
        } else {
          // Fallback
          setProducts(data?.data || data || []);
          setPagination(null);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        if (error.message && error.message.includes('Không thể kết nối')) {
          console.error('Backend server không chạy.');
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
    searchParams.get('page'),
  ]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.last_page)) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-gray-600">
          {pagination ? pagination.total : products.length} {((pagination ? pagination.total : products.length) === 1) ? 'product' : 'products'} found
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button 
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(pagination.last_page)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-md font-medium transition-colors ${
                          pagination.current_page === i + 1
                            ? 'bg-primary-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.last_page}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
