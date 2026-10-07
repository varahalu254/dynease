import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const hostname = window.location.hostname;
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    let subdomain = '';
    if (hostname.includes('dynease.in') && hostname !== 'dynease.in' && hostname !== 'www.dynease.in') {
      subdomain = hostname.split('.')[0];
    } else if (hostname.includes('localhost') && hostname !== 'localhost') {
      subdomain = hostname.split('.')[0];
    }
    if (subdomain) headers['x-tenant-subdomain'] = subdomain;
    return headers;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const [meRes, tablesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { headers: getHeaders() }),
          fetch(`${import.meta.env.VITE_API_URL}/restaurant/tables`, { headers: getHeaders() })
        ]);
        
        const meData = await meRes.json();
        const tablesData = await tablesRes.json();
        
        if (meData.success && meData.data.user) {
          const userData = meData.data.user;
          // If assignedTables is just an array of IDs, we map them from the tables endpoint
          if (tablesData.success && tablesData.data.tables) {
            const allTables = tablesData.data.tables;
            userData.assignedTables = (userData.assignedTables || []).map(t => {
              const tableId = typeof t === 'string' ? t : t._id;
              return allTables.find(tbl => tbl._id === tableId) || t;
            });
          }
          setUser(userData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-20 text-red-500">Failed to load profile.</div>;
  }

  const assignedTables = user.assignedTables || [];

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500">View your personal info and assigned tables</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <User size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-800">{user.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-8 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Hash size={20} className="text-orange-500" />
            Assigned Tables
          </h3>
          
          {assignedTables.length === 0 ? (
            <p className="text-gray-500 italic">No tables currently assigned to you.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {assignedTables.map(table => (
                <div key={table._id} className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 font-medium text-gray-700">
                  Table {table.tableNumber} {table.tableName ? `(${table.tableName})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
