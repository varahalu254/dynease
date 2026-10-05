import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, DollarSign, Settings, Megaphone, MessageSquare, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const shortcuts = [
    {
      title: 'Restaurant Management',
      description: 'Manage approved restaurants and their details',
      path: '/admin/restaurants',
      icon: <Store size={32} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Registration Requests',
      description: 'Review and approve new restaurant sign-ups',
      path: '/admin/requests',
      icon: <FileText size={32} />,
      color: 'bg-green-500'
    },
    {
      title: 'Ads Management',
      description: 'Manage platform advertisements and banners',
      path: '/admin/ads',
      icon: <Megaphone size={32} />,
      color: 'bg-purple-500'
    },
    {
      title: 'Custom Message',
      description: 'Send custom WhatsApp messages to numbers',
      path: '/admin/messages',
      icon: <MessageSquare size={32} />,
      color: 'bg-teal-500'
    },
    {
      title: 'Users',
      description: 'Manage all users across the platform',
      path: '/admin/users',
      icon: <Users size={32} />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Revenue Analytics',
      description: 'View platform revenue and order statistics',
      path: '/admin/analytics',
      icon: <DollarSign size={32} />,
      color: 'bg-emerald-500'
    },
    {
      title: 'Settings',
      description: 'Configure platform fees and general settings',
      path: '/admin/settings',
      icon: <Settings size={32} />,
      color: 'bg-gray-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Dynease Admin</h1>
        <p className="text-gray-500 mt-2">Select a module below to start managing the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {shortcuts.map((shortcut, index) => (
          <Link
            key={index}
            to={shortcut.path}
            className="group flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className={`h-2 w-full ${shortcut.color}`}></div>
            <div className="p-6 flex-1 flex flex-col">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200 ${shortcut.color}`}>
                {shortcut.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{shortcut.title}</h3>
              <p className="text-sm text-gray-500 flex-1">{shortcut.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
