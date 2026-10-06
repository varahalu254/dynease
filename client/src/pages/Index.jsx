import React from 'react';
import { ArrowRight, QrCode, Smartphone, ChefHat, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-4 md:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Dine Smarter. <span className="text-orange-600">Order Faster.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Turn every restaurant table into a seamless digital ordering experience. Scan. Order. Enjoy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/how-it-works" className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 pt-8 md:pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run a modern restaurant</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A complete multi-tenant SaaS solution designed to streamline operations and enhance customer experience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<QrCode size={32} className="text-orange-600" />}
              title="QR Table Ordering"
              desc="Generate unique QR codes for every table. Customers scan to view your beautiful digital menu instantly."
            />
            <FeatureCard 
              icon={<ChefHat size={32} className="text-orange-600" />}
              title="Kitchen Display System"
              desc="Real-time order syncing directly to your kitchen. Track prep times and manage orders effortlessly."
            />
            <FeatureCard 
              icon={<LineChart size={32} className="text-orange-600" />}
              title="Restaurant Analytics"
              desc="Understand your business better with deep insights into sales, popular items, and peak hours."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
