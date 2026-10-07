import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, UtensilsCrossed, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant, getTenantHeaders } from '../../context/RestaurantContext';

export default function Orders() {
  const navigate = useNavigate();
  const { session, myOrders } = useRestaurant();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || myOrders.length === 0) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const promises = myOrders.map(orderId => 
          fetch(`${import.meta.env.VITE_API_URL}/public/orders/${orderId}`, {
            headers: getTenantHeaders()
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);
        const fetchedOrders = results
          .filter(r => r.success && r.data && r.data.order)
          .map(r => r.data.order)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
        setOrdersData(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Optional: Refresh every 10 seconds to get status updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [session, myOrders]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No active session</h2>
        <p className="text-gray-500 mb-4">Please scan a table QR code to start ordering.</p>
        <button onClick={() => navigate('/')} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-medium">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-400">{session.restaurant.name} · Table {session.table.tableNumber}</p>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20 text-orange-500">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : ordersData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
            <UtensilsCrossed size={48} className="mx-auto mb-3 text-gray-300" />
            <h2 className="text-lg font-bold text-gray-800 mb-1">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-4">You haven't placed any orders in this session.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-orange-100 text-orange-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-200 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {ordersData.map((order, idx) => (
              <div key={order._id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Order Number</span>
                    <p className="font-bold text-gray-800">{order.orderNumber || order.id?.substring(0,8)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'COMPLETED' || order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Items</h3>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x <span className="font-medium text-gray-900">{item.itemName}</span>
                      </span>
                      <span className="font-semibold text-gray-600">₹{(item.subtotal || (item.price * item.quantity) || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                  <span className="font-extrabold text-lg text-gray-900">₹{(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
