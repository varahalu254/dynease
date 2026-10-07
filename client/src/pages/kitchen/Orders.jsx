import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Clock, CheckCircle, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockOrders = []; // removed mock data so it starts empty in real app

export default function KitchenOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
        socket.emit('kitchen:join', payload.restaurantId);
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
          id: orderPayload.orderNumber || orderPayload.id,
          table: orderPayload.tableNumber,
          status: orderPayload.status,
          time: new Date(orderPayload.createdAt),
          items: orderPayload.items
        },
        ...prev
      ]);
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log(e));
      } catch(e){}
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const moveOrder = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const renderColumn = (status, title, bgColor, icon) => (
    <div className="flex flex-col flex-1 bg-gray-50 rounded-xl p-4 overflow-hidden h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-gray-200">
        {icon}
        <h2 className="font-bold text-xl text-gray-800">{title}</h2>
        <span className="ml-auto bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-sm font-semibold">
          {orders.filter(o => o.status === status).length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
        {orders.filter(o => o.status === status).map(order => (
          <div key={order.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${bgColor} p-4`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{order.id}</h3>
                <span className="text-gray-500 text-sm">Table {order.table}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-orange-600 font-medium">
                  <Clock size={16} />
                  <span>{Math.floor((Date.now() - order.time) / 60000)}m</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                  <div className="font-medium flex justify-between">
                    <span>{item.qty}x {item.name}</span>
                  </div>
                  {(item.note || item.addons) && (
                    <div className="text-gray-500 mt-1 pl-2 border-l-2 border-gray-300">
                      {item.note && <div className="italic text-xs">Note: {item.note}</div>}
                      {item.addons && <div className="text-xs">Add: {item.addons?.join(', ')}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              {status === 'NEW' && (
                <button 
                  onClick={() => moveOrder(order.id, 'PREPARING')}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Accept & Prepare
                </button>
              )}
              {status === 'PREPARING' && (
                <button 
                  onClick={() => moveOrder(order.id, 'READY')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Mark Ready
                </button>
              )}
              {status === 'READY' && (
                <button 
                  onClick={() => moveOrder(order.id, 'SERVED')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                >
                  Mark Served
                </button>
              )}
            </div>
          </div>
        ))}
        
        {orders.filter(o => o.status === status).length === 0 && (
          <div className="text-center text-gray-400 py-10">
            No orders here
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Display System</h1>
          <p className="text-gray-500 text-sm">Paradise Biryani</p>
        </div>
        <div className="flex items-center gap-4">
           <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connected ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
             <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             {connected ? 'Live' : 'Disconnected'}
           </span>
        </div>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {renderColumn('NEW', 'New Orders', 'border-blue-500', <Clock className="text-blue-500" />)}
        {renderColumn('PREPARING', 'Preparing', 'border-orange-500', <ChefHat className="text-orange-500" />)}
        {renderColumn('READY', 'Ready', 'border-green-500', <CheckCircle className="text-green-500" />)}
      </div>
    </div>
  );
}
