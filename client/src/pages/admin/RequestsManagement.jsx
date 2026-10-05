import { useState, useEffect } from 'react';
import { Check, X, Loader2, Eye, MapPin, Mail, Phone, Crown } from 'lucide-react';

export default function RequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/requests/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        setRequests(requests.filter(req => req._id !== id));
        setSelectedReq(null);
      } else {
        alert('Failed to approve');
      }
    } catch (error) {
      console.error('Error approve request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    
    setActionLoading(selectedReq._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/requests/${selectedReq._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setRequests(requests.filter(req => req._id !== selectedReq._id));
        setShowRejectModal(false);
        setSelectedReq(null);
        setRejectReason('');
      } else {
        alert('Failed to reject');
      }
    } catch (error) {
      console.error('Error reject request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500 flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Registrations</h2>
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Requests List */}
        <div className={`flex-1 ${selectedReq ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              No pending registration requests.
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map(request => (
                <div 
                  key={request._id} 
                  onClick={() => setSelectedReq(request)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedReq?._id === request._id ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300 shadow-sm hover:shadow'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{request.name}</h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">PENDING</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.type}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Owner: {request.ownerId?.name}</span>
                    <span className="font-semibold text-orange-600">{request.selectedPlan}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed View */}
        {selectedReq && (
          <div className="flex-1 w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
              <button onClick={() => setSelectedReq(null)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Restaurant Information</h4>
                <div className="space-y-3">
                  <p className="text-gray-900"><span className="font-medium text-gray-500 w-32 inline-block">Name:</span> {selectedReq.name}</p>
                  <p className="text-gray-900"><span className="font-medium text-gray-500 w-32 inline-block">Type:</span> {selectedReq.type}</p>
                  <p className="text-gray-900"><span className="font-medium text-gray-500 w-32 inline-block">Phone:</span> {selectedReq.phone}</p>
                  <p className="text-gray-900"><span className="font-medium text-gray-500 w-32 inline-block">Email:</span> {selectedReq.email || 'N/A'}</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Owner Information</h4>
                <div className="space-y-3">
                  <p className="text-gray-900"><span className="font-medium text-gray-500 w-32 inline-block">Full Name:</span> {selectedReq.ownerId?.name}</p>
                  <p className="text-gray-900"><span className="font-medium text-gray-500 w-32 inline-block">Mobile:</span> {selectedReq.ownerId?.phone}</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Subscription Plan</h4>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 font-bold">
                  <Crown size={18} /> {selectedReq.selectedPlan}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => handleApprove(selectedReq._id)}
                disabled={actionLoading === selectedReq._id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
              >
                {actionLoading === selectedReq._id ? <Loader2 className="animate-spin w-5 h-5" /> : <><Check size={20} /> Approve Restaurant</>}
              </button>
              <button 
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading === selectedReq._id}
                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
              >
                <X size={20} /> Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Reject Registration</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleReject} className="p-6">
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting <span className="font-bold text-gray-900">{selectedReq?.name}</span>. This will be recorded and shared if necessary.</p>
              
              <textarea 
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g. Duplicate registration, unverifiable details..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-6 resize-none"
              ></textarea>
              
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowRejectModal(false)} className="flex-1 py-3 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading === selectedReq?._id} className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex justify-center items-center">
                  {actionLoading === selectedReq?._id ? <Loader2 className="animate-spin w-5 h-5" /> : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
