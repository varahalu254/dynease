import React from 'react';
import { Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';

export default function Cart() {
  const navigate = useNavigate();
  const { session, cart, cartCount, cartSubtotal, updateQuantity, removeFromCart } = useRestaurant();

  const tableLabel = session?.table?.tableNumber ? `Table ${session.table.tableNumber}` : null;
  const restaurantName = session?.restaurant?.name || 'Restaurant';
  const taxPercent = session?.restaurant?.taxPercent || 0;
  const taxAmount = parseFloat(((cartSubtotal * taxPercent) / 100).toFixed(2));
  const total = parseFloat((cartSubtotal + taxAmount).toFixed(2));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{restaurantName}</h1>
          {tableLabel && <p className="text-xs text-gray-400">{tableLabel}</p>}
        </div>
        {tableLabel && (
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
            {tableLabel}
          </span>
        )}
      </header>

      <main className="flex-1 p-4 pb-36">
        {cart.length > 0 ? (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Your Items</h2>

            {cart.map((item) => (
              <div key={item.menuItemId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 items-start">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${
                      item.dietaryPreference === 'VEG' ? 'bg-green-500' :
                      item.dietaryPreference === 'NON_VEG' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                  </div>
                  <p className="text-orange-600 font-bold text-sm mb-2">₹{item.price}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-50"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-sm text-white hover:bg-orange-600"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bill Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
              <h3 className="font-bold mb-3 text-gray-800">Bill Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total ({cartCount} items)</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Charges ({taxPercent}%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 mt-2 pt-3 flex justify-between font-extrabold text-gray-900 text-base">
                  <span>To Pay</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center mt-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5 text-gray-300">
              <ShoppingBag size={44} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-8">Add items from the menu to get started.</p>
            <Link to="/" className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200">
              Browse Menu
            </Link>
          </div>
        )}
      </main>

      {/* Place Order CTA */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.1)]">
          <Link
            to="/checkout"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-colors"
          >
            Proceed to Checkout <ArrowRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}
