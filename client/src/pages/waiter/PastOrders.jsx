import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PastOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

    const fetchData = async () => {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { headers: getHeaders() }),
          fetch(`${import.meta.env.VITE_API_URL}/restaurant/orders`, { headers: getHeaders() })
        ]);
        
        const meData = await meRes.json();
        let assignedTables = [];
        if (meData.success && meData.data.user) {
          assignedTables = meData.data.user.assignedTables || [];
          setAssignedTableIds(assignedTables.map(t => t._id));
        }

        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          // Filter only past orders
          const pastOrdersList = ordersData.data.orders.filter(o => 
            ['COMPLETED', 'CANCELLED', 'PAID'].includes(o.status)
          );
          setOrders(pastOrdersList.map(o => ({ ...o, id: o._id })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredOrders = assignedTableIds.length > 0 
    ? orders.filter(o => assignedTableIds.includes(o.tableId))
    : orders;

  return (
    <div className="flex flex-col h-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Past Orders</h1>
        <p className="text-gray-500 text-sm">Completed and cancelled orders for your tables</p>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No past orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-gray-400 flex flex-col">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Table {order.tableNumber || order.table}</h3>
                    <p className="text-sm text-gray-500">{order.orderNumber || order.id?.substring(0,8)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold px-2 py-1 rounded text-sm ${
                      order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 flex-1 opacity-75">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.quantity || item.qty}x {item.itemName || item.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-gray-400 text-right mt-2">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
