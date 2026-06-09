import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { couponAPI } from '../../services/api';

const AdminCouponForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: '',
    discount_amount: '',
    discount_type: 'percent',
    min_purchase: 0,
    expires_at: '',
    usage_limit: '',
    is_active: 1
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const res = await couponAPI.getById(id);
      if (res.success && res.data) {
        setFormData({
          code: res.data.code,
          discount_amount: res.data.discount_amount,
          discount_type: res.data.discount_type,
          min_purchase: res.data.min_purchase,
          expires_at: res.data.expires_at ? res.data.expires_at.slice(0, 16) : '', // Format datetime for input
          usage_limit: res.data.usage_limit || '',
          is_active: res.data.is_active
        });
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at || null,
      };

      if (isEditMode) {
        await couponAPI.update(id, payload);
        alert('Cập nhật mã giảm giá thành công!');
      } else {
        await couponAPI.create(payload);
        alert('Thêm mã giảm giá thành công!');
      }
      navigate('/admin/coupons');
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu mã giảm giá');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/coupons" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Sửa Mã Giảm Giá' : 'Thêm Mã Mới'}
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã Khuyến Mãi</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="VD: SUMMER2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái Hoạt động</label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active === 1}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Áp dụng ngay</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại Giảm Giá</label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá Trị Giảm</label>
            <input
              type="number"
              step="0.01"
              name="discount_amount"
              value={formData.discount_amount}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="VD: 10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá Trị Đơn Hàng Tối Thiểu ($)</label>
            <input
              type="number"
              step="0.01"
              name="min_purchase"
              value={formData.min_purchase}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới Hạn Số Lượt Dùng (Bỏ trống = Không giới hạn)</label>
            <input
              type="number"
              name="usage_limit"
              value={formData.usage_limit}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời Gian Hết Hạn</label>
          <input
            type="datetime-local"
            name="expires_at"
            value={formData.expires_at}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Link
            to="/admin/coupons"
            className="px-6 py-2 mr-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            <Save size={20} />
            <span>{saving ? 'Đang lưu...' : 'Lưu Mã Giảm Giá'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminCouponForm;
