import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';

export default function RegisterRestaurant() {
  const [searchParams] = useSearchParams();
  const defaultPlan = searchParams.get('plan') || 'GROWTH';

  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    type: 'Restaurant',
    phone: '',
    
    ownerName: '',
    ownerPhone: '',
    
    selectedPlan: defaultPlan
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: formData.name,
      subdomain: formData.subdomain,
      type: 'Restaurant',
      phone: formData.ownerPhone,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      selectedPlan: formData.selectedPlan
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Your restaurant registration has been submitted successfully. Our team will review your application.
          </p>
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-8 font-medium border border-yellow-200">
            Status: 🟡 Pending Approval
          </div>
          <p className="text-sm text-gray-500 mb-8">
            You will receive a WhatsApp notification with your login details once your restaurant is approved.
          </p>
          <Link to="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full mb-8">
        <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Register Your Restaurant
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Fill out the details below to start receiving orders digitally.
        </p>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-white py-6 px-6 shadow sm:rounded-xl border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desired Domain *</label>
                <div 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 bg-white flex items-center cursor-text overflow-hidden"
                  onClick={() => document.getElementById('subdomain-input')?.focus()}
                >
                  <div className="relative flex items-center">
                    <span className="invisible whitespace-pre font-sans text-base">{formData.subdomain || 'myrestaurant'}</span>
                    <input 
                      id="subdomain-input"
                      name="subdomain" 
                      type="text" 
                      required 
                      placeholder="myrestaurant"
                      value={formData.subdomain} 
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        handleChange({ target: { name: 'subdomain', value: val } });
                      }} 
                      className="absolute inset-0 outline-none bg-transparent text-gray-900 p-0 border-none focus:ring-0 w-full font-sans text-base" 
                    />
                  </div>
                  <span className="text-gray-500 font-medium select-none ml-0.5">.dynease.in</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Full Name *</label>
                <input name="ownerName" type="text" required value={formData.ownerName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Mobile *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-bold">
                    +91
                  </span>
                  <input 
                    name="ownerPhone" 
                    type="tel" 
                    required 
                    maxLength="10"
                    minLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    placeholder="9876543210"
                    value={formData.ownerPhone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // Allow only digits
                      handleChange({ target: { name: 'ownerPhone', value: val } });
                    }} 
                    className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-r-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white" 
                  />
                </div>
              </div>
          </div>

          {/* SECTION 3: Plan Selection */}
          <div className="bg-white py-8 px-6 shadow sm:rounded-xl border border-gray-100">
            <div className="flex justify-between items-end border-b pb-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choose Your Plan</h3>
              <Link to="/pricing" target="_blank" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                View all plan details <ExternalLink size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Free Plan */}
              <label className={`relative flex flex-col p-5 cursor-pointer rounded-xl border-2 transition-all ${formData.selectedPlan === 'FREE' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <input type="radio" name="selectedPlan" value="FREE" checked={formData.selectedPlan === 'FREE'} onChange={handleChange} className="sr-only" />
                <span className="text-lg font-bold text-gray-900">FREE</span>
                <span className="text-xl font-extrabold text-gray-900 mt-2">₹0<span className="text-sm text-gray-500 font-medium">/month</span></span>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100/50 px-2 py-1 rounded">
                  <Sparkles size={12} /> 14-Day Free Trial
                </div>
              </label>

              {/* Growth Plan */}
              <label className={`relative flex flex-col p-5 cursor-pointer rounded-xl border-2 transition-all ${formData.selectedPlan === 'GROWTH' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <input type="radio" name="selectedPlan" value="GROWTH" checked={formData.selectedPlan === 'GROWTH'} onChange={handleChange} className="sr-only" />
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </div>
                <span className="text-lg font-bold text-gray-900 mt-2">GROWTH</span>
                <span className="text-xl font-extrabold text-gray-900 mt-2">₹999<span className="text-sm text-gray-500 font-medium">/month</span></span>
              </label>

              {/* Pro Plan */}
              <label className={`relative flex flex-col p-5 cursor-pointer rounded-xl border-2 transition-all ${formData.selectedPlan === 'PRO' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <input type="radio" name="selectedPlan" value="PRO" checked={formData.selectedPlan === 'PRO'} onChange={handleChange} className="sr-only" />
                <span className="text-lg font-bold text-gray-900">PRO</span>
                <span className="text-xl font-extrabold text-gray-900 mt-2">₹1,999<span className="text-sm text-gray-500 font-medium">/month</span></span>
              </label>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors">
              {loading ? 'Submitting Registration...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
