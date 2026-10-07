import React, { useState, useEffect } from 'react';
import { Loader2, Save, Store } from 'lucide-react';
import { getTenantHeaders } from '../../context/RestaurantContext';

export default function RestaurantSettings() {
  const [profile, setProfile] = useState({ name: '', subtitle: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/profile`, {
        headers: getTenantHeaders()
      });
      const data = await res.json();
      if (data.success && data.data.profile) {
        setProfile({
          name: data.data.profile.name || '',
          subtitle: data.data.profile.subtitle || ''
        });
      }
    } catch (error) {
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/restaurant/profile`, {
        method: 'PUT',
        headers: getTenantHeaders(),
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        alert('Restaurant profile updated');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Restaurant Settings</h1>
            <p className="text-gray-500">Manage your restaurant's public profile and name display.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Display Name</h2>
            <p className="text-sm text-gray-500 mb-6">
              You can split your restaurant name into two parts. The primary name will be displayed in a large font, while the subtitle will appear underneath in a smaller font.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Name (Large)
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="e.g., Chandrika"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (Small) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={profile.subtitle}
                  onChange={(e) => setProfile(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="e.g., Family Restaurant"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Live Preview</h3>
              <div className="p-6 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center min-h-[100px] text-center shadow-inner">
                {profile.name ? (
                  <>
                    <div className="text-2xl md:text-3xl font-bold text-gray-800">{profile.name}</div>
                    {profile.subtitle && (
                      <div className="text-sm md:text-base text-gray-500 mt-1">{profile.subtitle}</div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 italic">Enter a name to preview</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
