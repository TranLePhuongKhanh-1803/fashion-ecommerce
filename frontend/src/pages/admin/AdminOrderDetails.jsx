import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../config/config';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MapPin, CreditCard, User } from 'lucide-react';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'staff')) {
      navigate('/');
      return;
    }

    fetch(`${BACKEND_URL}/api/orders/${id}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data);
        } else {
          alert('Order not found');
          navigate('/admin/orders');
        }
      })
      .catch(() => alert('Error loading order'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, user, navigate]);

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, status: newStatus });
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const updatePaymentStatus = async (newStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ payment_status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, payment_status: newStatus });
      } else {
        alert(data.message || 'Error updating payment status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating payment status');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading order details...</div>;
  if (!order) return null;

  return (
    <div className="container mx-auto px-6 py-8 md:max-w-4xl">
      <Link to={user?.role === 'admin' ? '/admin/orders' : '/staff/orders'} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Orders
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order #{order.order_number || order.id.toString().padStart(6, '0')}</h1>
          <p className="text-sm text-slate-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">Update Status:</span>
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">Payment:</span>
          <select
            value={order.payment_status || 'pending'}
            onChange={(e) => updatePaymentStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
        <h3 className="font-semibold text-slate-900 mb-4 text-lg">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-medium text-slate-900 capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                 order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
                 order.payment_method === 'vnpay' ? 'VNPay' : order.payment_method}
              </span>
            </div>
            {order.transaction_id && (
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-medium font-mono text-slate-900 bg-slate-50 px-2 rounded border">{order.transaction_id}</span>
              </div>
            )}
            {order.paid_at && (
              <div className="flex justify-between">
                <span className="text-slate-500">Paid At:</span>
                <span className="font-medium text-slate-900">{new Date(order.paid_at).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {order.receipt_image && (
            <div>
              <span className="text-slate-500 text-sm block mb-2">Customer Receipt:</span>
              <a href={`${BACKEND_URL}${order.receipt_image}`} target="_blank" rel="noopener noreferrer" className="block">
                <img src={`${BACKEND_URL}${order.receipt_image}`} alt="Receipt" className="h-32 object-contain border rounded-xl bg-slate-50 hover:opacity-90 transition-opacity" />
              </a>
              <p className="text-xs text-slate-400 mt-1">Click to view full size</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">Customer</h3>
          </div>
          <p className="text-sm font-medium text-slate-800">{order.customer_name}</p>
          <p className="text-sm text-slate-500 mt-1">{order.customer_email}</p>
          <p className="text-sm text-slate-500 mt-1">{order.customer_phone || 'No phone provided'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <MapPin size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">Shipping</h3>
          </div>
          <p className="text-sm text-slate-600 whitespace-pre-line">{order.shipping_address || 'No shipping address provided'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard size={20} />
            </div>
            <h3 className="font-semibold text-slate-900">Payment</h3>
          </div>
          <p className="text-sm text-slate-600 capitalize">Method: {order.payment_method || 'N/A'}</p>
          <p className="text-sm text-slate-600 capitalize">Status: <span className={order.payment_status === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>{order.payment_status || 'Pending'}</span></p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900">Order Items</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items?.map(item => (
            <div key={item.id} className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                  <img src={item.product_image ? `${BACKEND_URL}${item.product_image}` : 'https://via.placeholder.com/150'} alt={item.product_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium text-slate-900">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-slate-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-slate-900">${parseFloat(order.total_amount).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
