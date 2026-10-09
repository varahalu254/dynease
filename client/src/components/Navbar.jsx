import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import iconImage from '../assets/icon.png';

export default function Navbar({ minimal = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`flex justify-between items-center px-4 md:px-8 py-6 w-full relative z-50 bg-[var(--color-background)] ${minimal ? 'border-b border-[var(--color-border)]' : 'border-b border-[var(--color-border)]'}`}>
      <Link to="/" className="text-[28px] font-serif font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
        <img src={iconImage} alt="Dynease Logo" className="w-10 h-10 grayscale opacity-90" />
        Dynease
      </Link>
      
      {minimal ? (
        <Link to="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium tracking-wide uppercase flex items-center gap-2 transition-colors">
          <span className="hidden sm:inline">Back to Home</span> <ArrowRight size={16} />
        </Link>
      ) : (
        <>
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/features" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium tracking-wide uppercase transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium tracking-wide uppercase transition-colors">How It Works</Link>
            <Link to="/pricing" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium tracking-wide uppercase transition-colors">Pricing</Link>
            <Link to="/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium tracking-wide uppercase transition-colors">Login</Link>
            <Link to="/register" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-6 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium tracking-wide uppercase transition-colors">
              Get Started
            </Link>
          </div>

          {/* Mobile menu overlay */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 bg-[var(--color-background)] border-b border-[var(--color-border)] shadow-xl py-6 px-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-2 duration-200">
              <Link to="/features" onClick={() => setIsOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-primary-light)] font-serif text-xl border-b border-[var(--color-border)] pb-4">Features</Link>
              <Link to="/how-it-works" onClick={() => setIsOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-primary-light)] font-serif text-xl border-b border-[var(--color-border)] pb-4">How It Works</Link>
              <Link to="/pricing" onClick={() => setIsOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-primary-light)] font-serif text-xl border-b border-[var(--color-border)] pb-4">Pricing</Link>
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-[var(--color-text)] hover:text-[var(--color-primary-light)] font-serif text-xl border-b border-[var(--color-border)] pb-4">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-center px-6 py-4 rounded-[var(--radius-sm)] font-medium text-sm tracking-wide uppercase transition-colors mt-4">
                Get Started
              </Link>
            </div>
          )}
        </>
      )}
    </nav>
  );
}
