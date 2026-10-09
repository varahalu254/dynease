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
          const match = decodedText.match(/\/(?:t|menu)\/([^/?#]+)/);
          if (match) {
            scanner.clear();
            navigate(`/t/${match[1]}`);
          } else {
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
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-sm">
        {/* Logo Area */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-[var(--color-text)] mb-3 tracking-wide">Dynease</h1>
          <p className="text-[var(--color-text-muted)] font-light">Welcome to the digital menu</p>
        </div>

        <div className="bg-white rounded-[var(--radius-sm)] shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="flex border-b border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-4 font-medium text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'code' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-background)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]'
              }`}
            >
              <Keyboard size={16} /> Enter Code
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 py-4 font-medium text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-colors border-l border-[var(--color-border)] ${
                activeTab === 'scan' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-background)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]'
              }`}
            >
              <QrCode size={16} /> Scan QR
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'code' ? (
              <form onSubmit={handleSubmitCode}>
                <div className="mb-6">
                  <label className="block text-[var(--color-text)] text-xs font-medium uppercase tracking-wide mb-3">Table Code</label>
                  <input
                    type="text"
                    value={tableCode}
                    onChange={(e) => setTableCode(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-primary)] font-serif text-lg text-center transition-colors"
                    required
                  />
                </div>
                {errorMsg && <p className="text-red-700 bg-red-50 p-3 rounded-[var(--radius-sm)] text-sm mb-6 font-medium text-center border border-red-200">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-primary)] text-white font-medium text-sm tracking-wide uppercase py-3.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-light)] transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Open Menu'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div id="reader" className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] mb-6 bg-[var(--color-background)]"></div>
                <p className="text-[var(--color-text-muted)] text-sm font-light">Point your camera at the QR code on your table.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
