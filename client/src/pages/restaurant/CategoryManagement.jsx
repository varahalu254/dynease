import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit2, Loader2, AlertCircle } from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const hostname = window.location.hostname;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
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
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/categories`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories || []);
      } else {
        setError(data.message || 'Failed to load categories');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        displayOrder: 0
      });
    }
    setShowAdvanced(false);
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      displayOrder: 0
    });
    setShowAdvanced(false);
    setError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/restaurant/categories/${editingId}`
        : `${import.meta.env.VITE_API_URL}/restaurant/categories`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          displayOrder: parseInt(formData.displayOrder) || 0
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingId ? 'Category updated successfully!' : 'Category created successfully!');
        fetchCategories();
        handleCloseModal();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      setError('Error saving category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Any items in this category will need to be reassigned.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Category deleted successfully!');
        fetchCategories();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting category. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Category Management</h2>
          <p className="text-sm text-gray-500 mt-1">Organize your menu items into categories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-orange-600 w-8 h-8 mb-3" />
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      ) : (
        <>
          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">No categories yet. Create your first one!</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Create Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800 flex-1">{category.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        disabled={deletingId === category._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete category"
                      >
                        {deletingId === category._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Order: {category.displayOrder}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-gap gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Appetizers, Main Course"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Optional description for this category"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  {showAdvanced ? '▼' : '▶'} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Display Order
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        name="displayOrder"
                        min="0"
                        max="20"
                        value={formData.displayOrder}
                        onChange={handleFormChange}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        disabled={isSubmitting}
                      />
                      <span className="text-2xl font-bold text-orange-600 w-12 text-center">{formData.displayOrder}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Lower numbers appear first (0-20)</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
