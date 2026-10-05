import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import iconImage from '../assets/icon.png';

export default function Navbar({ minimal = false }) {
  return (
    <nav className={`flex justify-between items-center px-8 py-6 max-w-7xl mx-auto ${minimal ? 'border-b border-gray-100' : ''}`}>
      <Link to="/" className="text-2xl font-bold text-orange-600 tracking-tight flex items-center gap-2">
        <img src={iconImage} alt="Dynease Logo" className="w-8 h-8" />
        Dynease
      </Link>
      
      {minimal ? (
        <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors">
          Back to Home <ArrowRight size={18} />
        </Link>
      ) : (
        <div className="flex gap-6 items-center">
          <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Login</Link>
          <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm shadow-orange-200">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
