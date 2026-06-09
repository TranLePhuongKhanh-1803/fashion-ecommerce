import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config/config';
import { orderAPI } from '../services/api';
import { Package, Clock, CheckCircle, XCircle, Truck, RefreshCw, Trash2 } from 'lucide-react';

const UserOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/user/orders`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        const res = await orderAPI.cancelOrder(orderId);
        if (res.success) {
          alert('Hủy đơn hàng thành công!');
          // Cập nhật lại danh sách đơn hàng mà không cần reload trang
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId ? { ...order, status: 'cancelled' } : order
            )
          );
        } else {
          alert(res.message || 'Có lỗi xảy ra khi hủy đơn hàng.');
        }
      } catch (err) {
        console.error('Lỗi khi hủy đơn hàng:', err);
        alert(err.message || 'Có lỗi xảy ra khi hủy đơn.');
      }
    }
  };

  const [uploadingId, setUploadingId] = useState(null);

  const handleUploadReceipt = async (orderId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Vui lòng chọn file ảnh (JPG, JPEG, PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingId(orderId);
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/receipt`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Tải lên biên lai thành công! Chúng tôi sẽ kiểm tra và cập nhật sớm nhất.');
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, receipt_image: data.data.receipt_image } : order
          )
        );
      } else {
        alert(data.message || 'Lỗi khi tải lên biên lai.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending': return { label: 'Chờ xử lý', color: 'text-amber-600', bg: 'bg-amber-100/50', icon: Clock };
      case 'processing': return { label: 'Đang chuẩn bị', color: 'text-blue-600', bg: 'bg-blue-100/50', icon: RefreshCw };
      case 'shipped': return { label: 'Đang giao hàng', color: 'text-indigo-600', bg: 'bg-indigo-100/50', icon: Truck };
      case 'delivered': return { label: 'Đã giao', color: 'text-emerald-600', bg: 'bg-emerald-100/50', icon: CheckCircle };
      case 'cancelled': return { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100/50', icon: XCircle };
      default: return { label: status, color: 'text-slate-600', bg: 'bg-slate-100', icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Đơn hàng của tôi</h1>
        <p className="text-slate-500 mb-8">Theo dõi và quản lý lịch sử mua hàng của bạn</p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/60 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa có đơn hàng nào</h2>
            <p className="text-slate-500 mb-8">Hãy khám phá các sản phẩm và đặt đơn hàng đầu tiên nhé!</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-primary-black rounded-lg hover:bg-slate-800 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="border-b border-slate-100 bg-slate-50/50 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-slate-900">#{order.order_number}</span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Đặt ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 mb-1">Tổng tiền</p>
                        <p className="font-bold text-xl text-blue-600">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Sản phẩm</h3>
                    <div className="space-y-4">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            <img src={item.product_image ? (item.product_image.startsWith('http') ? item.product_image : `${BACKEND_URL}${item.product_image}`) : 'https://via.placeholder.com/150'} alt={item.product_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 line-clamp-1">{item.product_name}</p>
                            <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="font-medium text-slate-900">
                            ${parseFloat(item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bank Transfer Instructions */}
                  {order.payment_method === 'bank_transfer' && order.payment_status === 'pending' && order.status !== 'cancelled' && (
                    <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng</p>
                          <p className="text-sm text-blue-800 mb-2">Thông tin chuyển khoản:</p>
                          <ul className="text-sm text-blue-800 space-y-1 mb-2">
                            <li>Ngân hàng: <span className="font-bold">Vietcombank</span></li>
                            <li>Chủ tài khoản: <span className="font-bold">NGUYEN VAN A</span></li>
                            <li>Số tài khoản: <span className="font-bold">1234567890</span></li>
                            <li>Số tiền: <span className="font-bold text-red-600">${parseFloat(order.total_amount).toFixed(2)}</span></li>
                          </ul>
                          <p className="text-sm font-semibold text-blue-900 mb-4">
                            Nội dung chuyển khoản: <span className="text-red-600 tracking-wider bg-white px-2 py-0.5 rounded border border-blue-200">{order.order_number}</span>
                          </p>

                          {!order.receipt_image ? (
                            <div className="mt-4">
                              <label htmlFor={`receipt-upload-${order.id}`} className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors">
                                {uploadingId === order.id ? 'Đang tải lên...' : 'Tôi đã chuyển khoản'}
                              </label>
                              <input 
                                type="file" 
                                id={`receipt-upload-${order.id}`} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => handleUploadReceipt(order.id, e)}
                                disabled={uploadingId === order.id}
                              />
                            </div>
                          ) : (
                            <div className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 font-medium text-sm rounded-xl border border-emerald-200">
                              <CheckCircle size={18} className="mr-2" />
                              Đã tải lên biên lai (Chờ duyệt)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Footer Stats / Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500">
                      Thanh toán: {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : (order.payment_method === 'bank_transfer' ? 'Chuyển khoản Ngân hàng' : 'Thanh toán qua VNPay')}
                      {order.payment_method !== 'cod' && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                          order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                          order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.payment_status === 'paid' ? 'Đã thanh toán' : 
                           order.payment_status === 'failed' ? 'Thanh toán thất bại' : 'Chưa thanh toán'}
                        </span>
                      )}
                    </span>
                    <div className="flex gap-4">
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="font-medium flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                          Hủy đơn hàng
                        </button>
                      )}
                      <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-700">
                        Cần hỗ trợ?
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
