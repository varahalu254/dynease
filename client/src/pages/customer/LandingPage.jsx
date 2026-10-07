import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, Keyboard, Loader2 } from 'lucide-react';
import { useRestaurant, getTenantHeaders } from '../../context/RestaurantContext';

export default function LandingPage({ onSessionEstablished }) {
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'scan'
  const [tableCode, setTableCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveSession } = useRestaurant();
  const navigate = useNavigate();

  useEffect(() => {
    let scanner = null;
    if (activeTab === 'scan') {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render(
        (decodedText) => {
          // If decodedText is a URL from our platform (e.g. https://<res>.dynease.in/menu/<qrToken> or /t/<qrToken>)
          const match = decodedText.match(/\/(?:t|menu)\/([^/?#]+)/);
          if (match) {
            scanner.clear();
            navigate(`/t/${match[1]}`);
          } else {
            // Might just be a raw token
            scanner.clear();
            navigate(`/t/${decodedText}`);
          }
        },
        (error) => {
          // Ignore scanning errors as they happen constantly during scanning
        }
      );
    }
    
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [activeTab, navigate]);

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (!tableCode.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/public/table/${tableCode.trim()}`,
        { headers: getTenantHeaders() }
      );
      const data = await res.json();

      if (data.success) {
        const { restaurant, table, session } = data.data;
        saveSession(restaurant, table, session.qrToken);
        if (onSessionEstablished) {
          onSessionEstablished();
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setErrorMsg(data.message || 'Invalid Table Code.');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-sm">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-orange-600 mb-2">Dynease</h1>
          <p className="text-gray-600 font-medium">Welcome to the E-Menu</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'code' ? 'text-orange-600 bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Keyboard size={18} /> Enter Code
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors border-l border-gray-100 ${
                activeTab === 'scan' ? 'text-orange-600 bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <QrCode size={18} /> Scan QR
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'code' ? (
              <form onSubmit={handleSubmitCode}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Table Code</label>
                  <input
                    type="text"
                    value={tableCode}
                    onChange={(e) => setTableCode(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-lg text-center"
                    required
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-sm mb-4 font-medium text-center">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Open Menu'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div id="reader" className="overflow-hidden rounded-2xl border-2 border-orange-100 mb-4 bg-gray-50"></div>
                <p className="text-gray-500 text-sm">Point your camera at the QR code on your table.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
