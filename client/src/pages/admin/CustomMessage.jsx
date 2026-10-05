import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

export default function CustomMessage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusText, setStatusText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setStatusText('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, message })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setStatusText('Message sent successfully!');
        setPhone('');
        setMessage('');
      } else {
        setStatus('error');
        setStatusText(data.message || 'Failed to send message.');
      }
    } catch (error) {
      setStatus('error');
      setStatusText('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Send WhatsApp Message</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {status === 'success' ? <CheckCircle size={20} /> : null}
              {statusText}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+</span>
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919876543210"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-gray-900"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Include country code without + (e.g. 91 for India)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea 
              required 
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-gray-900 resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !phone || !message}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Sending...</>
            ) : (
              <><Send size={20} /> Send Message</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
