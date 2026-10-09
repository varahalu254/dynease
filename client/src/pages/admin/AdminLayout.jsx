import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, DollarSign, Settings, LogOut, Megaphone, MessageSquare, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Restaurant Management', path: '/admin/restaurants', icon: <Store size={20} /> },
    { name: 'Registration Requests', path: '/admin/requests', icon: <Store size={20} /> },
    { name: 'Ads Management', path: '/admin/ads', icon: <Megaphone size={20} /> },
    { name: 'Custom Message', path: '/admin/messages', icon: <MessageSquare size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Revenue', path: '/admin/analytics', icon: <DollarSign size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out lg:static lg:h-screen overflow-hidden ${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:translate-x-0'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-orange-500 whitespace-nowrap">Dynease Admin</h2>
            <button className="lg:hidden text-slate-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {links.map((link) => {
            const isActive = location.pathname.includes(link.path) && (link.path !== '/admin' || location.pathname === '/admin');
            return (
              <Link 
                key={link.path}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={link.name}
              >
                <div className="shrink-0">{link.icon}</div>
                <span className="whitespace-nowrap">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full transition-colors" title="Logout">
            <div className="shrink-0"><LogOut size={20} /></div>
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-4 lg:px-8 justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 truncate">Super Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
              SA
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
