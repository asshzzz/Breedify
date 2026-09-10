import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { authAPI, setAuthToken, setUserData, isAuthenticated } from '../api';
import breedifyLogo from '../assets/breedify_logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Call login API from api.js
      const response = await authAPI.login(formData);

      // Check if response has token and user data
      if (response && response.token) {
        // Save token and user data
        setAuthToken(response.token);
        setUserData(response.user);

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      // Error handling from api.js interceptor
      setError(err || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.googleLogin(credential);
      if (!response?.token) {
        throw new Error('Invalid response from Google sign-in.');
      }
      setAuthToken(response.token);
      setUserData(response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || err || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4 relative">
      <div className="absolute top-4 left-4 flex items-center gap-2.5">
        <img src={breedifyLogo} alt="Logo" className="h-14 w-14 object-contain" />
        <span className="text-lg font-semibold tracking-tight text-[#111827]">Breedify</span>
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <p className="text-[#6B7280] text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5]/60 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-[#DC2626] mt-0.5 flex-shrink-0" size={18} />
              <p className="text-[#DC2626] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-[#374151] text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none transition-colors"
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[#374151] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#166534] rounded focus:ring-2 focus:ring-[#166534]/30"
                />
                <span className="text-sm text-[#6B7280]">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#166534] hover:text-[#14532D] font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#166534] text-white text-sm font-medium py-3 rounded-full hover:bg-[#14532D] transition-colors disabled:bg-[#9CA3AF] disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-[#9CA3AF]">
            <span className="h-px flex-1 bg-[#E5E7EB]" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed.')}
                useOneTap={false}
                width="100%"
              />
            </GoogleOAuthProvider>
          ) : (
            <p className="text-center text-xs text-[#B3261E]">Google sign-in is not configured.</p>
          )}

          <div className="mt-6 text-center">
            <p className="text-[#6B7280] text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#166534] hover:text-[#14532D] font-medium"
              >
                Register here
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

export default Login;