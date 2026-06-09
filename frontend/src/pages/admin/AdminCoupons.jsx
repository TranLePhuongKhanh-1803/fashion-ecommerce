import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { couponAPI } from '../../services/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await couponAPI.getAll();
      if (res.success) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải mã giảm giá:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await couponAPI.delete(id);
        setCoupons(coupons.filter(c => c.id !== id));
      } catch (err) {
        console.error('Lỗi khi xóa:', err);
        alert(err.message || 'Xóa thất bại');
      }
    }
  };

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Mã giảm giá</h2>
        <Link 
          to="/admin/coupons/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm Mã Mới</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500 tracking-wider">
              <th className="p-4">Mã</th>
              <th className="p-4">Loại</th>
              <th className="p-4">Giảm giá</th>
              <th className="p-4">Hạn mức (Min)</th>
              <th className="p-4">SL dùng / Tổng</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  Không có mã giảm giá nào.
                </td>
              </tr>
            ) : (
              coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">{coupon.code}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs font-medium uppercase">
                      {coupon.discount_type === 'percent' ? '%' : 'Fix'}
                    </span>
                  </td>
                  <td className="p-4">
                    {coupon.discount_type === 'percent' ? `${coupon.discount_amount}%` : `$${coupon.discount_amount}`}
                  </td>
                  <td className="p-4">${coupon.min_purchase}</td>
                  <td className="p-4">{coupon.used_count} / {coupon.usage_limit || '∞'}</td>
                  <td className="p-4">
                    {coupon.is_active ? (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Hoạt động</span>
                    ) : (
                      <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-bold">Vô hiệu hóa</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/coupons/edit/${coupon.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
