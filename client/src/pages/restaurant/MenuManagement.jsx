import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Tag, Filter, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

const DIET_TYPES = [
  { value: 'ALL', label: 'All Types', color: 'gray' },
  { value: 'VEG', label: 'Veg', color: 'green' },
  { value: 'NON_VEG', label: 'Non-Veg', color: 'red' },
  { value: 'VEGAN', label: 'Vegan', color: 'emerald' },
  { value: 'NONE', label: 'None', color: 'gray' },
];

const DIET_BADGE = {
  VEG: 'bg-green-100 text-green-700',
  NON_VEG: 'bg-red-100 text-red-700',
  VEGAN: 'bg-emerald-100 text-emerald-700',
  NONE: 'bg-gray-100 text-gray-600',
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeDiet, setActiveDiet] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    dietaryPreference: 'VEG',
    preparationTime: '15'
  });
  const [quantities, setQuantities] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchMenu();
  }, []);

  const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const hostname = window.location.hostname;
    const headers = { 'Authorization': `Bearer ${token}` };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    let subdomain = '';
    if (hostname.includes('dynease.in') && hostname !== 'dynease.in' && hostname !== 'www.dynease.in') {
      subdomain = hostname.split('.')[0];
    } else if (hostname.includes('localhost') && hostname !== 'localhost') {
      subdomain = hostname.split('.')[0];
    }
    if (subdomain) headers['x-tenant-subdomain'] = subdomain;
    return headers;
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/categories`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) setCategories(data.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) setItems(data.data.menuItems);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('dietaryPreference', formData.dietaryPreference);
    data.append('preparationTime', formData.preparationTime);
    if (quantities.length > 0) {
      data.append('quantities', JSON.stringify(quantities));
    }
    if (imageFile) data.append('image', imageFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu`, {
        method: 'POST',
        headers: getHeaders(true),
        body: data
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setFormData({ name: '', category: '', description: '', price: '', dietaryPreference: 'VEG', preparationTime: '15' });
        setQuantities([]);
        setImageFile(null);
        fetchMenu();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating item.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (item) => {
    setTogglingId(item._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu/${item._id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i._id === item._id ? data.data.menuItem : i));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered items
  const filtered = items.filter(item => {
    const catMatch = activeCategory === 'ALL' || item.category === activeCategory;
    const dietMatch = activeDiet === 'ALL' || item.dietaryPreference === activeDiet;
    return catMatch && dietMatch;
  });

  const allCategories = ['ALL', ...categories.map(c => c.name)];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Menu Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
        >
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
          <Filter size={15} /> Filters
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Tag size={12} /> Category
          </p>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
                {cat !== 'ALL' && (
                  <span className="ml-1 text-[10px] opacity-60">
                    ({items.filter(i => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {DIET_TYPES.map(dt => (
              <button
                key={dt.value}
                onClick={() => setActiveDiet(dt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeDiet === dt.value
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dt.label}
                {dt.value !== 'ALL' && (
                  <span className="ml-1 text-[10px] opacity-60">
                    ({items.filter(i => i.dietaryPreference === dt.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Showing <span className="font-bold text-gray-600">{filtered.length}</span> of {items.length} items
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600 text-sm">Item</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Price</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Available</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400">
                  {items.length === 0 ? 'No items yet. Add your first dish!' : 'No items match the selected filters.'}
                </td>
              </tr>
            ) : filtered.map(item => (
              <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.image?.secure_url ? (
                      <img src={item.image.secure_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400 max-w-[180px] truncate">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-orange-600">₹{item.price}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${DIET_BADGE[item.dietaryPreference] || DIET_BADGE.NONE}`}>
                      {item.dietaryPreference}
                    </span>
                    {item.quantities && item.quantities.length > 0 && (
                      <div className="text-xs text-gray-500 font-medium">
                        {item.quantities.length} variant{item.quantities.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    disabled={togglingId === item._id}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    {togglingId === item._id ? (
                      <Loader2 size={18} className="animate-spin text-gray-400" />
                    ) : item.isAvailable ? (
                      <><ToggleRight size={24} className="text-green-500" /><span className="text-green-600">On</span></>
                    ) : (
                      <><ToggleLeft size={24} className="text-gray-400" /><span className="text-gray-400">Off</span></>
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add Dish Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Add New Dish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Dish Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white text-sm" placeholder="e.g. Paneer Tikka" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Price (₹) *</label>
                  <input type="number" name="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required min="0" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white text-sm" placeholder="249" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Category *</label>
                  {categories.length > 0 ? (
                    <select name="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white text-sm">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <div className="w-full p-2.5 border border-dashed border-orange-300 rounded-lg text-xs text-orange-500 bg-orange-50">
                      No categories yet. Add one in the Categories tab.
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Type *</label>
                  <select name="dietaryPreference" value={formData.dietaryPreference} onChange={e => setFormData({...formData, dietaryPreference: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white text-sm">
                    <option value="VEG">🟢 Veg</option>
                    <option value="NON_VEG">🔴 Non-Veg</option>
                    <option value="VEGAN">🌿 Vegan</option>
                    <option value="NONE">⚪ None</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white text-sm" rows="2" placeholder="Delicious grilled cottage cheese..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
              </div>

              {/* Quantity Variants */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Add Size/Quantity Variants (Optional)</label>
                  <button
                    type="button"
                    onClick={() => setQuantities([...quantities, { size: '', price: '' }])}
                    className="text-xs bg-orange-100 text-orange-600 hover:bg-orange-200 px-2 py-1 rounded transition-colors font-medium"
                  >
                    + Add Variant
                  </button>
                </div>
                
                {quantities.length > 0 && (
                  <div className="space-y-2">
                    {quantities.map((qty, idx) => (
                      <div key={idx} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 font-medium block mb-1">Size/Type</label>
                          <input
                            type="text"
                            value={qty.size}
                            onChange={(e) => {
                              const newQty = [...quantities];
                              newQty[idx].size = e.target.value;
                              setQuantities(newQty);
                            }}
                            placeholder="e.g. Small, Medium, Large, 250ml"
                            className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 font-medium block mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={qty.price}
                            onChange={(e) => {
                              const newQty = [...quantities];
                              newQty[idx].price = e.target.value;
                              setQuantities(newQty);
                            }}
                            placeholder="0"
                            min="0"
                            className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuantities(quantities.filter((_, i) => i !== idx))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
