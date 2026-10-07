import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Clock, CheckCircle, Search, Filter } from 'lucide-react';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('LIVE'); // 'LIVE' or 'PAST'
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchOrders();

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Restaurant owner/staff can join the restaurant room to get all updates
        socket.emit('restaurant:join', payload.restaurantId);
        // Also join waiter room just in case
        socket.emit('waiter:join', { restaurantId: payload.restaurantId, waiterId: payload.id });
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('new_order', (orderPayload) => {
      setOrders(prev => [
        {
          ...orderPayload,
          id: orderPayload.id || orderPayload._id,
        },
        ...prev
      ]);
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed', e));
      } catch(e){}
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder._id || o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/orders`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        // Map backend _id to id if necessary
        const mappedOrders = data.data.orders.map(o => ({ ...o, id: o._id }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Live orders are anything not COMPLETED or CANCELLED
  const liveOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'PAID'].includes(o.status));
  const pastOrders = orders.filter(o => ['COMPLETED', 'CANCELLED', 'PAID'].includes(o.status));

  const displayOrders = (activeTab === 'LIVE' ? liveOrders : pastOrders).filter(o => {
    const searchString = `${o.orderNumber} ${o.tableNumber} ${o.customerName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            View live and past orders
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${connected ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              {connected ? 'Real-time active' : 'Offline'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-4 font-medium text-center transition-colors ${activeTab === 'LIVE' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('LIVE')}
          >
            Live Orders ({liveOrders.length})
          </button>
          <button
            className={`flex-1 py-4 font-medium text-center transition-colors ${activeTab === 'PAST' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('PAST')}
          >
            Past Orders ({pastOrders.length})
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No orders found for the selected category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Table</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{order.orderNumber || order.id?.substring(0,8)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-600">Table {order.tableNumber}</td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {order.items?.map(i => `${i.quantity || i.qty}x ${i.itemName || i.name}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">₹{order.total}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'PENDING' || order.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'READY' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'SERVED' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'COMPLETED' || order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {activeTab === 'LIVE' && (
                          <div className="flex justify-end gap-2">
                            {order.status !== 'COMPLETED' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Complete
                                </button>
                            )}
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              className="text-red-600 hover:text-red-800 text-sm font-medium ml-3"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {activeTab === 'PAST' && (
                          <span className="text-gray-400 text-sm">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
