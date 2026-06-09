import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import { BACKEND_URL } from '../../config/config';

import { useAuth } from '../../context/AuthContext';

const AdminInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatus, setStockStatus] = useState(''); // '', 'low_stock', 'out_of_stock'

  // ... (rest of the component logic)

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (stockStatus) params.stock_status = stockStatus;

      const res = await inventoryAPI.getInventory(params);
      if (res.success) {
        setInventory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [stockStatus]); // re-fetch on filter change

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý kho hàng</h1>
          <p className="text-slate-500 mt-1">Quản lý tồn kho theo từng biến thể (Size, Color)</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to={user?.role === 'admin' ? "/admin/inventory/logs" : "/staff/inventory/logs"}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            Lịch sử kho
          </Link>
          <Link 
            to={user?.role === 'admin' ? "/admin/inventory/import" : "/staff/inventory/import"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nhập kho</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </form>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-slate-400" />
          <select 
            value={stockStatus} 
            onChange={(e) => setStockStatus(e.target.value)}
            className="py-2 pl-3 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả tồn kho</option>
            <option value="in_stock">Còn hàng</option>
            <option value="low_stock">Sắp hết hàng (≤ 5)</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Màu sắc</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Tồn kho</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    Không tìm thấy biến thể sản phẩm nào.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.variant_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image ? `${BACKEND_URL}${item.image}` : 'https://via.placeholder.com/40'} 
                          alt={item.product_name} 
                          className="w-10 h-10 rounded object-cover border border-slate-200"
                        />
                        <span className="font-medium text-slate-900 line-clamp-1">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 capitalize">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                        {item.size}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                        {item.color}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {item.stock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle size={12} /> Hết hàng
                        </span>
                      ) : item.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <AlertTriangle size={12} /> Sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Còn hàng
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
