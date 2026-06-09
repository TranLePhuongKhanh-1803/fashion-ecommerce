import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../config/config";
import { useAuth } from "../../context/AuthContext";

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: ""
  });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }

    if (isEditMode) {
      fetch(`${BACKEND_URL}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const p = data.data;
            setFormData({
              name: p.name || "",
              price: p.price || "",
              category: p.category || "",
              description: p.description || "",
              image: p.image || "",
              stock: p.stock || ""
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = isEditMode 
        ? `${BACKEND_URL}/api/products/${id}`
        : `${BACKEND_URL}/api/products`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        navigate('/admin/products');
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading product data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </h1>
        <p className="text-gray-600 mt-2">Điền thông tin chi tiết cho sản phẩm của bạn</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
          <h2 className="text-lg font-semibold text-white">📋 Thông Tin Sản Phẩm</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Price */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá (VND)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Nhập giá sản phẩm"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Category */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Chọn danh mục</option>
                <option value="shirts">Shirts (Áo sơ mi/thun)</option>
                <option value="jackets">Jackets (Áo khoác)</option>
                <option value="pants">Pants (Quần dài)</option>
                <option value="shorts">Shorts (Quần короткое)</option>
                <option value="dresses">Dresses (Đầm/Váy)</option>
                <option value="shoes">Shoes (Giày)</option>
                <option value="accessories">Accessories (Phụ kiện)</option>
              </select>
            </div>

            {/* Stock */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số lượng kho
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Nhập số lượng"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Image URL */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Hình Ảnh
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {formData.image && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả sản phẩm
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về sản phẩm"
                rows="5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {saving ? "⏳ Đang Lưu..." : (isEditMode ? "💾 Cập Nhật Sản Phẩm" : "✨ Thêm Sản Phẩm")}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ❌ Hủy Bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
