import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../config/config';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, Search, Plus, CheckCircle2, AlertCircle, Edit, Trash2, Tag, Box } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'staff')) {
      navigate('/');
      return;
    }

    fetch(`${BACKEND_URL}/api/products`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setProducts(data.data || []));
  }, [isAuthenticated, user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.stock <= 0).length;

  return (
    <div className="container mx-auto px-6 py-8 md:max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog, inventory, and product variants.</p>
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/admin/products/new"
            className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-slate-200"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            Add Product
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl relative overflow-hidden">
            <Package size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-blue-100 opacity-50 blur-xl"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl relative overflow-hidden">
            <CheckCircle2 size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-emerald-100 opacity-50 blur-xl"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Products</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{activeProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl relative overflow-hidden">
            <AlertCircle size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-rose-100 opacity-50 blur-xl"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Out of Stock</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or category..."
              className="pl-11 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white shadow-sm placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 shadow-sm">
                        <img
                          src={`${BACKEND_URL}${p.image}`}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">ID: #{p.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">${p.discount_price ?? p.price}</span>
                      {p.discount_price && <span className="text-xs text-slate-400 line-through mt-0.5">${p.price}</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
                      <Tag size={12} />
                      {p.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Box size={14} className="text-slate-400" />
                      <span className={`font-medium ${p.stock <= 0 ? 'text-rose-600' : p.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {p.stock} <span className="text-xs font-normal opacity-70">in stock</span>
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                        : 'bg-rose-50 text-rose-700 border-rose-200/50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      {p.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {user?.role === 'admin' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </Link>

                        <button
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">View Only</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <Package size={32} className="text-slate-300" />
                      </div>
                      <p className="text-lg font-medium text-slate-900 mb-1">No products found</p>
                      <p className="text-sm max-w-xs mx-auto">We couldn't find any products matching your search criteria.</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Clear search filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
