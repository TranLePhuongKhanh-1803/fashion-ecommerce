import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../config/config';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';

const AdminCustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || (currentUser?.role !== 'admin' && currentUser?.role !== 'staff')) {
      navigate('/');
      return;
    }

    fetch(`${BACKEND_URL}/api/users/${id}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCustomer(data.data);
        } else {
          alert('Customer not found');
          navigate('/admin/customers');
        }
      })
      .catch(() => alert('Error loading customer details'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, currentUser, navigate]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading customer details...</div>;
  if (!customer) return null;

  return (
    <div className="container mx-auto px-6 py-8 md:max-w-5xl">
      <Link to={currentUser?.role === 'admin' ? '/admin/customers' : '/staff/customers'} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Customers
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold shadow-sm text-lg">
          Total Spent: ${parseFloat(customer.total_spent || 0).toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><User size={18} className="text-blue-500"/> Personal Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400" /> {customer.email}
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} className="text-slate-400" /> {customer.phone || 'Not provided'}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-purple-500"/> Default Address</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">{customer.address || 'No address saved.'}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <ShoppingBag size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-900">Purchase History ({customer.orders?.length || 0} orders)</h3>
            </div>
            
            {customer.orders && customer.orders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {customer.orders.map(order => (
                  <div key={order.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <Link to={`${currentUser?.role === 'admin' ? '/admin' : '/staff'}/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                        Order #{order.order_number || order.id.toString().padStart(6, '0')}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className="text-slate-900">${parseFloat(order.total_amount).toFixed(2)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                <ShoppingBag size={32} className="text-slate-300 mb-3" />
                <p>This customer hasn't placed any orders yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetails;
