import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

export default function RequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/requests`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/requests/${id}/${action}`, {
        method: 'POST'
      });
      if (res.ok) {
        setRequests(requests.filter(req => req._id !== id));
      }
    } catch (error) {
      console.error(`Error ${action} request:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading requests...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registration Requests</h2>
      
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          No pending registration requests.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Restaurant Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{request.name}</td>
                  <td className="p-4 text-gray-600">{request.ownerId?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-600">
                    <div className="text-sm">{request.ownerId?.email}</div>
                    <div className="text-xs text-gray-400">{request.ownerId?.phone}</div>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(request._id, 'approve')}
                      disabled={actionLoading === request._id}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check size={18} /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction(request._id, 'reject')}
                      disabled={actionLoading === request._id}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X size={18} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
