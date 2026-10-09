import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';

export default function RestaurantDashboard() {
  const [restaurantName, setRestaurantName] = useState('Loading...');
  const [stats, setStats] = useState({ todaysOrders: 0, revenue: 0, activeTables: 0 });
  const [subscription, setSubscription] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const currentHostname = window.location.hostname;
        let subdomain = '';
        if (currentHostname.includes('localhost') && currentHostname !== 'localhost') {
          subdomain = currentHostname.split('.')[0];
        } else if (currentHostname.includes('dynease.in') && currentHostname !== 'dynease.in') {
          subdomain = currentHostname.split('.')[0];
        }
        if (subdomain) headers['x-tenant-subdomain'] = subdomain;

        // Fetch User
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { headers });
        const userData = await userRes.json();
        if (userData.success && userData.data.user.restaurantId) {
          setRestaurantName(userData.data.user.restaurantId.name);
        }

        // Fetch Stats
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/stats`, { headers });
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        // Fetch Subscription
        const subRes = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/subscription`, { headers });
        const subData = await subRes.json();
        if (subData.success) {
          setSubscription(subData.data);
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const currentHostname = window.location.hostname;
      let subdomain = '';
      if (currentHostname.includes('localhost') && currentHostname !== 'localhost') {
        subdomain = currentHostname.split('.')[0];
      } else if (currentHostname.includes('dynease.in') && currentHostname !== 'dynease.in') {
        subdomain = currentHostname.split('.')[0];
      }
      if (subdomain) headers['x-tenant-subdomain'] = subdomain;

      // Renew logic (In production, open payment gateway here)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/subscription/renew`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan: subscription.plan === 'FREE' ? 'GROWTH' : subscription.plan,
          amount: subscription.plan === 'FREE' ? 999 : 1999, // Mock
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Subscription renewed successfully!');
        window.location.reload();
      } else {
        alert(data.message || 'Failed to renew');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process renewal');
    } finally {
      setIsRenewing(false);
    }
  };

  const getSubAlert = () => {
    if (!subscription) return null;
    const { status, remainingDays, plan } = subscription;

    if (status === 'EXPIRED') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 mb-6">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Subscription Expired</h4>
            <p className="text-sm">Your subscription has expired. Your public restaurant menu and new orders are disabled. Renew your plan to restore access.</p>
          </div>
        </div>
      );
    }
    if (remainingDays === 1) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 mb-6">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Subscription Expiring Tomorrow!</h4>
            <p className="text-sm">Your subscription expires tomorrow. Renew your plan to avoid interruption.</p>
          </div>
        </div>
      );
    }
    if (remainingDays <= 3) {
      return (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-start gap-3 mb-6">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Subscription Expires Soon</h4>
            <p className="text-sm">Your subscription expires in {remainingDays} days. Renew now to continue accepting orders.</p>
          </div>
        </div>
      );
    }
    if (status === 'TRIAL') {
      return (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3 mb-6">
          <Clock className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Free Trial Active</h4>
            <p className="text-sm">Your Free Trial is active. {remainingDays} days remaining.</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalDays = subscription?.status === 'TRIAL' ? 14 : 30;
  const progressPercent = subscription ? Math.min(100, Math.max(0, (subscription.remainingDays / totalDays) * 100)) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to {restaurantName}</h1>
      
      {getSubAlert()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-32">
          <p className="text-gray-500 font-medium">Today's Orders</p>
          <h3 className="text-4xl font-bold text-orange-600 mt-2">{stats.todaysOrders}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-32">
          <p className="text-gray-500 font-medium">Revenue</p>
          <h3 className="text-4xl font-bold text-green-600 mt-2">₹{stats.revenue}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-32">
          <p className="text-gray-500 font-medium">Active Tables</p>
          <h3 className="text-4xl font-bold text-blue-600 mt-2">{stats.activeTables}</h3>
        </div>
      </div>

      {subscription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="text-slate-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Subscription & Billing</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
              subscription.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {subscription.status}
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900 mb-6">{subscription.plan}</p>
                
                <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                <p className="text-lg font-medium text-gray-800 mb-6">
                  {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-gray-700 text-lg">{subscription.remainingDays} Days Remaining</span>
                  <span className="text-sm text-gray-500">out of {totalDays}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className={`h-3 rounded-full ${
                      subscription.remainingDays <= 3 ? 'bg-red-500' :
                      subscription.remainingDays <= 7 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleRenew}
                    disabled={isRenewing}
                    className="flex-1 bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {isRenewing ? 'Processing...' : (subscription.plan === 'FREE' ? 'Upgrade to Paid Plan' : 'Renew Subscription')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
