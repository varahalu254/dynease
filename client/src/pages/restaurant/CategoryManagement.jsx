import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2, Tag, FolderOpen, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchMenu();
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

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/categories`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/menu`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.data.menuItems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setCategoryImage(null);
    setPreviewImage(null);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setNewCategoryName(cat.name);
    setNewCategoryDesc(cat.description || '');
    setCategoryImage(null);
    setPreviewImage(cat.image?.secure_url || null);
    setShowModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const formData = new FormData();
      formData.append('name', newCategoryName.trim());
      formData.append('description', newCategoryDesc.trim());
      if (categoryImage) {
        formData.append('image', categoryImage);
      }

      const url = editingCategory 
        ? `${import.meta.env.VITE_API_URL}/restaurant/categories/${editingCategory._id}`
        : `${import.meta.env.VITE_API_URL}/restaurant/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      const headers = getHeaders();
      delete headers['Content-Type']; // Let browser set boundary

      const res = await fetch(url, {
        method,
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (editingCategory) {
          setCategories(prev => prev.map(c => c._id === editingCategory._id ? data.data.category : c));
        } else {
          setCategories(prev => [...prev, data.data.category]);
        }
        setShowModal(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error saving category.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const itemInUse = menuItems.some(i => i.category === cat.name);
    if (itemInUse) {
       alert(`Cannot delete category "${cat.name}" because it is currently assigned to menu items.`);
       return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    setDeletingCatId(cat._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/categories/${cat._id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c._id !== cat._id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting category.');
    } finally {
      setDeletingCatId(null);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const formData = new FormData();
      formData.append('isActive', !cat.isActive);
      
      const reqHeaders = getHeaders();
      delete reqHeaders['Content-Type'];

      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/categories/${cat._id}`, {
        method: 'PUT',
        headers: reqHeaders,
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, isActive: !c.isActive } : c));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error updating category status.');
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] relative">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen size={24} className="text-orange-500" />
            Category Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage categories for your menu items</p>
        </div>
        <button onClick={openAddModal} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>
        ) : categories.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No categories found</h3>
            <p className="text-gray-500 mt-1">Get started by creating your first menu category.</p>
            <button onClick={openAddModal} className="mt-4 px-4 py-2 bg-white border border-orange-200 text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors">
              Create Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const count = menuItems.filter(i => i.category === cat.name).length;
              return (
                <div key={cat._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex shrink-0 items-center justify-center">
                        {cat.image?.secure_url ? (
                          <img src={cat.image.secure_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={20} className="text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={deletingCatId === cat._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          {deletingCatId === cat._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`p-1 rounded-lg transition-colors ${cat.isActive !== false ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={cat.isActive !== false ? "Active (Click to disable)" : "Disabled (Click to enable)"}
                      >
                        {cat.isActive !== false ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>
                  </div>
                  {cat.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{cat.description}</p>}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usage</span>
                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSaveCategory}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name *</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Starters, Main Course"
                  required 
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea 
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  placeholder="Short description for the category"
                  rows="3"
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900 bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Image (Optional)</label>
                <div 
                  className={`w-full p-4 border-2 border-dashed rounded-xl flex items-center gap-4 transition-colors ${
                    isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setCategoryImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-inner">
                    {previewImage ? (
                      <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <FolderOpen size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <input 
                      type="file" 
                      id="categoryImageUpload"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setCategoryImage(file);
                          setPreviewImage(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="categoryImageUpload" className="cursor-pointer">
                      <span className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2">Click to upload</span>
                      <span className="text-sm text-gray-500"> or drag & drop</span>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG (Max 5MB)</p>
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={savingCategory} className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-md shadow-orange-600/20 transition-all flex justify-center items-center gap-2">
                  {savingCategory ? <Loader2 size={16} className="animate-spin" /> : null}
                  {savingCategory ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
