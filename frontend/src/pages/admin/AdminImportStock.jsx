import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { inventoryAPI, productAPI } from '../../services/api';
import { ArrowLeft, Save } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const AdminImportStock = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  
  const [formData, setFormData] = useState({
    product_id: '',
    variant_id: '',
    quantity: '',
    import_price: '',
    reason: 'Nhập hàng mới'
  });
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);

  // ... (rest of the component logic)

  useEffect(() => {
    // We need the list of products and variants. 
    // Since we don't have a direct "get variants by product" API yet, 
    // we can fetch the full inventory to extract variants, or just fetch products.
    // Actually, inventoryAPI.getInventory() gives all variants!
    const initData = async () => {
      try {
        setFetchingProducts(true);
        const res = await inventoryAPI.getInventory();
        if (res.success) {
          // Group by product
          const allVariants = res.data;
          setVariants(allVariants);
          
          const uniqueProducts = [];
          const seenIds = new Set();
          
          allVariants.forEach(v => {
            if (!seenIds.has(v.product_id)) {
              seenIds.add(v.product_id);
              uniqueProducts.push({
                id: v.product_id,
                name: v.product_name,
                image: v.image
              });
            }
          });
          
          setProducts(uniqueProducts);
        }
      } catch (err) {
        console.error('Failed to load products/variants:', err);
      } finally {
        setFetchingProducts(false);
      }
    };
    initData();
  }, []);

  const availableVariants = variants.filter(v => v.product_id === parseInt(formData.product_id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto reset variant if product changes
    if (name === 'product_id') {
      setFormData(prev => ({ ...prev, variant_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.variant_id || !formData.quantity) {
      alert('Vui lòng điền đầy đủ Thông tin Sản phẩm, Biến thể và Số lượng nhập.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        product_id: parseInt(formData.product_id),
        variant_id: parseInt(formData.variant_id),
        quantity: parseInt(formData.quantity),
        import_price: formData.import_price ? parseFloat(formData.import_price) : null,
        reason: formData.reason
      };

      const res = await inventoryAPI.importStock(payload);
      if (res.success) {
        alert('Nhập kho thành công!');
        navigate(user?.role === 'admin' ? '/admin/inventory' : '/staff/inventory');
      } else {
        alert(res.message || 'Có lỗi xảy ra khi nhập kho');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to={user?.role === 'admin' ? "/admin/inventory" : "/staff/inventory"}
            className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Nhập kho hàng</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sản phẩm *
              </label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Biến thể (Size / Colors) *
              </label>
              <select
                name="variant_id"
                value={formData.variant_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.product_id}
              >
                <option value="">-- Chọn tổ hợp Size / Màu --</option>
                {availableVariants.map(v => (
                  <option key={v.variant_id} value={v.variant_id}>
                    Size: {v.size} - Màu: {v.color} (Đang còn: {v.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số lượng nhập *
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Giá nhập (Tùy chọn)
                </label>
                <input
                  type="number"
                  name="import_price"
                  min="0"
                  step="0.01"
                  value={formData.import_price}
                  onChange={handleChange}
                  placeholder="VD: 15.00"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lý do / Diễn giải
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || fetchingProducts}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? 'Đang thực hiện...' : (
                <>
                  <Save size={20} />
                  Xác nhận Nhập kho
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminImportStock;
