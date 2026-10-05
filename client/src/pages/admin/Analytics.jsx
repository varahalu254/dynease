import { useState, useEffect } from 'react';
import { DollarSign, Store, Users, ShoppingBag, Loader2 } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const stats = [
    { name: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={24} />, color: 'bg-green-500' },
    { name: 'Total Orders', value: data?.totalOrders || 0, icon: <ShoppingBag size={24} />, color: 'bg-blue-500' },
    { name: 'Active Restaurants', value: data?.activeRestaurants || 0, icon: <Store size={24} />, color: 'bg-orange-500' },
    { name: 'Total Users', value: data?.totalUsers || 0, icon: <Users size={24} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Platform Analytics</h2>
        <p className="text-gray-500 mt-1">Overview of your platform's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-lg text-white ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">More charts coming soon</h3>
        <p className="text-gray-500">We are working on adding detailed graphs for revenue over time, top restaurants, and user growth.</p>
      </div>
    </div>
  );
}
