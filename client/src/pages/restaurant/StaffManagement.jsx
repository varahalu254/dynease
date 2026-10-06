import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, Search } from 'lucide-react';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESTAURANT_STAFF',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const hostname = window.location.hostname;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    let subdomain = '';
    if (hostname.includes('dynease.in') && hostname !== 'dynease.in' && hostname !== 'www.dynease.in') {
      subdomain = hostname.split('.')[0];
    } else if (hostname.includes('localhost') && hostname !== 'localhost') {
      subdomain = hostname.split('.')[0];
    }
    if (subdomain) headers['x-tenant-subdomain'] = subdomain;
    return headers;
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/staff`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data.staff);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'RESTAURANT_STAFF', phone: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    setEditingId(staff._id);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '', // Leave blank unless changing
      role: staff.role,
      phone: staff.phone || '',
      isActive: staff.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/restaurant/staff/${editingId}`
        : `${import.meta.env.VITE_API_URL}/restaurant/staff`;
      
      const method = editingId ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (editingId && !payload.password) delete payload.password; // Don't send empty password on edit

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchStaff();
      } else {
        alert(data.message || 'Error saving staff');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/staff/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchStaff();
      } else {
        alert(data.message || 'Error deleting');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const roleColors = {
    RESTAURANT_OWNER: 'bg-purple-100 text-purple-700',
    RESTAURANT_STAFF: 'bg-blue-100 text-blue-700',
    KITCHEN_STAFF: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] relative">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage waiters, kitchen staff, and roles</p>
        </div>
        <button onClick={openAddModal} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={20} /> Add Staff
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email & Phone</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No staff found. Add one above.</td></tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{staff.name}</td>
                  <td className="p-4">
                    <div className="text-gray-800">{staff.email}</div>
                    <div className="text-sm text-gray-500">{staff.phone || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${roleColors[staff.role] || 'bg-gray-100 text-gray-600'}`}>
                      {staff.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    {staff.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(staff)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      {staff.role !== 'RESTAURANT_OWNER' && (
                        <button onClick={() => handleDelete(staff._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (for login)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} required disabled={formData.role === 'RESTAURANT_OWNER'} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white disabled:bg-gray-100 disabled:text-gray-500">
                    <option value="RESTAURANT_STAFF">Waiter</option>
                    <option value="KITCHEN_STAFF">Kitchen Staff</option>
                    {formData.role === 'RESTAURANT_OWNER' && <option value="RESTAURANT_OWNER">Owner</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone (Optional)</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{editingId ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingId} className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Account is Active</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-md shadow-orange-600/20 transition-all">{editingId ? 'Save Changes' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
