import React, { useState } from 'react';
import { Star, CheckCircle, ArrowLeft, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import CustomerSidebar from '../../components/customer/CustomerSidebar';

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const { session } = useRestaurant();
  const restaurantName = session?.restaurant?.name || 'Restaurant';
  const tableLabel = session?.table?.tableNumber ? `Table ${session.table.tableNumber}` : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 max-w-md mx-auto shadow-2xl relative">
        <CheckCircle size={64} className="text-green-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 text-center mb-8">Your feedback helps us improve our service.</p>
        <button onClick={() => navigate(-1)} className="text-orange-600 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl relative">
      {/* ── Header ── */}
      <header className="bg-white px-4 py-4 sticky top-0 z-20 shadow-sm flex items-center border-b border-gray-100 gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors">
          <MenuIcon size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900">Feedback</h1>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate your experience</h2>
          <p className="text-gray-500 mb-8">How was your food at {restaurantName}?</p>

        <div className="flex justify-center gap-2 mb-8">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                type="button"
                key={starValue}
                className={`text-4xl transition-colors ${starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(rating)}
              >
                <Star className="fill-current" size={40} />
              </button>
            );
          })}
        </div>

        <textarea 
          placeholder="Tell us what you loved or what we can improve..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm mb-6 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[120px]"
        ></textarea>

        <button 
          onClick={() => setSubmitted(true)}
          disabled={!rating}
          className="w-full bg-orange-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition-colors"
        >
          Submit Feedback
        </button>
      </div>
      </div>

      <CustomerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        tableLabel={tableLabel} 
      />
    </div>
  );
}
