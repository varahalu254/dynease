import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Smartphone, Link as LinkIcon, ShoppingCart, Zap, ChefHat, 
  LayoutDashboard, TrendingUp, Users, Ticket, Star, UserCheck, 
  Heart, Building2, Palette, Globe, Bell, Shield, Armchair 
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: 'Digital QR Menu',
      icon: <Smartphone size={28} className="text-orange-500" />,
      desc: 'Give every table a beautiful, mobile-friendly digital menu.',
      points: ['Categories', 'Food images', 'Descriptions', 'Pricing', 'Veg / Non-Veg', 'Availability', 'Add-ons', 'Customizations', 'Offers']
    },
    {
      title: 'Your Own Restaurant URL',
      icon: <LinkIcon size={28} className="text-orange-500" />,
      desc: 'Every restaurant gets its own dedicated subdomain. Example: spicegarden.dynease.in',
      points: ['Restaurant-specific URL', 'Easy to share', 'Mobile optimized', 'QR compatible', 'Branded experience']
    },
    {
      title: 'Table-Based Ordering',
      icon: <ShoppingCart size={28} className="text-orange-500" />,
      desc: 'Let customers order directly from their table.',
      points: ['Add to cart', 'Item customization', 'Special instructions', 'Automatic totals', 'Table identification', 'No customer app', 'No customer registration']
    },
    {
      title: 'Real-Time Orders',
      icon: <Zap size={28} className="text-orange-500" />,
      desc: 'Never miss an order. New orders appear instantly across your restaurant system.',
      points: ['Live order alerts', 'Accept / reject orders', 'Order status updates', 'Order history', 'Table-based orders', 'Real-time synchronization']
    },
    {
      title: 'Kitchen Display System',
      icon: <ChefHat size={28} className="text-orange-500" />,
      desc: 'Give your kitchen a dedicated screen for managing orders. NEW → PREPARING → READY → SERVED',
      points: ['Live kitchen orders', 'Preparation timers', 'Table information', 'Special instructions', 'Priority orders', 'Faster workflow']
    },
    {
      title: 'Smart Table Management',
      icon: <Armchair size={28} className="text-orange-500" />,
      desc: 'Manage every table from one dashboard.',
      points: ['Create tables', 'Table numbers', 'Table names', 'Active / inactive tables', 'Stable QR codes', 'Download QR', 'Print QR', 'Table management']
    },
    {
      title: 'Restaurant Dashboard',
      icon: <LayoutDashboard size={28} className="text-orange-500" />,
      desc: 'Everything important at a glance.',
      points: ["Today's orders", 'Revenue', 'Pending orders', 'Preparing orders', 'Completed orders', 'Active tables', 'Popular dishes', 'Sales overview']
    },
    {
      title: 'Analytics & Reports',
      icon: <TrendingUp size={28} className="text-orange-500" />,
      desc: 'Turn restaurant data into useful business insights.',
      points: ['Sales reports', 'Revenue trends', 'Order analytics', 'Top-selling dishes', 'Peak hours', 'Average order value', 'Category performance', 'Branch performance']
    },
    {
      title: 'Staff Management',
      icon: <Users size={28} className="text-orange-500" />,
      desc: 'Give your team the right access.',
      points: ['Staff accounts', 'Restaurant staff', 'Kitchen staff', 'Role-based permissions', 'Access control', 'Staff activity']
    },
    {
      title: 'Offers & Coupons',
      icon: <Ticket size={28} className="text-orange-500" />,
      desc: 'Create offers that encourage customers to order more.',
      points: ['Discount coupons', 'Percentage discounts', 'Item-based offers', 'Promotional campaigns', 'Limited-time offers']
    },
    {
      title: 'Customer Reviews',
      icon: <Star size={28} className="text-orange-500" />,
      desc: 'Understand what your customers think.',
      points: ['Ratings', 'Reviews', 'Feedback', 'Review management', 'Customer satisfaction insights']
    },
    {
      title: 'Customer CRM',
      icon: <UserCheck size={28} className="text-orange-500" />,
      desc: 'Build stronger relationships with your customers.',
      points: ['Customer profiles', 'Order history', 'Repeat customer tracking', 'Customer activity', 'Customer segmentation']
    },
    {
      title: 'Loyalty Program',
      icon: <Heart size={28} className="text-orange-500" />,
      desc: 'Turn occasional visitors into regular customers.',
      points: ['Loyalty points', 'Rewards', 'Special offers', 'Repeat-order incentives', 'Customer engagement']
    },
    {
      title: 'Multiple Branches',
      icon: <Building2 size={28} className="text-orange-500" />,
      desc: 'Built for restaurants that are growing.',
      points: ['Multiple branches', 'Centralized management', 'Branch-wise orders', 'Branch-wise analytics', 'Performance comparison']
    },
    {
      title: 'Multiple Kitchens',
      icon: <ChefHat size={28} className="text-orange-500" />,
      desc: 'Manage complex kitchen operations with ease.',
      points: ['Multiple kitchen stations', 'Station-based orders', 'Kitchen assignment', 'Preparation tracking', 'Kitchen performance']
    },
    {
      title: 'Custom Branding',
      icon: <Palette size={28} className="text-orange-500" />,
      desc: 'Make your digital ordering experience feel like your restaurant.',
      points: ['Restaurant logo', 'Brand colors', 'Branded menu', 'Custom customer experience', 'Remove platform branding']
    },
    {
      title: 'Custom Domain',
      icon: <Globe size={28} className="text-orange-500" />,
      desc: 'For restaurants that want their own web address. Give customers a completely branded ordering experience.',
      points: ['Your default URL: spicegarden.dynease.in', 'With custom domain: order.spicegarden.com']
    },
    {
      title: 'Smart Notifications',
      icon: <Bell size={28} className="text-orange-500" />,
      desc: 'Keep restaurant teams and customers informed.',
      points: ['Restaurant: New order alerts, updates', 'Customer: Order confirmation, status, ready', 'Owner: Registration approval, subscription alerts']
    },
    {
      title: 'Secure Multi-Restaurant Platform',
      icon: <Shield size={28} className="text-orange-500" />,
      desc: 'Built from the ground up for multiple restaurants.',
      points: ['Secure authentication', 'Role-based access', 'Restaurant data isolation', 'Protected APIs', 'Secure QR tokens', 'Admin controls']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-100 text-orange-700 font-bold px-4 py-1.5 rounded-full text-sm mb-4">
            ✨ Features
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Everything Your Restaurant Needs to Go Digital</h1>
          <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto">
            Powerful tools to simplify ordering, improve kitchen operations, understand customers, and grow your restaurant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 font-medium mb-6">{feature.desc}</p>
              
              <ul className="space-y-2">
                {feature.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start text-sm text-gray-500">
                    <span className="text-orange-500 mr-2 font-bold">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
