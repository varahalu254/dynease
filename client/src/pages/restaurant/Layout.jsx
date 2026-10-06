import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Grid, LogOut, Users, FolderOpen } from 'lucide-react';

export default function RestaurantLayout() {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-500">Restaurant Panel</h2>
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
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-8 justify-between shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Restaurant Dashboard</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
