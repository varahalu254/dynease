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
  const [errorCode, setErrorCode] = useState('');
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        let url;
        const headers = getTenantHeaders();

        if (activeSlug) {
          url = `${import.meta.env.VITE_API_URL}/public/restaurant/${activeSlug}/menu`;
        } else {
          url = `${import.meta.env.VITE_API_URL}/public/menu`;
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        
        if (json.success) {
          const data = json.data;
          setRestaurant(data.restaurant || session?.restaurant);
          if (data.categories && Array.isArray(data.categories) && data.categories[0]?.items) {
            setCategories(data.categories);
            setActiveCategory(data.categories[0]?.name || null);
          } else if (data.menuItems) {
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
          setErrorCode(json.code || '');
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
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[var(--color-primary)] w-8 h-8 mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] font-serif italic">Curating the menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isSubscriptionError = errorCode.startsWith('SUBSCRIPTION_');
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[var(--radius-sm)] shadow-sm border border-[var(--color-border)] p-8 max-w-sm w-full">
          <h2 className="text-xl font-serif text-[var(--color-text)] mb-3">
            {isSubscriptionError ? 'Service Unavailable' : 'Notice'}
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6 font-light">{error}</p>
          {!isSubscriptionError && (
            <button onClick={() => window.location.reload()} className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-[var(--radius-sm)] text-sm uppercase tracking-wider font-medium">Retry</button>
          )}
        </div>
      </div>
    );
  }

  const tableLabel = session?.table?.tableNumber ? `Table ${session.table.tableNumber}` : null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] max-w-md mx-auto relative shadow-2xl pb-28">
      {/* ── Header ── */}
      <header className="bg-white px-4 pt-5 pb-4 sticky top-0 z-20 border-b border-[var(--color-border)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {selectedCategory ? (
              <button onClick={() => setSelectedCategory(null)} className="p-1 -ml-1 hover:bg-[var(--color-background)] rounded-[var(--radius-sm)] transition-colors">
                <ArrowLeft size={22} className="text-[var(--color-text)]" />
              </button>
            ) : (
              <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 hover:bg-[var(--color-background)] rounded-[var(--radius-sm)] transition-colors">
                <MenuIcon size={22} className="text-[var(--color-text)]" />
              </button>
            )}
            <div>
              <div className="flex flex-col">
                <h1 className="text-xl font-serif font-bold text-[var(--color-text)] leading-tight tracking-wide">
                  {selectedCategory || restaurant?.name || 'Menu'}
                </h1>
                {!selectedCategory && restaurant?.subtitle && (
                  <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-widest mt-1">{restaurant.subtitle}</span>
                )}
              </div>
              {tableLabel && !selectedCategory && (
                <span className="text-[10px] bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold px-2 py-0.5 mt-2 inline-block uppercase tracking-wider">
                  {tableLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {!selectedCategory ? (
        <div className="bg-[var(--color-background)] pb-6">
          {/* Subtle Notice Banner */}
          <div className="border-b border-[var(--color-border)] bg-white px-4 py-4 text-center">
            <h2 className="font-serif text-lg mb-1 text-[var(--color-primary)]">Chef's Recommendations</h2>
            <p className="font-light text-[var(--color-text-muted)] text-sm">Discover our carefully curated seasonal offerings.</p>
          </div>

          {/* Categories Grid */}
          <div className="p-4 grid grid-cols-2 gap-4 mt-2">
            {categories.map(cat => {
              const catImage = cat.image || cat.items.find(i => i.imageUrl)?.imageUrl;
              return (
                <div 
                  key={cat.name} 
                  onClick={() => setSelectedCategory(cat.name)}
                  className="bg-white rounded-[var(--radius-sm)] border border-[var(--color-border)] p-2 flex flex-col items-center text-center cursor-pointer hover:border-[var(--color-primary-light)] transition-colors"
                >
                  <div className="w-full aspect-[4/3] bg-[var(--color-background)] rounded-[var(--radius-sm)] mb-3 overflow-hidden border border-[var(--color-border)]">
                    {catImage ? (
                      <img src={catImage} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                        <span className="font-serif text-2xl opacity-50">{cat.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-[var(--color-text)] text-sm leading-tight mb-2 pb-1 tracking-wide">{cat.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-background)] pb-6">
          {/* Search & Filters */}
          <div className="bg-white px-4 py-4 sticky top-[73px] z-10 border-b border-[var(--color-border)] space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors font-light"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[
                { value: 'ALL', label: 'All' },
                { value: 'VEG', label: 'Vegetarian' },
                { value: 'NON_VEG', label: 'Non-Vegetarian' },
                { value: 'VEGAN', label: 'Vegan' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setActiveDiet(type.value)}
                  className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors flex-shrink-0 border ${
                    activeDiet === type.value
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="px-4 pt-4 space-y-4">
            {filteredCategories
              .filter(cat => cat.name === selectedCategory)
              .map(cat => cat.items.map(item => {
                const qty = getItemQty(item.id);
                return (
                  <div key={item.id} className="bg-white border border-[var(--color-border)] flex gap-4 p-4 items-start">
                    <div className="relative shrink-0">
                      <img
                        src={item.imageUrl || `https://placehold.co/96x96/f5f5f4/1c1917?text=${encodeURIComponent(item.name[0])}`}
                        alt={item.name}
                        className="w-24 h-24 object-cover border border-[var(--color-border)]"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-[var(--color-text)] text-sm leading-snug tracking-wide">{item.name}</h3>
                        </div>
                        <p className="text-[var(--color-text)] font-medium text-sm mb-2">${item.price}</p>
                        {item.description && (
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed font-light">{item.description}</p>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end">
                        {qty === 0 ? (
                          <button
                            onClick={() => handleAdd(item)}
                            className="flex items-center gap-1.5 bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] font-medium px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                          >
                            <Plus size={12} /> Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 border border-[var(--color-primary)] text-[var(--color-primary)]">
                            <button
                              onClick={() => updateQuantity(String(item.id), qty - 1)}
                              className="p-1.5 hover:bg-[var(--color-background)] transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-medium text-xs w-4 text-center">{qty}</span>
                            <button
                              onClick={() => updateQuantity(String(item.id), qty + 1)}
                              className="p-1.5 hover:bg-[var(--color-background)] transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
            }))}
            
            {filteredCategories.filter(cat => cat.name === selectedCategory).length === 0 && (
              <div className="text-center py-16 text-[var(--color-text-muted)] border border-[var(--color-border)] bg-white">
                <p className="font-serif text-lg mb-1">No items found</p>
                <p className="text-sm font-light">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Floating Cart Button ── */}
      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4 flex justify-end">
        <div className="w-full max-w-md mx-auto flex justify-end">
          <Link
            to="/cart"
            aria-label="View cart"
            className="pointer-events-auto relative p-4 bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary-light)] transition-colors flex items-center justify-center rounded-none"
          >
            <ShoppingBag size={22} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-medium border-2 border-white">
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
