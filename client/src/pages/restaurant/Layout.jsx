import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Grid, LogOut, Users, FolderOpen, Menu, X } from 'lucide-react';

export default function RestaurantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/restaurant', icon: <LayoutDashboard size={20} /> },
    { name: 'Menu', path: '/restaurant/menu', icon: <Utensils size={20} /> },
    { name: 'Categories', path: '/restaurant/categories', icon: <FolderOpen size={20} /> },
    { name: 'Tables & QR', path: '/restaurant/tables', icon: <Grid size={20} /> },
    { name: 'Staff', path: '/restaurant/staff', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col transition-transform duration-300 w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}>
        <div className="w-64 flex flex-col h-full">
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-orange-500">Restaurant Panel</h2>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          })}
        </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full transition-colors">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-4 md:px-8 justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 truncate">Restaurant Dashboard</h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
