// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, LogOut, Menu, X, Upload, AlertCircle, ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { authAPI, recordAPI, clearAuthData, isAuthenticated, getUserData } from '../api';
import breedifyLogo from '../assets/breedify_logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch user profile (to ensure fresh data)
      const userProfile = await authAPI.getCurrentUser();
      setUser(userProfile.data || userProfile);

      // Fetch all records to calculate stats
      const allRecords = await recordAPI.getAll();
      const records = allRecords.data || allRecords;

      setTotalRecords(Array.isArray(records) ? records.length : 0);

      // Get recent 3 records
      const recent = records.slice(0, 3);
      setRecentRecords(recent);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err || 'Failed to load dashboard data');

      // If unauthorized, redirect to login
      if (err.includes('401') || err.includes('Unauthorized')) {
        clearAuthData();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API (optional, token will be invalidated)
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local data regardless
      clearAuthData();
      navigate('/login');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#166534] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-[#6B7280]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] transition-transform duration-300`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <img src={breedifyLogo} alt="Logo" className="h-14 w-14 object-contain" />
              <span className="text-lg font-semibold tracking-tight text-[#111827]">Breedify</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#6B7280]">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F0FDF4] text-[#166534] rounded-lg text-sm font-medium">
              <FileText size={18} />
              Image prediction
            </Link>
            <Link to="/records" className="flex items-center gap-3 px-3.5 py-2.5 text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium transition-colors">
              <FileText size={18} />
              Records
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-3.5 py-2.5 text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium transition-colors">
              <Settings size={18} />
              Settings
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#E5E7EB]">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-sm font-medium transition-colors w-full">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[#374151]">
                <Menu size={22} />
              </button>

              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg text-sm font-medium transition-colors group"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                Home
              </button>

              <h2 className="text-lg font-semibold text-[#111827]">Breed prediction</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#111827]">{user?.name || user?.fullName || 'User'}</p>
                <p className="text-xs text-[#9CA3AF]">{user?.role || 'Field Worker'}</p>
              </div>
              <div className="w-9 h-9 bg-[#166534] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {(user?.name || user?.fullName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-[#FEF2F2] border border-[#FCA5A5]/60 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-[#DC2626] mt-0.5 shrink-0" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#DC2626]">Error loading dashboard</p>
                <p className="text-sm text-[#DC2626]/80 mt-1">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Prediction Actions */}
          <section className="mb-8 bg-[#173B2D] p-6 md:p-8 text-white">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D5F36B]">Cattle breed prediction</p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">Turn a cattle photo into a saved record.</h1>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-white/70">Capture a new photo or upload one from your device to identify the breed and save the result.</p>
            </div>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/capture" className="flex items-center justify-between gap-4 bg-[#D5F36B] px-5 py-4 text-sm font-semibold text-[#173B2D] hover:bg-white transition-colors">
                <span className="flex items-center gap-3"><Camera size={19} /> Capture a photo</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/upload" className="flex items-center justify-between gap-4 border border-white/30 px-5 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-3"><Upload size={19} /> Upload an image</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>

          <div className="mb-8 flex items-center justify-between border-b border-[#E5E7EB] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8E23]">Saved data</p>
              <h3 className="mt-1 text-xl font-semibold text-[#173B2D]">Your cattle records <span className="text-[#6B8E23]">({totalRecords})</span></h3>
            </div>
            <Link to="/records" className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] hover:text-[#14532D]">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {/* Recent Saved Predictions */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-base font-semibold text-[#111827] mb-5">Recent breed predictions</h3>
            <div className="space-y-3">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <div key={record._id || record.id} className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#F3F4F6] rounded-lg overflow-hidden shrink-0">
                        {record.imageUrl || record.image_url ? (
                          <img
                            src={record.imageUrl || record.image_url}
                            alt="Animal"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="text-[#9CA3AF]" size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-[#111827]">
                          {record.animalType || 'Animal'} #{record.tagNumber || record._id?.slice(-6)}
                        </h4>
                        <p className="text-sm text-[#6B7280]">
                          {record.breed || 'Unknown breed'} · Score: {record.confidence || record.classificationScore || 0}/100
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">
                          {formatTimeAgo(record.createdAt || record.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
                    <Camera size={18} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm text-[#6B7280] mb-2">No recent classifications yet</p>
                  <Link to="/capture" className="text-sm text-[#166534] hover:text-[#14532D] font-medium">
                    Start capturing →
                  </Link>
                </div>
              )}
            </div>

            {recentRecords.length > 0 && (
              <div className="mt-6 text-center pt-6 border-t border-[#F3F4F6]">
                <Link to="/records" className="text-sm text-[#166534] hover:text-[#14532D] font-medium">
                  View all records →
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;