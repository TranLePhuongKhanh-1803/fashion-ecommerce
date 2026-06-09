import { useState, useEffect } from 'react';
import { addressAPI } from '../services/api';
import { Plus, MapPin, Star, Trash2, Edit2, Check } from 'lucide-react';

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    label: 'Nhà',
    full_name: '',
    phone: '',
    street_address: '',
    province: '',
    district: '',
    ward: '',
    is_default: false
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressAPI.getAll();
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải địa chỉ:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tỉnh/thành:', error);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const provinceText = e.target.options[e.target.selectedIndex].text;
    
    setFormData({ ...formData, province: provinceText, province_code: provinceCode, district: '', ward: '' });
    setDistricts([]);
    setWards([]);

    if (provinceCode) {
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts);
      } catch (error) {
        console.error('Lỗi khi tải quận/huyện:', error);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const districtText = e.target.options[e.target.selectedIndex].text;

    setFormData({ ...formData, district: districtText, district_code: districtCode, ward: '' });
    setWards([]);

    if (districtCode) {
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await response.json();
        setWards(data.wards);
      } catch (error) {
        console.error('Lỗi khi tải phường/xã:', error);
      }
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardText = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, ward: wardText, ward_code: wardCode });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      label: 'Nhà',
      full_name: '',
      phone: '',
      street_address: '',
      province: '',
      district: '',
      ward: '',
      is_default: false
    });
    setDistricts([]);
    setWards([]);
    setShowForm(false);
  };

  const handleEdit = async (addr) => {
    setFormData({
      ...addr,
      is_default: addr.is_default === 1
    });
    
    // Attempt to load districts/wards if code exists (for simplicity, we let user re-select if needed)
    if (addr.province_code) {
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${addr.province_code}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts);
        
        if (addr.district_code) {
          const resWard = await fetch(`https://provinces.open-api.vn/api/d/${addr.district_code}?depth=2`);
          const dataWard = await resWard.json();
          setWards(dataWard.wards);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await addressAPI.delete(id);
      fetchAddresses();
    } catch (err) {
      alert('Không thể xóa: ' + err.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefault(id);
      fetchAddresses();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, is_default: formData.is_default ? 1 : 0 };
      if (formData.id) {
        await addressAPI.update(formData.id, dataToSubmit);
      } else {
        await addressAPI.create(dataToSubmit);
      }
      resetForm();
      fetchAddresses();
    } catch (err) {
      alert('Lỗi khi lưu địa chỉ: ' + err.message);
    }
  };

  if (loading) return <div className="py-4 text-center text-gray-500">Đang tải sổ địa chỉ...</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sổ Địa Chỉ</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Thêm địa chỉ mới
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-4">{formData.id ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận</label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
              <select required value={formData.province_code || ''} onChange={handleProvinceChange} className="w-full border-gray-300 rounded-lg p-2.5 border">
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <select required value={formData.district_code || ''} onChange={handleDistrictChange} disabled={!districts.length} className="w-full border-gray-300 rounded-lg p-2.5 border disabled:bg-gray-100">
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <select required value={formData.ward_code || ''} onChange={handleWardChange} disabled={!wards.length} className="w-full border-gray-300 rounded-lg p-2.5 border disabled:bg-gray-100">
                <option value="">Chọn Phường/Xã</option>
                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể (Số nhà, đường...)</label>
            <input required type="text" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border" />
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-gray-700 font-medium">Đặt làm địa chỉ mặc định</span>
            </label>
            
            <div className="flex gap-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Hủy</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Lưu địa chỉ</button>
            </div>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Bạn chưa có địa chỉ nào được lưu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`border rounded-xl p-5 relative ${addr.is_default === 1 ? 'border-blue-500 shadow-sm bg-blue-50/10' : 'border-gray-200 bg-white'}`}>
              {addr.is_default === 1 && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                  <Star size={12} className="fill-white" /> Mặc định
                </div>
              )}
              
              <div className="flex justify-between mb-2 pr-20">
                <h4 className="font-bold text-gray-900">{addr.full_name}</h4>
                <span className="text-gray-500 text-sm">{addr.phone}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {addr.street_address}<br/>
                {addr.ward && `${addr.ward}, `}
                {addr.district && `${addr.district}, `}
                {addr.province}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mr-auto">
                    Thiết lập mặc định
                  </button>
                )}
                
                <div className={`${addr.is_default === 1 ? 'ml-auto' : ''} flex gap-2`}>
                  <button onClick={() => handleEdit(addr)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;
