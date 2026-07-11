// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, BarChart3, Settings, LogOut, Menu, X, Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { authAPI, recordAPI, clearAuthData, isAuthenticated, getUserData } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalClassifications: 0,
    pendingReviews: 0,
    completedToday: 0,
    accuracy: 0
  });
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

      // Calculate stats from records
      calculateStats(records);

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

  const calculateStats = (records) => {
    if (!Array.isArray(records)) return;

    const total = records.length;

    // Count pending reviews (status: 'pending' or 'under_review')
    const pending = records.filter(r =>
      r.status === 'pending' || r.status === 'under_review'
    ).length;

    // Count completed today
    const today = new Date().toDateString();
    const completedToday = records.filter(r => {
      const recordDate = new Date(r.createdAt || r.created_at).toDateString();
      return recordDate === today && r.status === 'completed';
    }).length;

    // Calculate average accuracy (if confidence scores exist)
    let avgAccuracy = 0;
    const recordsWithConfidence = records.filter(r => r.confidence || r.classificationScore);
    if (recordsWithConfidence.length > 0) {
      const totalConfidence = recordsWithConfidence.reduce((sum, r) =>
        sum + (r.confidence || r.classificationScore || 0), 0
      );
      avgAccuracy = Math.round(totalConfidence / recordsWithConfidence.length);
    }

    setStats({
      totalClassifications: total,
      pendingReviews: pending,
      completedToday: completedToday,
      accuracy: avgAccuracy
    });
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

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-[#ECFDF5] text-[#166534]';
      case 'pending':
      case 'under_review':
        return 'bg-[#FFF7ED] text-[#C2410C]';
      case 'rejected':
        return 'bg-[#FEF2F2] text-[#DC2626]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280]';
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

  const statCards = [
    { label: 'Total Classifications', value: stats.totalClassifications, note: 'All time records', icon: FileText },
    { label: 'Pending Reviews', value: stats.pendingReviews, note: 'Awaiting verification', icon: Camera },
    { label: 'Completed Today', value: stats.completedToday, note: "Today's progress", icon: BarChart3 },
    { label: 'Accuracy Rate', value: `${stats.accuracy}%`, note: 'AI prediction rate', icon: Settings },
  ];

  const quickActions = [
    { to: '/capture', icon: Camera, title: 'Capture New', description: 'Take photo for classification' },
    { to: '/upload', icon: Upload, title: 'Upload Image', description: 'Process existing photos' },
    { to: '/records', icon: FileText, title: 'View Records', description: 'Browse all classifications' },
  ];

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
            <span className="text-lg font-semibold tracking-tight text-[#111827]">ATC System</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#6B7280]">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F0FDF4] text-[#166534] rounded-lg text-sm font-medium">
              <BarChart3 size={18} />
              Dashboard
            </Link>
            <Link to="/capture" className="flex items-center gap-3 px-3.5 py-2.5 text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium transition-colors">
              <Camera size={18} />
              Capture Image
            </Link>
            <Link to="/upload" className="flex items-center gap-3 px-3.5 py-2.5 text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium transition-colors">
              <Upload size={18} />
              Upload Image
            </Link>
            <Link to="/records" className="flex items-center gap-3 px-3.5 py-2.5 text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium transition-colors">
              <FileText size={18} />
              Records
            </Link>
            <Link to="/reports" className="flex items-center gap-3 px-3.5 py-2.5 text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium transition-colors">
              <BarChart3 size={18} />
              Reports
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

              <h2 className="text-lg font-semibold text-[#111827]">Dashboard</h2>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map(({ label, value, note, icon: Icon }) => (
              <div key={label} className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#6B7280] text-sm font-medium">{label}</h3>
                  <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center">
                    <Icon className="text-[#166534]" size={18} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-[#111827]">{value}</p>
                <p className="text-sm text-[#9CA3AF] mt-1.5">{note}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8">
            <h3 className="text-base font-semibold text-[#111827] mb-5">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map(({ to, icon: Icon, title, description }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-4 p-4 border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-xl transition-colors"
                >
                  <div className="w-11 h-11 bg-[#166534] rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-[#111827]">{title}</h4>
                    <p className="text-sm text-[#6B7280]">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-base font-semibold text-[#111827] mb-5">Recent Classifications</h3>
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
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(record.status)}`}>
                      {record.status || 'Unknown'}
                    </span>
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