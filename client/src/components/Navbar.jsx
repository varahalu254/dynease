import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import iconImage from '../assets/icon.png';

export default function Navbar({ minimal = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`flex justify-between items-center px-4 md:px-8 py-6 w-full relative z-50 ${minimal ? 'border-b border-gray-100' : ''}`}>
      <Link to="/" className="text-[35px] font-bold text-orange-600 tracking-tight flex items-center gap-2">
        <img src={iconImage} alt="Dynease Logo" className="w-12 h-12" />
        Dynease
      </Link>
      
      {minimal ? (
        <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors">
          <span className="hidden sm:inline">Back to Home</span> <ArrowRight size={18} />
        </Link>
      ) : (
        <>
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">How It Works</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm shadow-orange-200">
              Get Started
            </Link>
          </div>

          {/* Mobile menu overlay */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl py-4 px-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-2 duration-200">
              <Link to="/features" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-orange-600 font-bold text-lg p-2 border-b border-gray-50">Features</Link>
              <Link to="/how-it-works" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-orange-600 font-bold text-lg p-2 border-b border-gray-50">How It Works</Link>
              <Link to="/pricing" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-orange-600 font-bold text-lg p-2 border-b border-gray-50">Pricing</Link>
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-orange-600 font-bold text-lg p-2 border-b border-gray-50">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-orange-600 hover:bg-orange-700 text-white text-center px-5 py-3.5 rounded-xl font-bold text-lg transition-all mt-2">
                Get Started
              </Link>
            </div>
          )}
        </>
      )}
    </nav>
  );
}
