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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'under_review':
        return 'bg-orange-100 text-orange-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-green-700">ATC System</h1>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg">
              <BarChart3 size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/capture" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <Camera size={20} />
              <span className="font-medium">Capture Image</span>
            </Link>
            <Link to="/upload" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <Upload size={20} />
              <span className="font-medium">Upload Image</span>
            </Link>
            <Link to="/records" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <FileText size={20} />
              <span className="font-medium">Records</span>
            </Link>
            <Link to="/reports" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <BarChart3 size={20} />
              <span className="font-medium">Reports</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar with Back Button */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden">
                <Menu size={24} />
              </button>
              
              {/* 🔙 BACK BUTTON */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Home</span>
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.name || user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Field Worker'}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-semibold">
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
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error loading dashboard</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Total Classifications</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalClassifications}</p>
              <p className="text-sm text-green-600 mt-2">All time records</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Pending Reviews</h3>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Camera className="text-orange-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingReviews}</p>
              <p className="text-sm text-orange-600 mt-2">Awaiting verification</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Completed Today</h3>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.completedToday}</p>
              <p className="text-sm text-green-600 mt-2">Today's progress</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Accuracy Rate</h3>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Settings className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.accuracy}%</p>
              <p className="text-sm text-purple-600 mt-2">AI prediction rate</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/capture" className="flex items-center space-x-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Camera className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Capture New</h4>
                  <p className="text-sm text-gray-600">Take photo for classification</p>
                </div>
              </Link>

              <Link to="/upload" className="flex items-center space-x-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Upload className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Upload Image</h4>
                  <p className="text-sm text-gray-600">Process existing photos</p>
                </div>
              </Link>

              <Link to="/records" className="flex items-center space-x-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">View Records</h4>
                  <p className="text-sm text-gray-600">Browse all classifications</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Classifications</h3>
            <div className="space-y-4">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <div key={record._id || record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {record.imageUrl || record.image_url ? (
                          <img 
                            src={record.imageUrl || record.image_url} 
                            alt="Animal"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {record.animalType || 'Animal'} #{record.tagNumber || record._id?.slice(-6)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {record.breed || 'Unknown Breed'} • Score: {record.confidence || record.classificationScore || 0}/100
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(record.createdAt || record.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {record.status || 'Unknown'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Camera size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No recent classifications yet</p>
                  <Link to="/capture" className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                    Start capturing →
                  </Link>
                </div>
              )}
            </div>

            {recentRecords.length > 0 && (
              <div className="mt-6 text-center">
                <Link to="/records" className="text-green-600 hover:text-green-700 font-medium">
                  View All Records →
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;