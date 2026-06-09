import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/config';
import { couponAPI, addressAPI } from '../services/api';
import { User, ChevronRight, ShieldCheck, Truck, Banknote, CreditCard, Sparkles, Check, Package, CheckCircle2, Landmark } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Address states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('');

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Fetch provinces and saved addresses on mount
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error('Error fetching provinces:', err));

    if (isAuthenticated) {
      addressAPI.getAll()
        .then(res => {
          if (res.data && res.data.length > 0) {
            setSavedAddresses(res.data);
          }
        })
        .catch(err => console.error('Error fetching addresses:', err));
    }
  }, [isAuthenticated]);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []))
        .catch(err => console.error('Error fetching districts:', err));
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []))
        .catch(err => console.error('Error fetching wards:', err));
      setSelectedWard('');
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, cart.items.length, navigate]);

  const handleSelectSavedAddress = (e) => {
    const addrId = e.target.value;
    setSelectedSavedAddress(addrId);
    
    if (addrId) {
      const addr = savedAddresses.find(a => a.id == addrId);
      if (addr) {
        // We set the form values by updating states and DOM inputs
        const fullNameInput = document.querySelector('input[name="fullName"]');
        const phoneInput = document.querySelector('input[name="phone"]');
        const addressInput = document.querySelector('input[name="address"]');
        
        if (fullNameInput) fullNameInput.value = addr.full_name;
        if (phoneInput) phoneInput.value = addr.phone;
        if (addressInput) addressInput.value = addr.street_address;
        
        setSelectedProvince(addr.province_code || '');
        // The district and ward will need to be selected manually or wait for effect, 
        // but for simplicity, we'll try to set them after short delays or just let user re-verify
        setTimeout(() => setSelectedDistrict(addr.district_code || ''), 500);
        setTimeout(() => setSelectedWard(addr.ward_code || ''), 1000);
      }
    }
  };

  const SHIPPING_FEE = shippingMethod === 'express' ? 15 : 0;
  
  // Recalculate discount if cart total changes
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.discount) {
      // we already have actual discount
    }
  }, [cart.total]);

  const actualDiscount = Math.min(discountAmount, cart.total); // Discount shouldn't exceed cart total
  const orderTotal = cart.total - actualDiscount + SHIPPING_FEE;

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const res = await couponAPI.applyCoupon(couponCode, cart.total);
      if (res.success) {
        setAppliedCoupon({
          code: res.data.coupon_code,
          discount_type: res.data.discount_type,
          discount: res.data.discount
        });
        setDiscountAmount(Number(res.data.discount));
        setCouponSuccess(res.message);
      }
    } catch (err) {
      setCouponError(err.message || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.target);
    const streetAddress = formData.get('address') || '';
    
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã');
      setIsProcessing(false);
      return;
    }

    const provinceName = provinces.find(p => p.code == selectedProvince)?.name || '';
    const districtName = districts.find(d => d.code == selectedDistrict)?.name || '';
    const wardName = wards.find(w => w.code == selectedWard)?.name || '';
    
    const shippingAddress = `${streetAddress}, ${wardName}, ${districtName}, ${provinceName}`;

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          total_amount: orderTotal,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount_amount: actualDiscount,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          items: cart.items
        })
      });
      
      const data = await res.json();
      if (data.success) {
        clearCart();
        
        if (paymentMethod === 'vnpay') {
          // Call VNPay create URL
          const vnpayRes = await fetch(`${BACKEND_URL}/api/payment/vnpay/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              order_id: data.data.order_id,
              amount: orderTotal
            })
          });
          const vnpayData = await vnpayRes.json();
          if (vnpayData.success && vnpayData.data.payment_url) {
            window.location.href = vnpayData.data.payment_url;
            return;
          } else {
            alert('Lỗi tạo URL thanh toán VNPay, đơn hàng đã được lưu dưới dạng chưa thanh toán.');
            navigate('/orders');
          }
        } else {
          alert('Đơn hàng đặt thành công! Cảm ơn bạn.');
          navigate('/orders'); // Redirect to user orders page
        }
      } else {
        alert(data.message || 'Có lỗi xảy ra khi đặt hàng.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi kết nối với máy chủ.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/50 min-h-screen py-8 pb-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:max-w-6xl relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 pt-4">
          <Link to="/cart" className="hover:text-slate-900 transition-colors">Giỏ hàng</Link>
          <ChevronRight size={14} />
          <span className="text-blue-600 font-medium">Thanh toán</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Shipping & Form Info */}
          <div className="lg:w-3/5 flex flex-col gap-8">
            
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Thông tin giao hàng</h2>
              </div>
              
              {/* User Account Info - Glassmorphic Card */}
              {user && (
                <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md mb-8 shadow-sm">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex justify-center items-center shrink-0 shadow-inner">
                    <User className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tài khoản đang đăng nhập</p>
                    <p className="font-bold text-slate-900 text-lg">{user?.name || 'Khách hàng'}</p>
                    <p className="text-sm text-slate-600 font-medium">{user?.email}</p>
                  </div>
                </div>
              )}

              {/* Saved Addresses Dropdown */}
              {savedAddresses.length > 0 && (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white p-6 md:p-8 space-y-4 shadow-sm mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn từ sổ địa chỉ</label>
                  <select 
                    value={selectedSavedAddress}
                    onChange={handleSelectSavedAddress}
                    className="w-full bg-white/80 border border-blue-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">-- Nhập địa chỉ mới --</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label}: {addr.full_name} - {addr.street_address}, {addr.ward}, {addr.district}, {addr.province}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Shipping Form Fields */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white p-6 md:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Họ và tên</label>
                    <input 
                      required 
                      type="text" 
                      name="fullName"
                      defaultValue={user?.name || ''}
                      placeholder="Nhập tên người nhận" 
                      className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại</label>
                    <input 
                      required 
                      type="tel" 
                      name="phone"
                      placeholder="Nhập số điện thoại" 
                      className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Địa chỉ nhận hàng</label>
                  <input 
                    required 
                    type="text" 
                    name="address"
                    placeholder="Số nhà, Tên đường..." 
                    className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select 
                    required 
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Tỉnh / Thành</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                  <select 
                    required 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                    className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Quận / Huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                  <select 
                    required 
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Phường / Xã</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Phương thức vận chuyển</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Standard Shipping Card */}
                <label className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="shipping" className="sr-only" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${shippingMethod === 'standard' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Truck size={24} />
                    </div>
                    {shippingMethod === 'standard' && <div className="text-blue-600"><CheckCircle2 size={24} /></div>}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Giao hàng tiêu chuẩn</h3>
                  <p className="text-slate-500 text-sm mb-4">Nhận hàng trong 3-5 ngày làm việc</p>
                  <div className="mt-auto font-bold text-blue-600">Miễn phí</div>
                </label>

                {/* Express Shipping Card */}
                <label className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="shipping" className="sr-only" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${shippingMethod === 'express' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Sparkles size={24} />
                    </div>
                    {shippingMethod === 'express' && <div className="text-blue-600"><CheckCircle2 size={24} /></div>}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Giao hàng hỏa tốc</h3>
                  <p className="text-slate-500 text-sm mb-4">Nhận hàng trong 24h</p>
                  <div className="mt-auto font-bold text-slate-900">+$15.00</div>
                </label>

              </div>
            </section>

            {/* Payment Method */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
                <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Phương thức thanh toán</h2>
              </div>
              <div className="space-y-4">
                
                {/* COD Option */}
                <div className={`rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
                  <label className="flex items-center p-5 cursor-pointer">
                    <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4 ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'cod' && <Check size={14} className="text-white" />}
                    </div>
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl mr-4">
                      <Banknote size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</h3>
                      <p className="text-slate-500 text-sm">Thanh toán bằng tiền mặt khi shipper giao tới</p>
                    </div>
                  </label>
                </div>

                {/* Credit Card Option - disabled for now */}
                <div className="rounded-2xl border-2 border-slate-200 bg-white/60 opacity-60">
                  <label className="flex items-center p-5 cursor-not-allowed">
                    <input type="radio" name="payment" className="sr-only" disabled />
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-300 mr-4"></div>
                    <div className="p-3 bg-slate-100 text-slate-500 rounded-xl mr-4">
                      <CreditCard size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Thẻ Tín dụng / Ghi nợ</h3>
                      <p className="text-slate-500 text-sm">Tính năng đang được phát triển</p>
                    </div>
                  </label>
                </div>

                {/* Bank Transfer Option */}
                <div className={`rounded-2xl border-2 transition-all ${paymentMethod === 'bank_transfer' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
                  <label className="flex items-center p-5 cursor-pointer">
                    <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4 ${paymentMethod === 'bank_transfer' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'bank_transfer' && <Check size={14} className="text-white" />}
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mr-4">
                      <Landmark size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Chuyển khoản Ngân hàng</h3>
                      <p className="text-slate-500 text-sm">Chuyển khoản trực tiếp vào tài khoản của chúng tôi</p>
                    </div>
                  </label>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="bg-white p-4 rounded-xl border border-blue-100 text-sm shadow-sm">
                        <p className="font-semibold text-slate-800 mb-2">Thông tin chuyển khoản:</p>
                        <ul className="space-y-1 text-slate-600">
                          <li>Ngân hàng: <span className="font-medium text-slate-900">Vietcombank</span></li>
                          <li>Chủ tài khoản: <span className="font-medium text-slate-900">NGUYEN VAN A</span></li>
                          <li>Số tài khoản: <span className="font-bold text-blue-600 text-base">1234567890</span></li>
                        </ul>
                        <p className="text-xs text-slate-500 mt-3 italic">* Vui lòng ghi chú mã đơn hàng (Ví dụ: ORD-1234) trong nội dung chuyển khoản. Bạn sẽ nhận được mã đơn hàng sau khi Đặt hàng thành công.</p>
                        <img src={`https://img.vietqr.io/image/vcb-1234567890-compact.png?amount=${Math.round(orderTotal * 25000)}&addInfo=Thanh toan don hang&accountName=FASHION STORE`} alt="VietQR" className="mt-4 border rounded-xl" style={{width: '200px'}} />
                      </div>
                    </div>
                  )}
                </div>

                {/* VNPay Option */}
                <div className={`rounded-2xl border-2 transition-all ${paymentMethod === 'vnpay' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
                  <label className="flex items-center p-5 cursor-pointer">
                    <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4 ${paymentMethod === 'vnpay' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'vnpay' && <Check size={14} className="text-white" />}
                    </div>
                    <div className="p-3 bg-slate-100 text-slate-800 rounded-xl mr-4 flex items-center justify-center font-bold">
                      VNPay
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Thanh toán qua VNPay</h3>
                      <p className="text-slate-500 text-sm">Thanh toán an toàn qua Cổng thanh toán VNPay</p>
                    </div>
                  </label>
                </div>

              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Order Summary (Glassmorphic Receipt) */}
          <div className="lg:w-2/5">
            <div className="sticky top-28 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col">
              
              <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold border-b border-indigo-500/50 pb-2 mb-2">Tóm tắt đơn hàng</h3>
                  <p className="text-indigo-200 text-sm">{cart.items.length} sản phẩm</p>
                </div>
                <Package size={40} className="text-indigo-400 opacity-60" />
              </div>

              {/* Order Items List */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[35vh] space-y-5 custom-scrollbar">
                {cart.items.map(item => {
                  const itemPrice = item?.discount_price ? Number(item.discount_price) : Number(item.price);
                  
                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-20 h-20 rounded-2xl bg-white overflow-hidden shrink-0 shadow-sm border border-slate-200">
                        <img 
                          src={item.image ? `${BACKEND_URL}${item.image}` : 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-indigo-600 text-white rounded-bl-xl flex items-center justify-center text-xs font-bold shadow-sm">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors cursor-pointer">{item.name}</h4>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                          {item.category}
                          {item.variant_id && (
                            <span className="block mt-0.5 normal-case text-slate-400">
                              Size: {item.size} | Màu: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex items-center pl-2">
                        <span className="font-bold text-slate-900">${(itemPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code */}
              <div className="px-6 md:px-8 py-6 border-y border-slate-200/60 bg-white">
                <div className="flex gap-3 relative">
                  <input 
                    type="text" 
                    placeholder="MÃ ƯU ĐÃI KHÁCH HÀNG" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={appliedCoupon !== null}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-24 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900 uppercase disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {!appliedCoupon ? (
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 focus:bg-slate-800 text-white px-5 rounded-lg font-bold transition-colors cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Áp dụng
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => {
                        setAppliedCoupon(null);
                        setDiscountAmount(0);
                        setCouponCode('');
                        setCouponSuccess('');
                      }}
                      className="absolute right-2 top-2 bottom-2 bg-red-100 text-red-600 hover:bg-red-200 px-5 rounded-lg font-bold transition-colors cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Hủy mã
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                {couponSuccess && <p className="text-green-600 text-sm mt-2 font-medium">{couponSuccess}</p>}
              </div>

              {/* Summary Totals */}
              <div className="p-6 md:p-8 space-y-4 bg-white/40">
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>Tạm tính</span>
                  <span className="text-slate-900">${cart.total.toFixed(2)}</span>
                </div>
                {actualDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-medium">
                    <span>Giảm giá {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                    <span>-${actualDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className={SHIPPING_FEE === 0 ? 'text-green-600 font-bold' : 'text-slate-900'}>
                    {SHIPPING_FEE === 0 ? 'Miễn phí' : `+$${SHIPPING_FEE.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="pt-6 mt-2 relative">
                  <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-slate-300"></div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <span className="block text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Tổng thanh toán</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-green-500"/>
                        Bảo mật SSL 256-bit
                      </span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-sm font-bold text-slate-400 mt-2">USD</span>
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 tracking-tight">
                        ${orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button & Footer */}
              <div className="p-6 md:p-8 bg-white border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full relative overflow-hidden group bg-slate-900 text-white rounded-2xl py-4.5 font-bold text-lg transition-all hover:shadow-2xl hover:shadow-indigo-500/30 flex justify-center items-center gap-3 disabled:opacity-70 disabled:shadow-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {isProcessing ? 'Đang xử lý thanh toán...' : (
                      <>
                        Xác nhận đặt hàng
                        <CheckCircle2 size={22} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
                
                <p className="text-center text-xs text-slate-400 font-medium mt-6 leading-relaxed">
                  Bằng việc đặt hàng, bạn đồng ý với <Link to="#" className="text-indigo-600 hover:underline">Điều kiện</Link> và <Link to="#" className="text-indigo-600 hover:underline">Chính sách bảo mật</Link> của chúng tôi.
                </p>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
