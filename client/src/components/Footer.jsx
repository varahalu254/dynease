import React from 'react';

export default function Footer({ className = "" }) {
  return (
    <footer className={`bg-gray-900 text-white py-12 px-8 text-center ${className}`}>
      <div className="text-2xl font-bold text-orange-500 mb-4">Dynease</div>
      <p className="text-gray-400">© {new Date().getFullYear()} Dynease. All rights reserved.</p>
      <p className="text-white text-[20px] font-bold mt-4">Designed and developed by <a href="https://thewebgenixx.in/ ">webgenixx ❤️</a></p>
    </footer>
  );
}
