import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Loader2, ChevronRight, Plus, Minus, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useRestaurant, getTenantHeaders } from '../../context/RestaurantContext';

export default function HomePage({ forcedSlug }) {
  const { slug: paramSlug } = useParams();
  const activeSlug = forcedSlug || paramSlug;
  const { session, addToCart, removeFromCart, updateQuantity, cart, cartCount, cartSubtotal } = useRestaurant();
  
  const [restaurant, setRestaurant] = useState(session?.restaurant || null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
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
    items: cat.items.filter(item =>
      !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase())
    )
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
      <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-20 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {restaurant?.name || 'Menu'}
            </h1>
            {tableLabel && (
              <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                {tableLabel}
              </span>
            )}
          </div>
          <Link to="/cart" className="relative p-2 bg-orange-50 rounded-xl border border-orange-100">
            <ShoppingBag size={24} className="text-orange-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes…"
            className="w-full bg-gray-100 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ── Category Pills ── */}
      {!search && (
        <div className="bg-white px-4 pt-2 pb-3 overflow-x-auto flex gap-2 scrollbar-hide sticky top-[100px] z-10 shadow-sm">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => scrollToCategory(cat.name)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${
                activeCategory === cat.name
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Menu Items ── */}
      <div className="px-4 pt-4 space-y-6">
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">Try a different search</p>
          </div>
        )}
        {filteredCategories.map(cat => (
          <section
            key={cat.name}
            ref={el => { categoryRefs.current[cat.name] = el; }}
          >
            <h2 className="text-base font-extrabold text-gray-800 mb-3 uppercase tracking-wide">{cat.name}</h2>
            <div className="space-y-3">
              {cat.items.map(item => {
                const qty = getItemQty(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-3 p-3 items-start">
                    {/* Image */}
                    <div className="relative shrink-0">
                      <img
                        src={item.imageUrl || `https://placehold.co/96x96/f97316/white?text=${encodeURIComponent(item.name[0])}`}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    </div>
                    {/* Info */}
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
                      {/* Cart Controls */}
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
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ── Floating Cart Bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
          <Link
            to="/cart"
            className="flex justify-between items-center bg-orange-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-orange-300/50 hover:bg-orange-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="bg-orange-800/40 text-white text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center">
                {cartCount}
              </span>
              <span className="font-bold">View Cart</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              ₹{cartSubtotal.toFixed(2)}
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
