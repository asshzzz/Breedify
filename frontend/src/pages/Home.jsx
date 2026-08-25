import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, BarChart3, Database, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { isAuthenticated } from '../api';
import breedifyLogo from '../assets/breedify_logo.png';

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
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={breedifyLogo}
              alt="Logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-xl font-semibold tracking-tight text-[#173B2D]">Breedify</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-[#24483A] hover:text-[#111827] transition-colors px-3 py-2"
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
                  className="text-sm font-medium text-[#24483A] hover:text-[#111827] transition-colors px-3 py-2"
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
      <section className="relative min-h-[680px] flex items-end overflow-hidden bg-[#173B2D]">
        <img
          src="https://images.pexels.com/photos/4577861/pexels-photo-4577861.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt="Cattle grazing in a pasture"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#10261E]/65" />
        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-10 pt-36 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              <ShieldCheck size={15} /> Rashtriya Gokul Mission
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.03]">
              Better records.<br />Stronger herds.
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/80">
              Make every animal evaluation more consistent with fast, AI-powered breed
              identification and standardized scoring.
            </p>
            <button
              onClick={handleGetStarted}
              className="mt-9 inline-flex items-center gap-3 bg-[#D5F36B] px-6 py-3.5 text-sm font-semibold text-[#173B2D] transition-colors hover:bg-white"
            >
              Start an evaluation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-16 grid max-w-2xl grid-cols-3 border-t border-white/25 pt-5 text-white">
            <div><p className="text-2xl font-semibold">AI</p><p className="mt-1 text-xs text-white/65">Assisted analysis</p></div>
            <div><p className="text-2xl font-semibold">24/7</p><p className="mt-1 text-xs text-white/65">Ready to evaluate</p></div>
            <div><p className="text-2xl font-semibold">1</p><p className="mt-1 text-xs text-white/65">Unified record</p></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">One clear workflow</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[#173B2D]">From image to insight.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#66756D]">Everything your field team needs to capture, understand, and act on animal data.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-[#F4F7F0] border border-[#DCE7D5] p-6 hover:-translate-y-1 hover:border-[#9DBA87] hover:shadow-lg transition-all duration-200"
            >
              <div className="w-11 h-11 bg-[#D5F36B] flex items-center justify-center mb-8">
                <Icon className="text-[#173B2D]" size={20} />
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
      </section>

      {/* About Section */}
      <section className="bg-[#173B2D] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20 grid md:grid-cols-[1fr_1.5fr] gap-10 items-start">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            About Rashtriya Gokul Mission
          </h3>
          <p className="text-white/70 text-base leading-relaxed">
            The Government of India's Rashtriya Gokul Mission aims to conserve and develop
            indigenous bovine breeds, genetically upgrade the bovine population, and enhance
            milk productivity. Our AI-driven classification supports this mission by providing
            accurate, consistent, and bias-free animal evaluation for Progeny Testing and
            Pedigree Selection programs.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10261E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Activity size={16} className="text-[#D5F36B]" />
            <span className="text-sm font-medium">Field intelligence, made practical.</span>
          </div>
          <p className="text-right text-xs text-white/45">
            © 2025 · Ministry of Fisheries, Animal Husbandry & Dairying
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;