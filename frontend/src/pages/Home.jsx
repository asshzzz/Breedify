import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, BarChart3, Database } from 'lucide-react';
import { isAuthenticated } from '../api';

const Home = () => {
  const navigate = useNavigate();

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-10" 
                onError={(e) => e.target.style.display = 'none'} 
              />
              <h1 className="text-2xl font-bold text-green-700">ATC System</h1>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated() ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      navigate('/login');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            AI-Powered Animal Type Classification
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Automated scoring system for cattle and buffaloes under Rashtriya Gokul Mission. 
            Standardize animal evaluation with AI-driven precision.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-block px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition shadow-lg cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Camera className="text-green-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Image Capture</h3>
            <p className="text-gray-600">
              Capture high-quality images of cattle and buffaloes for accurate analysis
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Analysis</h3>
            <p className="text-gray-600">
              Automated extraction of body parameters using advanced AI algorithms
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-purple-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Auto Scoring</h3>
            <p className="text-gray-600">
              Generate standardized classification scores with minimal human intervention
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Database className="text-orange-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">BPA Integration</h3>
            <p className="text-gray-600">
              Seamless integration with Bharat Pashudhan App for data management
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-10">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            About Rashtriya Gokul Mission
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            The Government of India's Rashtriya Gokul Mission aims to conserve and develop indigenous 
            bovine breeds, genetically upgrade the bovine population, and enhance milk productivity. 
            Our AI-driven ATC system supports this mission by providing accurate, consistent, and 
            bias-free animal evaluation for Progeny Testing and Pedigree Selection programs.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-300">
            © 2025 Animal Type Classification System | Ministry of Fisheries, Animal Husbandry & Dairying
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;