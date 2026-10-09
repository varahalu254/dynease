import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';

export default function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/ads`);
      const data = await res.json();
      if (data.success) setAds(data.data.ads);
    } catch (err) {
      console.error('Failed to fetch ads', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: '', imageUrl: '', targetUrl: '', status: 'Active' });
    setShowModal(true);
  };

  const openEditModal = (ad) => {
    setIsEditing(true);
    setEditingId(ad._id);
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl || '',
      status: ad.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/admin/ads/${editingId}` 
        : `${import.meta.env.VITE_API_URL}/admin/ads`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchAds();
      } else {
        alert(data.message || 'Failed to save ad');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/ads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAds(ads.filter(ad => ad._id !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Ads Management</h2>
        <button onClick={openAddModal} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add New Ad
        </button>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Ad Title</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Clicks</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No ads found. Create one above!</td>
              </tr>
            ) : ads.map(ad => (
              <tr key={ad._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  <img src={ad.imageUrl} alt={ad.title} className="w-14 h-14 object-cover rounded-lg shadow-sm" onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=No+Image'; }} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{ad.title}</span>
                    {ad.targetUrl && <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">{ad.targetUrl}</a>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${ad.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {ad.status}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-600">{ad.clicks || 0}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(ad)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(ad._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Ad' : 'Create New Ad'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g., Summer Special" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="https://example.com/image.jpg" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Target Link (Optional)</label>
                <input type="url" name="targetUrl" value={formData.targetUrl} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="https://example.com" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-colors disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
