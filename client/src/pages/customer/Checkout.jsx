import React, { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant, getTenantHeaders } from '../../context/RestaurantContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { session, cart, cartSubtotal, clearCart, addOrderId } = useRestaurant();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const taxPercent = session?.restaurant?.taxPercent || 0;
  const taxAmount = parseFloat(((cartSubtotal * taxPercent) / 100).toFixed(2));
  const total = parseFloat((cartSubtotal + taxAmount).toFixed(2));

  // Guard: must have session
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No active session</h2>
        <p className="text-gray-500 mb-4">Please scan a table QR code to start ordering.</p>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);
    try {
      const body = {
        tableId: session.table.id,
        customerName: name.trim() || 'Guest',
        customerPhone: phone.trim() || undefined,
        items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/public/orders`, {
        method: 'POST',
        headers: getTenantHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        clearCart();
        addOrderId(data.data.order.id);
        navigate(`/order/${data.data.order.id}`, { state: { order: data.data.order } });
      } else {
        setError(data.message || 'Failed to place order. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl flex flex-col pb-28">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          <p className="text-xs text-gray-400">{session.restaurant.name} · Table {session.table.tableNumber}</p>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">Order Summary</h2>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>
            {taxPercent > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Tax ({taxPercent}%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-gray-900 text-base pt-1">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Contact Info (Optional) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">Your Details <span className="text-xs text-gray-400 font-normal">(optional)</span></h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Place Order CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 shadow-xl">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-colors"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Placing Order…</>
          ) : (
            <><CheckCircle size={20} /> Place Order · ₹{total.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  );
}
