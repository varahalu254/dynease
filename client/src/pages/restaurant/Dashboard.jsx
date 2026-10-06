import React, { useState, useEffect } from 'react';

export default function RestaurantDashboard() {
  const [restaurantName, setRestaurantName] = useState('Loading...');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const currentHostname = window.location.hostname;
        let subdomain = '';
        if (currentHostname.includes('localhost') && currentHostname !== 'localhost') {
          subdomain = currentHostname.split('.')[0];
        } else if (currentHostname.includes('dynease.in') && currentHostname !== 'dynease.in') {
          subdomain = currentHostname.split('.')[0];
        }

        const headers = { 
          'Authorization': `Bearer ${token}` 
        };
        if (subdomain) {
          headers['x-tenant-subdomain'] = subdomain;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers
        });
        const data = await res.json();
        if (data.success && data.data.user.restaurantId) {
          setRestaurantName(data.data.user.restaurantId.name);
        } else {
          setRestaurantName('Your Restaurant Dashboard');
        }
      } catch (err) {
        console.error(err);
        setRestaurantName('Dashboard');
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to {restaurantName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-32">
          <p className="text-gray-500 font-medium">Today's Orders</p>
          <h3 className="text-4xl font-bold text-orange-600 mt-2">0</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-32">
          <p className="text-gray-500 font-medium">Revenue</p>
          <h3 className="text-4xl font-bold text-green-600 mt-2">₹0</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-32">
          <p className="text-gray-500 font-medium">Active Tables</p>
          <h3 className="text-4xl font-bold text-blue-600 mt-2">0</h3>
        </div>
      </div>
    </div>
  );
}
