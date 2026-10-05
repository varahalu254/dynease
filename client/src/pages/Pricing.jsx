import React from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Pricing() {
  const tiers = [
    {
      name: 'FREE',
      price: '₹0',
      icon: <Check className="text-gray-400" size={24} />,
      description: 'FOR GETTING STARTED',
      features: [
        '1 Restaurant',
        'Up to 3 Tables',
        'Up to 20 Menu Items',
        'QR Menu',
        'Basic Ordering',
        'Basic Dashboard',
        'Basic Analytics',
        'Platform Branding'
      ],
      buttonText: 'Start 14-Day Free Trial',
      cardStyle: 'bg-white text-gray-900 border border-gray-200',
      buttonStyle: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      checkColor: 'text-gray-400',
      featureText: 'text-gray-600'
    },
    {
      name: 'GROWTH',
      price: '₹999',
      popular: true,
      icon: <Zap className="text-orange-100" size={24} />,
      description: 'MOST POPULAR',
      features: [
        'Unlimited Tables',
        'Unlimited Menu Items',
        'Live Orders',
        'Kitchen Display',
        'Staff Accounts',
        'Offers & Coupons',
        'Advanced Analytics',
        'Customer Reviews',
        'No Platform Branding'
      ],
      buttonText: 'Choose Growth',
      cardStyle: 'bg-gradient-to-b from-orange-500 to-red-600 text-white shadow-2xl shadow-orange-500/40 transform md:-translate-y-4 border-none scale-105',
      buttonStyle: 'bg-white text-orange-600 hover:bg-gray-50',
      checkColor: 'text-orange-200',
      featureText: 'text-white/90'
    },
    {
      name: 'PRO',
      price: '₹1,999',
      icon: <Crown className="text-yellow-500" size={24} />,
      description: 'FOR GROWING RESTAURANTS',
      features: [
        'Everything in Growth',
        'Multiple Branches',
        'Multiple Kitchens',
        'Customer CRM',
        'Loyalty System',
        'Advanced Reports',
        'Custom Branding',
        'Custom Domain',
        'Priority Support'
      ],
      buttonText: 'GO PRO',
      cardStyle: 'bg-slate-900 text-white border border-slate-700 shadow-xl shadow-slate-900/20',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
      checkColor: 'text-yellow-500',
      featureText: 'text-slate-300'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/50 to-transparent -z-10 pointer-events-none"></div>
      <div className="absolute top-40 right-[-10%] w-96 h-96 bg-orange-300/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-80 left-[-10%] w-72 h-72 bg-red-300/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <Navbar />
      
      {/* Header Section */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-medium text-sm mb-6">
          <Sparkles size={16} /> Transparent Pricing, No Hidden Fees
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl tracking-tight mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          Whether you're just starting out or managing multiple locations, we have the right tools to digitize your restaurant.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`rounded-3xl flex flex-col relative transition-all duration-300 hover:shadow-2xl ${tier.cardStyle}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold tracking-tight">{tier.name}</h3>
                  {tier.icon}
                </div>
                
                <p className={`text-xs font-bold uppercase tracking-wider mb-6 h-4 ${tier.popular ? 'text-white/80' : 'text-gray-400'}`}>
                  {tier.description}
                </p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className={`ml-2 font-medium ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>/mo</span>
                </div>
                
                <Link to="/register" className={`w-full text-center py-3.5 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${tier.buttonStyle}`}>
                  {tier.buttonText}
                  <span className="text-lg leading-none">→</span>
                </Link>

                <div className={`mt-8 pt-8 border-t ${tier.popular ? 'border-white/20' : 'border-gray-100'} flex-1`}>
                  <ul className="space-y-4">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <Check className={`h-5 w-5 ${tier.checkColor}`} />
                        </div>
                        <p className={`ml-3 text-base font-medium ${tier.featureText}`}>{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trial Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">
          
          {/* Subtle bg decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex-1 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-orange-400 font-bold mb-4 bg-orange-400/10 px-4 py-1.5 rounded-full text-sm">
              <Sparkles size={18} />
              <span>14-DAY FREE TRIAL</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Experience the platform free. <br className="hidden md:block" /> No credit card required.
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-3 text-sm text-slate-300 mt-6 font-medium bg-slate-900/50 p-4 rounded-xl inline-flex w-full md:w-auto">
              <span>Start your restaurant</span>
              <span className="hidden md:block text-orange-500">→</span>
              <span>Add your menu</span>
              <span className="hidden md:block text-orange-500">→</span>
              <span>Get QR codes</span>
              <span className="hidden md:block text-orange-500">→</span>
              <span className="text-white">Receive orders</span>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 w-full lg:w-auto text-center">
            <Link to="/register" className="inline-block w-full lg:w-auto bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1">
              Start Your Trial
            </Link>
            <p className="text-sm text-slate-400 mt-4 italic">
              * Choose Growth or Pro after 14 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
