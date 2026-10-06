import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, QrCode, RefreshCw } from 'lucide-react';
import { useRestaurant, getTenantHeaders } from '../../context/RestaurantContext';

export default function QRMenuLoader() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const { saveSession } = useRestaurant();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [tableInfo, setTableInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const resolveQR = async () => {
      setStatus('loading');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/public/qr/${qrToken}`,
          { headers: getTenantHeaders() }
        );
        const data = await res.json();

        if (cancelled) return;

        if (data.success) {
          const { restaurant, table, session } = data.data;
          saveSession(restaurant, table, session.qrToken);
          setTableInfo({ restaurant, table });
          setStatus('success');
          // Show brief confirmation, then go to menu
          setTimeout(() => {
            if (!cancelled) navigate('/', { replace: true });
          }, 1800);
        } else {
          setErrorMsg(data.message || 'Invalid or inactive QR code.');
          setStatus('error');
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('Network error. Please check your connection.');
          setStatus('error');
        }
      }
    };

    resolveQR();
    return () => { cancelled = true; };
  }, [qrToken]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-xs w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="text-orange-500" size={36} />
          </div>
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Scanning Table</h2>
          <p className="text-gray-500 text-sm">Setting up your session…</p>
        </div>
      </div>
    );
  }

  if (status === 'success' && tableInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-xs w-full">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{tableInfo.restaurant.name}</h2>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 font-semibold px-4 py-2 rounded-full text-sm mt-2 mb-4">
            Table {tableInfo.table.tableNumber}
          </div>
          <p className="text-green-600 font-medium text-sm">
            ✓ You're ordering from Table {tableInfo.table.tableNumber}
          </p>
          <p className="text-gray-400 text-xs mt-3">Loading menu…</p>
        </div>
      </div>
    );
  }

  // error state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-xs w-full border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="text-red-400" size={36} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
        <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          <RefreshCw size={18} /> Try Again
        </button>
      </div>
    </div>
  );
}
