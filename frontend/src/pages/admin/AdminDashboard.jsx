import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState({
    stats: { revenue: 0, orders: 0, productsSold: 0 },
    revenueChart: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'staff')) {
      navigate('/');
      return;
    }

    fetch(`${BACKEND_URL}/api/analytics`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
      })
      .catch(err => console.error("Error fetching analytics", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-6 py-8 md:max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name || 'Admin'}! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl relative overflow-hidden">
            <DollarSign size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-emerald-100 opacity-50 blur-xl"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">${data.stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl relative overflow-hidden">
            <ShoppingBag size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-blue-100 opacity-50 blur-xl"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Orders</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{data.stats.orders.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl relative overflow-hidden">
            <Package size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-purple-100 opacity-50 blur-xl"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Products Sold</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{data.stats.productsSold.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900">Revenue Overview</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Top Selling Products</h2>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    #{idx + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                </div>
                <div className="text-sm font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {product.sold} <span className="text-xs font-normal text-slate-500">sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
