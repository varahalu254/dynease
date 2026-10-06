import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import HomePage from './pages/customer/HomePage';
import ItemDescription from './pages/customer/ItemDescription';
import Cart from './pages/customer/Cart';
import FeedbackForm from './pages/customer/FeedbackForm';
import QRMenuLoader from './pages/customer/QRMenuLoader';
import Login from './pages/Login';
import KitchenOrders from './pages/kitchen/Orders';
import TablesManagement from './pages/restaurant/TablesManagement';
import AdminLayout from './pages/admin/AdminLayout';
import AdsManagement from './pages/admin/Adsmanagement';
import RestaurantsManagement from './pages/admin/RestaurentsManagement';
import RequestsManagement from './pages/admin/RequestsManagement';
import CustomMessage from './pages/admin/CustomMessage';
import UsersManagement from './pages/admin/UsersManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantLayout from './pages/restaurant/Layout';
import MenuManagement from './pages/restaurant/MenuManagement';
import About from './pages/About';
import Pricing from './pages/Pricing';
import RegisterRestaurant from './pages/RegisterRestaurant';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import { Loader2 } from 'lucide-react';

function SubdomainWrapper({ subdomain, children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/public/restaurant/${subdomain}/menu`, {
      headers: { 'x-tenant-subdomain': subdomain }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setIsValid(true);
        else setIsValid(false);
      })
      .catch(() => setIsValid(false));
  }, [subdomain]);

  if (isValid === null) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>;
  if (isValid === false) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center"><h1 className="text-4xl text-gray-800 font-bold mb-2">404</h1><p className="text-gray-500 text-lg">Page not available</p></div>;

  return children;
}

function App() {
  const hostname = window.location.hostname;
  let subdomain = null;


  // Detect if we are on a custom subdomain like "test.dynease.in"
  if (hostname.includes('dynease.in') && hostname !== 'dynease.in' && hostname !== 'www.dynease.in') {
    subdomain = hostname.split('.')[0];
  }
  // For local development testing (optional): if you set hosts file for test.localhost
  if (hostname.includes('localhost') && hostname !== 'localhost') {
    subdomain = hostname.split('.')[0];
  }

  // If a valid restaurant subdomain is detected, isolate the routing to just that restaurant
  if (subdomain && subdomain !== 'admin' && subdomain !== 'www') {
    return (
      <SubdomainWrapper subdomain={subdomain}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage forcedSlug={subdomain} />} />
            <Route path="/t/:tableId" element={<HomePage forcedSlug={subdomain} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterRestaurant />} />
            <Route path="/item/:id" element={<ItemDescription />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/admin" element={<Navigate to="/restaurant" replace />} />
            <Route path="/restaurant" element={<RestaurantLayout />}>
            <Route index element={<RestaurantDashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="tables" element={<TablesManagement />} />
            </Route>
            <Route path="*" element={<div className="min-h-screen flex flex-col items-center justify-center p-10 text-center font-bold text-gray-400"><h1 className="text-4xl text-gray-800 mb-2">404</h1>Page not found on this restaurant</div>} />
          </Routes>
        </BrowserRouter>
      </SubdomainWrapper>
    );
  }

  // Handle admin subdomain
  if (subdomain === 'admin') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="restaurants" element={<RestaurantsManagement />} />
            <Route path="requests" element={<RequestsManagement />} />
            <Route path="ads" element={<AdsManagement />} />
            <Route path="messages" element={<CustomMessage />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="restaurants" element={<RestaurantsManagement />} />
            <Route path="requests" element={<RequestsManagement />} />
            <Route path="ads" element={<AdsManagement />} />
            <Route path="messages" element={<CustomMessage />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center font-bold text-gray-400">404 Admin Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/features" element={<Features />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterRestaurant />} />
        
        {/* Customer Routes (Fallback for local dev like /r/test) */}
        <Route path="/r/:slug" element={<HomePage />} />
        <Route path="/item/:id" element={<ItemDescription />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/menu/:qrToken" element={<QRMenuLoader />} />
        
        {/* Kitchen Routes */}
        <Route path="/kitchen/orders" element={<KitchenOrders />} />
        
        {/* Restaurant Routes */}
        <Route path="/restaurant" element={<RestaurantLayout />}>
          <Route index element={<RestaurantDashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="tables" element={<TablesManagement />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="restaurants" element={<RestaurantsManagement />} />
          <Route path="requests" element={<RequestsManagement />} />
          <Route path="ads" element={<AdsManagement />} />
          <Route path="messages" element={<CustomMessage />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
