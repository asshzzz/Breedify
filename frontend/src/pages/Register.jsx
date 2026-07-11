import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI, isAuthenticated } from '../api.js';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    location: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    // Name validation
    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Location validation
    if (formData.location.trim().length < 2) {
      setError('Please enter a valid location');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare data for backend (remove confirmPassword)
      const { confirmPassword, ...registrationData } = formData;

      // Call register API from api.js
      const response = await authAPI.register(registrationData);

      if (response) {
        setSuccess('Registration successful! Redirecting to login...');

        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          location: ''
        });

        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-lg font-semibold tracking-tight text-[#111827]">ATC System</span>
          </Link>
          <p className="text-[#6B7280] text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5]/60 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-[#DC2626] mt-0.5 flex-shrink-0" size={18} />
              <p className="text-[#DC2626] text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-start gap-3">
              <CheckCircle className="text-[#166534] mt-0.5 flex-shrink-0" size={18} />
              <p className="text-[#166534] text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter your name"
                    disabled={loading}
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Email Address <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="your.email@example.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Phone Number <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Location <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="City, State"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Role <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none transition-colors"
                  disabled={loading}
                  required
                >
                  <option value="user">user</option>
                  <option value="admin">Admin</option>
                  <option value="Evaluator">Evaluator</option>
                </select>
              </div>

              <div>
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Password <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Minimum 6 characters"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#374151] text-sm font-medium mb-2">
                  Confirm Password <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Re-enter password"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 text-[#166534] rounded focus:ring-2 focus:ring-[#166534]/30"
                  required
                  disabled={loading}
                />
                <span className="text-sm text-[#6B7280]">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#166534] text-white text-sm font-medium py-3 rounded-full hover:bg-[#14532D] transition-colors disabled:bg-[#9CA3AF] disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#6B7280] text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#166534] hover:text-[#14532D] font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#111827] text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;