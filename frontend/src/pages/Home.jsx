import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, BarChart3, Database, ArrowRight } from 'lucide-react';
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

  const features = [
    {
      icon: Camera,
      title: "Image Capture",
      description: "Capture high-quality images of cattle and buffaloes for accurate analysis",
    },
    {
      icon: BarChart3,
      title: "AI Analysis",
      description: "Automated extraction of body parameters using advanced AI algorithms",
    },
    {
      icon: FileText,
      title: "Auto Scoring",
      description: "Generate standardized classification scores with minimal human intervention",
    },
    {
      icon: Database,
      title: "BPA Integration",
      description: "Seamless integration with Bharat Pashudhan App for data management",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <span className="text-lg font-semibold tracking-tight text-[#111827]">
              ATC System
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors px-3 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}
                  className="text-sm font-medium text-[#DC2626] border border-[#FCA5A5]/60 px-4 py-2 rounded-lg hover:bg-[#FEF2F2] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-[#166534] px-4 py-2 rounded-lg hover:bg-[#14532D] transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#166534] uppercase mb-4">
              Rashtriya Gokul Mission
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#111827] mb-6 leading-[1.15]">
              AI-powered animal type classification
            </h1>
            <p className="text-base md:text-lg text-[#6B7280] mb-10 leading-relaxed">
              An automated scoring system for cattle and buffaloes — standardizing animal
              evaluation with consistent, AI-driven precision.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 bg-[#166534] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#14532D] transition-colors"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
            <img
              src="https://images.pexels.com/photos/4577861/pexels-photo-4577861.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Cattle grazing in a pasture"
              className="w-full h-72 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-medium">
                Standardized evaluation for indigenous breeds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] flex items-center justify-center mb-5">
                <Icon className="text-[#166534]" size={20} />
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 md:p-12">
          <h3 className="text-xl font-semibold text-[#111827] mb-4">
            About Rashtriya Gokul Mission
          </h3>
          <p className="text-[#6B7280] text-base leading-relaxed">
            The Government of India's Rashtriya Gokul Mission aims to conserve and develop
            indigenous bovine breeds, genetically upgrade the bovine population, and enhance
            milk productivity. Our AI-driven ATC system supports this mission by providing
            accurate, consistent, and bias-free animal evaluation for Progeny Testing and
            Pedigree Selection programs.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-[#9CA3AF]">
            © 2025 Animal Type Classification System · Ministry of Fisheries, Animal Husbandry & Dairying
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;