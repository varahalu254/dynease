import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RestaurantContext = createContext(null);

/**
 * Derives the restaurant slug from the current hostname.
 * Production: tasty-bites.dynease.in → tasty-bites
 * Dev:        tasty-bites.localhost:5173 → tasty-bites
 */
export function getSubdomainSlug() {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  if (hostname.includes('dynease.in') && hostname !== 'dynease.in' && hostname !== 'www.dynease.in' && !hostname.startsWith('admin.')) {
    return hostname.split('.')[0];
  }
  if (hostname.includes('localhost') && hostname !== 'localhost') {
    const slug = hostname.split('.')[0];
    if (slug !== 'admin') return slug;
  }
  return null;
}

/**
 * Build the header object for API calls that need tenant context.
 */
export function getTenantHeaders(extra = {}) {
  const slug = getSubdomainSlug();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (slug) headers['x-tenant-subdomain'] = slug;
  return headers;
}

export function RestaurantProvider({ children }) {
  const slug = getSubdomainSlug();
  
  // Session: resolved after QR scan
  const [session, setSession] = useState(() => {
    try {
      const raw = sessionStorage.getItem(`dynease-session:${slug}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  // Cart: persisted per restaurant+table
  const cartKey = session
    ? `cart:${session.restaurant.slug}:${session.table.tableNumber}`
    : null;
  
  const [cart, setCart] = useState(() => {
    if (!cartKey) return [];
    try {
      const raw = localStorage.getItem(cartKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Persist cart whenever it or the key changes
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, cartKey]);

  // Reload cart when session changes (after QR scan)
  useEffect(() => {
    if (cartKey) {
      try {
        const raw = localStorage.getItem(cartKey);
        setCart(raw ? JSON.parse(raw) : []);
      } catch { setCart([]); }
    }
  }, [cartKey]);

  const saveSession = useCallback((restaurantData, tableData, qrToken) => {
    const newSession = { restaurant: restaurantData, table: tableData, qrToken };
    setSession(newSession);
    sessionStorage.setItem(`dynease-session:${restaurantData.slug}`, JSON.stringify(newSession));
  }, []);

  const clearSession = useCallback(() => {
    if (slug) sessionStorage.removeItem(`dynease-session:${slug}`);
    setSession(null);
    setCart([]);
  }, [slug]);

  // ── Cart helpers ──────────────────────────────────────────────

  const addToCart = useCallback((item) => {
    // item = { menuItemId, name, price, imageUrl, dietaryPreference }
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((menuItemId) => {
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    if (quantity < 1) {
      setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
    } else {
      setCart(prev =>
        prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Orders tracking ──
  const myOrdersKey = session
    ? `orders:${session.restaurant.slug}:${session.table.tableNumber}`
    : null;
    
  const [myOrders, setMyOrders] = useState(() => {
    if (!myOrdersKey) return [];
    try {
      const raw = localStorage.getItem(myOrdersKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (myOrdersKey) {
      localStorage.setItem(myOrdersKey, JSON.stringify(myOrders));
    }
  }, [myOrders, myOrdersKey]);

  useEffect(() => {
    if (myOrdersKey) {
      try {
        const raw = localStorage.getItem(myOrdersKey);
        setMyOrders(raw ? JSON.parse(raw) : []);
      } catch { setMyOrders([]); }
    }
  }, [myOrdersKey]);

  const addOrderId = useCallback((id) => {
    setMyOrders(prev => {
      if (!prev.includes(id)) return [id, ...prev];
      return prev;
    });
  }, []);

  return (
    <RestaurantContext.Provider value={{
      slug,
      session,
      saveSession,
      clearSession,
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      myOrders,
      addOrderId
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used inside RestaurantProvider');
  return ctx;
}
