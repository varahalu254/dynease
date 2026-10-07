import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveOrders() {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [assignedTableIds, setAssignedTableIds] = useState([]);
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

    // Fetch initial live orders and assigned tables
    const fetchData = async () => {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { headers: getHeaders() }),
          fetch(`${import.meta.env.VITE_API_URL}/restaurant/orders`, { headers: getHeaders() }) // This works because waiters are RESTAURANT_STAFF
        ]);
        
        const meData = await meRes.json();
        let assignedTables = [];
        if (meData.success && meData.data.user) {
          assignedTables = meData.data.user.assignedTables || [];
          setAssignedTableIds(assignedTables.map(t => t._id));
        }

        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          // Filter out past orders and those not belonging to assigned tables
          const activeOrders = ordersData.data.orders.filter(o => 
            !['COMPLETED', 'CANCELLED', 'PAID'].includes(o.status)
          );
          setOrders(activeOrders.map(o => ({ ...o, id: o._id })));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();

    // Auto-refresh orders every 10 seconds as a fallback for socket
    const pollInterval = setInterval(fetchData, 10000);

    // Connect to Socket.io
    const socketUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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
      setOrders(prev => {
        // If it became completed/cancelled, we might want to remove it from Live Orders
        if (['COMPLETED', 'CANCELLED', 'PAID'].includes(updatedOrder.status)) {
          return prev.filter(o => o.id !== updatedOrder._id && o._id !== updatedOrder._id);
        }
        // Otherwise update it in place or add it
        const exists = prev.find(o => o.id === updatedOrder._id || o._id === updatedOrder._id);
        if (exists) {
          return prev.map(o => o.id === updatedOrder._id || o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o);
        } else {
          return [{...updatedOrder, id: updatedOrder._id}, ...prev];
        }
      });
    });

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, [navigate]);

  // Filter orders by assigned tables if the waiter has any tables assigned.
  // If no tables are assigned, they might see all orders (or none, depending on policy). Let's show all if none assigned, or only assigned if some are.
  const filteredOrders = assignedTableIds.length > 0 
    ? orders.filter(o => assignedTableIds.includes(o.tableId))
    : orders;

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Orders</h1>
          <p className="text-gray-500 text-sm">Active orders for your assigned tables</p>
        </div>
        <div className="flex items-center gap-4">
           <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connected ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
             <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             {connected ? 'Live' : 'Disconnected'}
           </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active orders yet for your assigned tables.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500 flex flex-col">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Table {order.tableNumber || order.table}</h3>
                    <p className="text-sm text-gray-500">{order.orderNumber || order.id?.substring(0,8)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded text-sm">{order.status}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 flex-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.quantity || item.qty}x {item.itemName || item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
