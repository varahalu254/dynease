import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerSidebar({ isOpen, onClose, tableLabel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-start">
      <div className="w-64 bg-white h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-extrabold text-gray-900 text-lg">Menu</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1">
          <Link to="/" onClick={onClose} className="block text-gray-700 font-bold hover:text-orange-600 transition-colors">Home / Menu</Link>
          <Link to="/cart" onClick={onClose} className="block text-gray-700 font-bold hover:text-orange-600 transition-colors">Your Cart</Link>
          <Link to="/feedback" onClick={onClose} className="block text-gray-700 font-bold hover:text-orange-600 transition-colors">Leave Feedback</Link>
        </div>
        {tableLabel && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 font-semibold mb-1">Currently at</div>
            <div className="font-bold text-gray-800">{tableLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
}
