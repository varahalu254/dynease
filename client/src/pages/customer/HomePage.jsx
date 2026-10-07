import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Loader2, Plus, Minus, X, Menu as MenuIcon, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useRestaurant, getTenantHeaders } from '../../context/RestaurantContext';
import CustomerSidebar from '../../components/customer/CustomerSidebar';

export default function HomePage({ forcedSlug }) {
  const { slug: paramSlug } = useParams();
  const activeSlug = forcedSlug || paramSlug;
  const { session, addToCart, removeFromCart, updateQuantity, cart, cartCount } = useRestaurant();
  
  const [restaurant, setRestaurant] = useState(session?.restaurant || null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [activeDiet, setActiveDiet] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        let url;
        const headers = getTenantHeaders();

        if (activeSlug) {
          // Legacy /r/:slug route (dev fallback)
          url = `${import.meta.env.VITE_API_URL}/public/restaurant/${activeSlug}/menu`;
        } else {
          // Subdomain-based (production)
          url = `${import.meta.env.VITE_API_URL}/public/menu`;
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        
        if (json.success) {
          const data = json.data;
          setRestaurant(data.restaurant || session?.restaurant);
          // Handle both response shapes (new grouped vs legacy flat)
          if (data.categories && Array.isArray(data.categories) && data.categories[0]?.items) {
            setCategories(data.categories);
            setActiveCategory(data.categories[0]?.name || null);
          } else if (data.menuItems) {
            // Legacy flat format
            const grouped = {};
            for (const item of data.menuItems) {
              if (!grouped[item.category]) grouped[item.category] = [];
              grouped[item.category].push({
                id: item._id,
                name: item.name,
                description: item.description,
                price: item.price,
                imageUrl: item.image?.secure_url || null,
                isAvailable: item.isAvailable,
                dietaryPreference: item.dietaryPreference,
              });
            }
            const cats = Object.entries(grouped).map(([name, items]) => ({ name, items }));
            setCategories(cats);
            setActiveCategory(cats[0]?.name || null);
          }
        } else {
          setError(json.message || 'Failed to load menu.');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [activeSlug]);

  const getItemQty = (id) => cart.find(i => i.menuItemId === String(id))?.quantity || 0;

  const handleAdd = (item) => addToCart({
    menuItemId: String(item.id),
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl,
    dietaryPreference: item.dietaryPreference
  });

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesDiet = activeDiet === 'ALL' || item.dietaryPreference === activeDiet;
      return matchesSearch && matchesDiet;
    })
  })).filter(cat => cat.items.length > 0);

  const scrollToCategory = (name) => {
    setActiveCategory(name);
    categoryRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-500 w-10 h-10 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold">Retry</button>
        </div>
      </div>
    );
  }

  const tableLabel = session?.table?.tableNumber ? `Table ${session.table.tableNumber}` : null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl pb-28">
      {/* ── Header ── */}
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {selectedCategory ? (
              <button onClick={() => setSelectedCategory(null)} className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
            ) : (
              <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors">
                <MenuIcon size={24} className="text-gray-700" />
              </button>
            )}
            <div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 leading-tight">
                  {selectedCategory || restaurant?.name || 'Menu'}
                </h1>
                {!selectedCategory && restaurant?.subtitle && (
                  <span className="text-sm text-gray-500 font-medium">{restaurant.subtitle}</span>
                )}
              </div>
              {tableLabel && !selectedCategory && (
                <span className="text-[10px] bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                  {tableLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {!selectedCategory ? (
        <div className="bg-gray-50 pb-6">
          {/* Ads Banner Placeholder */}
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border-b border-gray-200 bg-white">
            <div className="min-w-full snap-center bg-gradient-to-r from-orange-100 to-yellow-100 aspect-[21/9] flex flex-col justify-center items-center text-orange-800 p-4 text-center">
              <h2 className="font-extrabold text-2xl mb-1 text-orange-600">Special Offer!</h2>
              <p className="font-medium text-sm">Get 20% off on all starters today.</p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="p-4 grid grid-cols-2 gap-4 mt-2">
            {categories.map(cat => {
              const catImage = cat.image || cat.items.find(i => i.imageUrl)?.imageUrl;
              return (
                <div 
                  key={cat.name} 
                  onClick={() => setSelectedCategory(cat.name)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    {catImage ? (
                      <img src={catImage} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="font-bold text-4xl opacity-50">{cat.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2 pb-1">{cat.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 pb-6">
          {/* Search & Filters */}
          <div className="bg-white px-4 py-3 sticky top-[60px] z-10 shadow-sm border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="w-full bg-gray-100 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[
                { value: 'ALL', label: 'All Types' },
                { value: 'VEG', label: '🟢 Veg' },
                { value: 'NON_VEG', label: '🔴 Non-Veg' },
                { value: 'VEGAN', label: '🌿 Vegan' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setActiveDiet(type.value)}
                  className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-bold transition-colors flex-shrink-0 border ${
                    activeDiet === type.value
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="px-4 pt-4 space-y-3">
            {filteredCategories
              .filter(cat => cat.name === selectedCategory)
              .map(cat => cat.items.map(item => {
                const qty = getItemQty(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-3 p-3 items-start">
                    <div className="relative shrink-0">
                      <img
                        src={item.imageUrl || `https://placehold.co/96x96/f97316/white?text=${encodeURIComponent(item.name[0])}`}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${
                          item.dietaryPreference === 'VEG' ? 'border-green-600 bg-green-500' :
                          item.dietaryPreference === 'NON_VEG' ? 'border-red-600 bg-red-500' :
                          'border-gray-400 bg-gray-400'
                        }`} />
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
                      </div>
                      <p className="text-orange-600 font-bold text-sm mb-1">₹{item.price}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                      <div className="mt-2 flex justify-end">
                        {qty === 0 ? (
                          <button
                            onClick={() => handleAdd(item)}
                            className="flex items-center gap-1 bg-white border-2 border-orange-500 text-orange-600 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-orange-50 transition-colors"
                          >
                            <Plus size={14} /> ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-orange-600 text-white rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(String(item.id), qty - 1)}
                              className="px-2 py-1.5 hover:bg-orange-700 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-sm w-5 text-center">{qty}</span>
                            <button
                              onClick={() => updateQuantity(String(item.id), qty + 1)}
                              className="px-2 py-1.5 hover:bg-orange-700 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
            }))}
            
            {filteredCategories.filter(cat => cat.name === selectedCategory).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm">Try a different search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Floating Cart Button ── */}
      <div className="fixed bottom-5 left-0 right-0 z-50 pointer-events-none px-4 flex justify-end">
        <div className="w-full max-w-md mx-auto flex justify-end">
          <Link
            to="/cart"
            aria-label="View cart"
            className="pointer-events-auto relative p-4 bg-orange-600 rounded-full shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <ShoppingBag size={24} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0 right-0 -mt-1 -mr-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <CustomerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        tableLabel={tableLabel} 
      />

    </div>
  );
}
