import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import { ArrowLeft, Clock, ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminInventoryLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(''); // '', 'import', 'export'

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;

      const res = await inventoryAPI.getLogs(params);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to={user?.role === 'admin' ? "/admin/inventory" : "/staff/inventory"}
          className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch sử Kho</h1>
          <p className="text-slate-500 mt-1">Theo dõi hoạt động Nhập / Xuất kho</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-slate-400" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 pl-3 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả hoạt động</option>
            <option value="import">Chỉ Nhập kho (+)</option>
            <option value="export">Chỉ Xuất kho (-)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Biến thể</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Số lượng</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lý do</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Người thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">Đang tải lịch sử...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    Không có nhật ký kho nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {log.type === 'import' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                          <ArrowDownRight size={14} /> Nhập
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-medium">
                          <ArrowUpRight size={14} /> Xuất
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 line-clamp-1">
                      {log.product_name}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {log.size ? `${log.size} / ${log.color}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={log.type === 'import' ? 'text-emerald-600' : 'text-red-600'}>
                        {log.type === 'import' ? '+' : '-'}{log.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 line-clamp-1">
                      {log.reason}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {log.user_name || 'Hệ thống'}
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

export default AdminInventoryLogs;
