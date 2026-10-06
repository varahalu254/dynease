import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, X, Send, CheckCircle, Loader } from 'lucide-react';

export default function RestaurantsManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sendingCredentials, setSendingCredentials] = useState({});
  const [togglingStatus, setTogglingStatus] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    subscriptionPlan: 'FREE',
    isActive: true,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: ''
  });

  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerPassword: ''
  });

  // Load actual data from MongoDB on mount
  useEffect(() => {
    fetchRestaurants();
    fetchPlans();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/restaurants`);
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data.restaurants);
      }
    } catch (err) {
      console.error("Failed to fetch restaurants", err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/plans`);
      const data = await res.json();
      if (data.success) setPlans(data.data.plans);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ restaurantName: '', ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: '' });
        fetchRestaurants(); // Refresh the table
        alert('Restaurant and Owner Account Created Successfully!');
      } else {
        alert(data.message || 'Error creating restaurant');
      }
    } catch (err) {
      alert('Network error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/restaurants/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants(restaurants.filter(r => r._id !== id));
      } else {
        alert(data.message || 'Error deleting restaurant');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete restaurant');
    }
  };

  const openEditModal = (restaurant) => {
    setEditingId(restaurant._id);
    setEditFormData({
      name: restaurant.name,
      subscriptionPlan: restaurant.subscriptionPlan || 'FREE',
      isActive: restaurant.isActive,
      ownerName: restaurant.ownerId?.name || '',
      ownerEmail: restaurant.ownerId?.email || '',
      ownerPhone: restaurant.ownerId?.phone || ''
    });
    setShowEditModal(true);
  };

  const handleSendCredentials = async (restaurantId) => {
    if (!window.confirm("Reset the owner's password and send new login credentials via WhatsApp?")) return;
    setSendingCredentials(prev => ({ ...prev, [restaurantId]: 'sending' }));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/restaurants/${restaurantId}/send-credentials`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setSendingCredentials(prev => ({ ...prev, [restaurantId]: 'sent' }));
        setTimeout(() => setSendingCredentials(prev => ({ ...prev, [restaurantId]: 'idle' })), 3000);
      } else {
        alert(data.message || 'Failed to send credentials');
        setSendingCredentials(prev => ({ ...prev, [restaurantId]: 'idle' }));
      }
    } catch (err) {
      alert('Network error.');
      setSendingCredentials(prev => ({ ...prev, [restaurantId]: 'idle' }));
    }
  };

  const handleToggleStatus = async (restaurant) => {
    setTogglingStatus(restaurant._id);
    try {
      const newStatus = !(restaurant.isActive || restaurant.status === 'ACTIVE');
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/restaurants/${restaurant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: restaurant.name,
          subscriptionPlan: restaurant.selectedPlan || 'FREE',
          isActive: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchRestaurants();
      } else {
        alert(data.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert('Network error while toggling status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleEditChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditFormData({ ...editFormData, [e.target.name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/restaurants/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchRestaurants();
        alert('Restaurant updated successfully!');
      } else {
        alert(data.message || 'Error updating restaurant');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Restaurant Management</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Restaurant
        </button>
      </div>

      <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search restaurants..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-gray-900 bg-white"
          />
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Restaurant Name</th>
              <th className="p-4 font-semibold text-gray-600">Owner</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Plan</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No restaurants found. Add one above!</td>
              </tr>
            ) : restaurants.map(res => {
              const credStatus = sendingCredentials[res._id] || 'idle';
              return (
                <tr key={res._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{res.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{res.slug}.dynease.in</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-700">{res.ownerId?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{res.ownerId?.phone || res.ownerId?.email || ''}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleStatus(res)}
                        disabled={togglingStatus === res._id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                          (res.isActive || res.status === 'ACTIVE') ? 'bg-green-500' : 'bg-gray-300'
                        } ${togglingStatus === res._id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <span className="sr-only">Toggle status</span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (res.isActive || res.status === 'ACTIVE') ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {res.isActive || res.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${res.subscriptionPlan === 'PRO' ? 'bg-purple-100 text-purple-700' : res.subscriptionPlan === 'GROWTH' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {res.subscriptionPlan || 'FREE'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleSendCredentials(res._id)}
                        disabled={credStatus === 'sending'}
                        title="Send login credentials via WhatsApp"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${credStatus === 'sent' ? 'bg-green-100 text-green-700' : credStatus === 'sending' ? 'bg-blue-50 text-blue-400 cursor-wait' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      >
                        {credStatus === 'sent' ? <><CheckCircle size={14} /> Sent!</> : credStatus === 'sending' ? <><Loader size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Creds</>}
                      </button>
                      <button onClick={() => openEditModal(res)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(res._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Add New Restaurant</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
                <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g., Paradise Biryani" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name</label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Phone</label>
                  <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} pattern="\d{10}" maxLength="10" required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Email</label>
                <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="owner@restaurant.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                <input type="password" name="ownerPassword" value={formData.ownerPassword} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="••••••••" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-colors disabled:opacity-50">
                  {isLoading ? 'Creating...' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Edit Restaurant</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name</label>
                  <input type="text" name="ownerName" value={editFormData.ownerName} onChange={handleEditChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Phone</label>
                  <input type="tel" name="ownerPhone" value={editFormData.ownerPhone} onChange={handleEditChange} pattern="\d{10}" maxLength="10" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Email</label>
                <input type="email" name="ownerEmail" value={editFormData.ownerEmail} onChange={handleEditChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subscription Plan</label>
                <select name="subscriptionPlan" value={editFormData.subscriptionPlan} onChange={handleEditChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900 bg-white">
                  {plans.length > 0 ? plans.map(plan => (
                    <option key={plan._id} value={plan.name}>{plan.name} — Rs.{plan.price}/mo</option>
                  )) : (
                    <>
                      <option value="FREE">FREE — Rs.0/mo</option>
                      <option value="GROWTH">GROWTH — Rs.999/mo</option>
                      <option value="PRO">PRO — Rs.1999/mo</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-colors disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
