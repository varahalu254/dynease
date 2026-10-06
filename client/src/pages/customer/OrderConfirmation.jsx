import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, UtensilsCrossed } from 'lucide-react';
import { getTenantHeaders } from '../../context/RestaurantContext';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/public/orders/${orderId}`, {
          headers: getTenantHeaders()
        });
        const data = await res.json();
        if (data.success) setOrder(data.data.order);
        else setError('Order not found.');
      } catch {
        setError('Network error. Could not load order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center text-white">
          <CheckCircle size={56} className="mx-auto mb-3 drop-shadow-md" />
          <h1 className="text-2xl font-extrabold mb-1">Order Placed! 🎉</h1>
          <p className="text-orange-100 text-sm">Your order has been sent to the kitchen</p>
        </div>

        {/* Order Info */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center bg-orange-50 rounded-2xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Order Number</p>
              <p className="text-xl font-extrabold text-orange-600">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Table</p>
              <p className="text-xl font-extrabold text-gray-900">{order.tableNumber}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">Items Ordered</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.itemName} <span className="text-gray-400">× {item.quantity}</span></span>
                  <span className="font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-extrabold text-gray-900">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <UtensilsCrossed size={20} className="text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Status: {order.status}</p>
              <p className="text-xs text-gray-500">Our team will prepare your order shortly</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              to="/"
              className="flex-1 text-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Order More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
