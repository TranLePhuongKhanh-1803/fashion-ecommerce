import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../config/config';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Mail, Trash2, Eye } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'staff')) {
      navigate('/');
      return;
    }

    fetch(`${BACKEND_URL}/api/users`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Add mock classification for display
          const processed = data.data.map(c => ({
            ...c,
            classification: c.id <= 3 ? 'loyal' : 'new'
          }));
          setCustomers(processed);
        }
      })
      .catch(err => console.error("Failed to fetch customers"));
  }, [isAuthenticated, user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(customers.filter(c => c.id !== id));
      } else {
        alert(data.message || 'Error deleting customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting customer');
    }
  };

  const sendPromo = async (id, name) => {
    if (!window.confirm(`Send marketing promotion to ${name}?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${id}/promo`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Promotion sent successfully to ${data.data.sentTo}!`);
      } else {
        alert(data.message || 'Error sending promo');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending promo');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (filterType === 'all' || c.classification === filterType) &&
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-6 py-8 md:max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your customer base and marketing.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-11 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white shadow-sm placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="all">All Customers</option>
            <option value="new">New Customers</option>
            <option value="loyal">Loyal Customers</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                    {c.phone && <p className="text-xs text-slate-400 mt-0.5">{c.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {c.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.classification === 'loyal' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {c.classification === 'loyal' ? '⭐ Loyal' : '👋 New'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => sendPromo(c.id, c.name)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Send Promo"
                        >
                          <Mail size={16} />
                        </button>
                      )}
                      
                      <Link
                        to={`/staff/customers/${c.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>

                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Customer"
                          disabled={c.role === 'admin'}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <Users size={32} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">No customers found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
