import React from 'react';
import { ChefHat, Users, Store, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar minimal={true} />

      {/* Hero */}
      <section className="py-20 px-8 text-center bg-orange-50 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Transforming the dining experience, <br/> <span className="text-orange-600">one table at a time.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Dynease was born out of a simple idea: that ordering food at a restaurant should be as delightful as eating it. We're bridging the gap between exceptional culinary craft and modern digital convenience.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store size={32} />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">500+</h3>
            <p className="text-gray-500 font-medium">Partner Restaurants</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">2M+</h3>
            <p className="text-gray-500 font-medium">Happy Diners</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={32} />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">10M+</h3>
            <p className="text-gray-500 font-medium">Orders Processed</p>
          </div>
        </div>
      </section>
      
      <Footer className="mt-auto" />
    </div>
  );
}
