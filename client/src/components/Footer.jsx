import React from 'react';

export default function Footer({ className = "" }) {
  return (
    <footer className={`bg-gray-900 text-white py-12 px-8 text-center ${className}`}>
      <div className="text-2xl font-bold text-orange-500 mb-4">Dynease</div>
      <p className="text-gray-400">© {new Date().getFullYear()} Dynease. All rights reserved.</p>
    </footer>
  );
}
