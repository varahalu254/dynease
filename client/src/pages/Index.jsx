import React from 'react';
import { ArrowRight, QrCode, ChefHat, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[var(--color-text)] mb-6 leading-[1.1]">
            Dine smarter. <span className="text-[var(--color-text-muted)] italic">Order faster.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Turn every restaurant table into a seamless digital ordering experience. Elevate your service with our refined platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-8 py-3.5 rounded-[var(--radius-sm)] font-medium text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-colors">
              Get Started
            </Link>
            <Link to="/how-it-works" className="bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-8 py-3.5 rounded-[var(--radius-sm)] font-medium text-sm tracking-wide uppercase flex items-center justify-center transition-colors">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white pt-16 md:pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-text)] mb-4">Everything you need</h2>
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto font-light">
              A comprehensive platform designed to streamline operations and enhance the guest experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<QrCode size={24} className="text-[var(--color-accent)]" />}
              title="QR Table Ordering"
              desc="Generate unique QR codes for every table. Guests scan to view a beautiful digital menu instantly without downloading an app."
            />
            <FeatureCard 
              icon={<ChefHat size={24} className="text-[var(--color-accent)]" />}
              title="Kitchen Display"
              desc="Real-time order syncing directly to your kitchen staff. Track preparation times and manage order flow effortlessly."
            />
            <FeatureCard 
              icon={<LineChart size={24} className="text-[var(--color-accent)]" />}
              title="Actionable Analytics"
              desc="Understand your business better with deep insights into sales, popular menu items, and peak operational hours."
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
    <div className="bg-white p-8 border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:border-[var(--color-primary-light)] transition-colors group">
      <div className="w-12 h-12 flex items-center justify-center mb-6 border border-[var(--color-border)] rounded-full group-hover:bg-[var(--color-background)] transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-serif text-[var(--color-text)] mb-3">{title}</h3>
      <p className="text-[var(--color-text-muted)] font-light leading-relaxed">{desc}</p>
    </div>
  );
}
