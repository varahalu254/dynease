import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    dietaryPreference: 'NONE',
    preparationTime: '15'
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.menuItems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // We must use FormData to send files along with text data
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('dietaryPreference', formData.dietaryPreference);
    data.append('preparationTime', formData.preparationTime);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data // Do NOT set Content-Type header when using FormData, browser does it automatically with boundary
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setFormData({ name: '', category: '', description: '', price: '', dietaryPreference: 'NONE', preparationTime: '15' });
        setImageFile(null);
        fetchMenu();
        alert('Menu item added successfully! The photo was saved to Cloudinary.');
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating item. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Menu Management</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Dish
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Item</th>
              <th className="p-4 font-semibold text-gray-600">Category</th>
              <th className="p-4 font-semibold text-gray-600">Price</th>
              <th className="p-4 font-semibold text-gray-600">Type</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No items yet. Add your first dish!</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  {item.image?.secure_url ? (
                    <img src={item.image.secure_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 max-w-[200px] truncate">{item.description}</div>
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-600">{item.category}</td>
                <td className="p-4 font-bold text-orange-600">₹{item.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.dietaryPreference === 'VEG' ? 'bg-green-100 text-green-700' : item.dietaryPreference === 'NON_VEG' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.dietaryPreference}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Add New Dish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Dish Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g. Paneer Tikka" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="249" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleInputChange} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" placeholder="e.g. Starters" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Type</label>
                  <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white">
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non-Veg</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" rows="2" placeholder="Delicious grilled cottage cheese..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Image Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold disabled:opacity-50 transition-colors">
                  {isLoading ? 'Uploading...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
