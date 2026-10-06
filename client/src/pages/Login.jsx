import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import iconImage from '../assets/icon.png';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-login if token is passed in URL (Cross-subdomain SSO)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');
    if (token) {
      localStorage.setItem('token', token);
      if (role === 'RESTAURANT_STAFF') navigate('/waiter');
      else if (role === 'KITCHEN_STAFF') navigate('/kitchen/orders');
      else navigate('/restaurant');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const currentHostname = window.location.hostname;
      let subdomain = '';
      if (currentHostname.includes('localhost') && currentHostname !== 'localhost') {
        subdomain = currentHostname.split('.')[0];
      } else if (currentHostname.includes('dynease.in') && currentHostname !== 'dynease.in') {
        subdomain = currentHostname.split('.')[0];
      }

      const headers = { 'Content-Type': 'application/json' };
      if (subdomain && subdomain !== 'admin') {
        headers['x-tenant-subdomain'] = subdomain;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        const user = data.data.user;
        const token = data.token;
        
        // If it's a super admin
        if (user.role === 'SUPER_ADMIN') {
          localStorage.setItem('token', token);
          if (window.location.hostname.startsWith('admin.')) {
            navigate('/');
          } else {
            window.location.href = window.location.hostname.includes('localhost') 
              ? 'http://admin.localhost:5173' 
              : 'https://admin.dynease.in';
          }
          return;
        }

        // If it's a restaurant owner, waiter, or kitchen staff
        if (['RESTAURANT_OWNER', 'RESTAURANT_STAFF', 'KITCHEN_STAFF'].includes(user.role) && user.restaurantId) {
          const expectedSlug = user.restaurantId.slug;
          const currentHostname = window.location.hostname;
          
          let isOnCorrectSubdomain = false;
          if (currentHostname.includes('localhost')) {
             isOnCorrectSubdomain = currentHostname === `${expectedSlug}.localhost`;
          } else {
             isOnCorrectSubdomain = currentHostname === `${expectedSlug}.dynease.in`;
          }

          let dashboardPath = '/restaurant';
          if (user.role === 'RESTAURANT_STAFF') dashboardPath = '/waiter';
          if (user.role === 'KITCHEN_STAFF') dashboardPath = '/kitchen/orders';

          if (isOnCorrectSubdomain) {
            // Logged in directly on their subdomain
            localStorage.setItem('token', token);
            navigate(dashboardPath);
          } else {
            // Logged in on the main domain (or wrong subdomain), redirect to their subdomain with token
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : '';
            const domain = currentHostname.includes('localhost') ? 'localhost' : 'dynease.in';
            
            window.location.href = `${protocol}//${expectedSlug}.${domain}${port}/login?token=${token}&role=${user.role}`;
          }
        } else {
           setError('Invalid account type.');
        }

      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-orange-600">
            <img src={iconImage} alt="Dynease Logo" className="w-10 h-10" />
            Dynease
          </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
            register your restaurant today
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-orange-100/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                <AlertCircle className="text-red-500 h-5 w-5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile Number or Email
              </label>
              <div className="mt-1">
                <input
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                  placeholder="Enter your registered mobile number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-3 pr-10 bg-white text-gray-900 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
