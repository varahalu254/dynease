import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Store, CheckCircle, Settings, Menu, PlusSquare, 
  QrCode, Smartphone, ChefHat, Utensils, TrendingUp 
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Register Your Restaurant',
      desc: 'Create your account with your restaurant details, owner details, and selected plan. Choose the plan that works best for your restaurant.',
      icon: <Store size={32} className="text-orange-500" />
    },
    {
      num: '02',
      title: 'Get Approved',
      desc: 'Once you submit your registration, our team reviews your details. After approval, you\'ll receive an automated notification with your restaurant account access.',
      icon: <CheckCircle size={32} className="text-green-500" />
    },
    {
      num: '03',
      title: 'Set Up Your Restaurant',
      desc: 'Log in to your restaurant dashboard and add your restaurant information, logo, images, contact details, cuisine, and operating hours.',
      icon: <Settings size={32} className="text-orange-500" />
    },
    {
      num: '04',
      title: 'Build Your Digital Menu',
      desc: 'Create categories and add your dishes with images, descriptions, prices, availability, add-ons, and offers.',
      icon: <Menu size={32} className="text-orange-500" />
    },
    {
      num: '05',
      title: 'Create Your Tables',
      desc: 'Add each table using a table number and an optional table name. Example: Table 01 — Window Table, Table 02 — Family Table.',
      icon: <PlusSquare size={32} className="text-orange-500" />
    },
    {
      num: '06',
      title: 'Generate Stable QR Codes',
      desc: 'Every table gets its own unique, permanent QR code. Download or print the QR code and place it on the corresponding table. One table. One QR. Always connected.',
      icon: <QrCode size={32} className="text-orange-500" />
    },
    {
      num: '07',
      title: 'Customers Scan & Order',
      desc: 'Customers simply scan the QR code with their phone. Scan → Browse → Customize → Cart → Order. No app download. No customer account required.',
      icon: <Smartphone size={32} className="text-orange-500" />
    },
    {
      num: '08',
      title: 'Orders Reach Your Kitchen',
      desc: 'New orders instantly appear on your restaurant dashboard and Kitchen Display System. Your team can see the items, quantities, table number, special instructions, and order time.',
      icon: <ChefHat size={32} className="text-orange-500" />
    },
    {
      num: '09',
      title: 'Prepare & Serve',
      desc: 'Move orders through: NEW → ACCEPTED → PREPARING → READY → SERVED. Customers can follow their order status in real time.',
      icon: <Utensils size={32} className="text-orange-500" />
    },
    {
      num: '10',
      title: 'Manage & Grow',
      desc: 'Use one dashboard to manage your: Orders • Menu • Tables • Staff • Customers • Offers • Analytics. Your Restaurant. Your Tables. Your Orders. One Platform.',
      icon: <TrendingUp size={32} className="text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">How It Works</h1>
          <p className="text-xl text-gray-600 font-medium">From Registration to Real-Time Orders</p>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Get your restaurant online, connect every table, and start accepting digital orders with a simple workflow.
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-[120px] font-black text-gray-50 opacity-50 select-none group-hover:scale-110 transition-transform">
                {step.num}
              </div>
              <div className="shrink-0 bg-orange-50 p-4 rounded-2xl relative z-10">
                {step.icon}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-orange-500 font-bold text-xl">{step.num}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mt-2">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a href="/register" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-5 px-12 rounded-full shadow-xl shadow-orange-200 transition-all transform hover:-translate-y-1">
            Start Your Free Trial
          </a>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
