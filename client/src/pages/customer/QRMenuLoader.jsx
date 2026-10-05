import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function QRMenuLoader() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/public/table/${qrToken}`);
        const data = await res.json();
        
        if (data.success) {
          // Store table and restaurant context for the ordering flow
          localStorage.setItem('currentRestaurant', JSON.stringify(data.data.restaurant));
          localStorage.setItem('currentTable', JSON.stringify(data.data.table));
          
          // Redirect to the customer homepage for this specific restaurant
          // For local development, we use /r/:slug. In production, we'd use subdomains.
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          
          if (isLocalhost) {
            navigate(`/r/${data.data.restaurant.slug}`);
          } else {
            // Redirect to subdomain
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : '';
            window.location.href = `${protocol}//${data.data.restaurant.slug}.dynease.in${port}/t/${data.data.table._id}`;
          }
        } else {
          setError(data.message || 'Invalid QR Code');
        }
      } catch (err) {
        setError('Failed to load menu. Please try again.');
      }
    };

    fetchTableInfo();
  }, [qrToken, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold text-gray-900">Loading Menu...</h2>
      <p className="text-gray-500 mt-2">Setting up your table</p>
    </div>
  );
}
