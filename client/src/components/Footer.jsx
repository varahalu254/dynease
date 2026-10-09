import React from 'react';

export default function Footer({ className = "" }) {
  return (
    <footer className={`bg-[var(--color-primary)] text-white py-16 px-4 md:px-8 border-t border-[var(--color-primary-light)] ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="text-3xl font-serif font-bold text-white mb-6 tracking-wide">Dynease</div>
        <p className="text-[var(--color-border)] font-light max-w-md mx-auto mb-6">
          Elevating the dining experience through seamless, digital hospitality solutions.
        </p>
        <div className="w-12 h-px bg-[var(--color-primary-light)] my-6"></div>
        <p className="text-[var(--color-border)] text-sm mb-2">© {new Date().getFullYear()} Dynease. All rights reserved.</p>
        <p className="text-[var(--color-border)] text-sm mb-6">Inquiries: <a href="mailto:contact@dynease.in" className="text-white hover:text-[var(--color-border)] transition-colors underline decoration-[var(--color-primary-light)] underline-offset-4">contact@dynease.in</a></p>
        <p className="text-white text-xs tracking-widest uppercase font-medium mt-4">Designed and developed by Global Solutions</p>
      </div>
    </footer>
  );
}
