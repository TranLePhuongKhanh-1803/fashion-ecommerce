import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import AddressBook from '../components/AddressBook';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      if (res.success && res.data) {
        setProfileData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi tải thông tin cá nhân' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await userAPI.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        setIsEditing(false); // Back to view mode
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi cập nhật thông tin' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
        
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Họ tên</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập họ tên của bạn"
              />
            ) : (
              <p className="text-gray-900 font-medium text-lg px-2">{profileData.name || 'Chưa cập nhật'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            ) : (
              <p className="text-gray-900 font-medium text-lg px-2">{profileData.email}</p>
            )}
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Số điện thoại</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <p className="text-gray-900 font-medium text-lg px-2">{profileData.phone || 'Chưa cập nhật'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Địa chỉ</label>
            {isEditing ? (
              <textarea
                name="address"
                value={profileData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Nhập địa chỉ giao hàng mặc định"
              ></textarea>
            ) : (
              <p className="text-gray-900 font-medium text-lg px-2 whitespace-pre-wrap">{profileData.address || 'Chưa cập nhật'}</p>
            )}
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reset unsaved changes by refetching
                  setMessage({ type: '', text: '' });
                }}
                className="px-6 py-3 rounded-xl text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-xl text-white font-medium transition-colors ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
              </button>
            </div>
          )}
        </form>

        {/* Address Book Section */}
        <hr className="my-10 border-gray-100" />
        <AddressBook />
      </div>
    </div>
  );
};

export default Profile;
