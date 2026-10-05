import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, DollarSign, Settings, LogOut, Megaphone } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Restaurant Management', path: '/admin/restaurants', icon: <Store size={20} /> },
    { name: 'Registration Requests', path: '/admin/requests', icon: <Store size={20} /> },
    { name: 'Ads Management', path: '/admin/ads', icon: <Megaphone size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Revenue', path: '/admin/analytics', icon: <DollarSign size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-500">Dynease Admin</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const isActive = location.pathname.includes(link.path) && (link.path !== '/admin' || location.pathname === '/admin');
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
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-8 justify-between shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Super Admin Panel</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
              SA
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
