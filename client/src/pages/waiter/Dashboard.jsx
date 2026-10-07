import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bell, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you would get this from auth context/local storage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect to Socket.io
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      // Decode JWT to get user ID and restaurant ID
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
      // Receive new order
      setOrders(prev => [
        {
          id: orderPayload.orderNumber || orderPayload.id,
          table: orderPayload.tableNumber,
          status: orderPayload.status,
          time: new Date(orderPayload.createdAt),
          items: orderPayload.items
        },
        ...prev
      ]);
      
      // Play a notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed', e));
      } catch(e){}
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Waiter Dashboard</h1>
          <p className="text-gray-500 text-sm">Assigned Tables Live View</p>
        </div>
        <div className="flex items-center gap-4">
           <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connected ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
             <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             {connected ? 'Live' : 'Disconnected'}
           </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2"><Bell className="text-orange-500" /> New Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>No new orders yet for your assigned tables.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Table {order.table}</h3>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded text-sm">{order.status}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.quantity}x {item.itemName || item.name}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setOrders(orders.filter((_, i) => i !== idx))}
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Acknowledge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
