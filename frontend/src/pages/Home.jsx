import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { ArrowRight, Camera, Lock, Mail, Phone, Search, User, UserCircle, SlidersHorizontal, X, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI, isAuthenticated, listingAPI, setAuthToken, setUserData } from '../api';
import breedifyLogo from '../assets/breedify_logo.png';

// Add once to index.html <head>, if not already present:
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

const CATEGORIES = [
  { key: 'cattle', label: 'Cattle' },
  { key: 'buffalo', label: 'Buffalo' },
  { key: 'goats', label: 'Goats' },
];

const SORTS = [
  { key: 'recent', label: 'Most recent' },
  { key: 'price_low', label: 'Price: low to high' },
  { key: 'price_high', label: 'Price: high to low' },
];

const Home = () => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [animalType, setAnimalType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('recent');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await listingAPI.getAll();
        setListings(response.data || response || []);
      } catch {
        setListings([]);
      }
    };
    loadListings();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      setLoginOpen(true);
    }
  };

  const handleSell = () => {
    if (isAuthenticated()) {
      navigate('/sell');
    } else {
      setLoginOpen(true);
      setLoginError('');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill in your email and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await authAPI.login(loginData);
      if (!response?.token) throw new Error('Invalid response from server.');
      setAuthToken(response.token);
      setUserData(response.user);
      setLoginOpen(false);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      setLoginError(error?.message || error || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async ({ credential }) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await authAPI.googleLogin(credential);
      if (!response?.token) throw new Error('Invalid response from Google sign-in.');
      setAuthToken(response.token);
      setUserData(response.user);
      setLoginOpen(false);
      navigate('/dashboard');
    } catch (error) {
      setLoginError(error?.message || error || 'Google sign-in failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (registerData.name.trim().length < 3) return setRegisterError('Name must be at least 3 characters long.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) return setRegisterError('Please enter a valid email address.');
    if (!/^[0-9]{10}$/.test(registerData.phone)) return setRegisterError('Please enter a valid 10-digit phone number.');
    if (registerData.password.length < 6) return setRegisterError('Password must be at least 6 characters long.');
    if (registerData.password !== registerData.confirmPassword) return setRegisterError('Passwords do not match.');

    setRegisterLoading(true);
    try {
      await authAPI.register({ name: registerData.name, email: registerData.email, phone: registerData.phone, password: registerData.password });
      setRegisterSuccess('Registration successful. You can now log in.');
      setRegisterData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    } catch (error) {
      setRegisterError(error?.message || error || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const counts = useMemo(() => {
    const base = { cattle: 0, buffalo: 0, goats: 0 };
    listings.forEach((l) => {
      if (base[l.animalType] !== undefined) base[l.animalType] += 1;
    });
    return base;
  }, [listings]);

  const filteredListings = useMemo(() => {
    let result = listings.filter(
      (listing) =>
        (animalType === 'all' || listing.animalType === animalType) &&
        `${listing.breed} ${listing.location} ${listing.title}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    if (sort === 'price_low') result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price_high') result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    return result;
  }, [listings, animalType, searchTerm, sort]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#7A8172] mb-2">Animal type</p>
        <div className="space-y-1">
          <button
            onClick={() => setAnimalType('all')}
            className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
              animalType === 'all' ? 'bg-[#1F3A2E] text-white' : 'text-[#22291F] hover:bg-[#F0ECE1]'
            }`}
          >
            <span>All animals</span>
            <span className={animalType === 'all' ? 'text-white/70' : 'text-[#A9B09E]'}>
              {listings.length}
            </span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setAnimalType(c.key)}
              className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                animalType === c.key ? 'bg-[#1F3A2E] text-white' : 'text-[#22291F] hover:bg-[#F0ECE1]'
              }`}
            >
              <span>{c.label}</span>
              <span className={animalType === c.key ? 'text-white/70' : 'text-[#A9B09E]'}>
                {counts[c.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-[#7A8172] mb-2">Sort by</p>
        <div className="space-y-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                sort === s.key ? 'bg-[#F0ECE1] text-[#1F3A2E] font-medium' : 'text-[#5B6357] hover:bg-[#F5F2EA]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSell}
        className="flex items-center justify-center gap-2 bg-[#1F3A2E] text-white rounded-md py-2.5 text-sm font-medium hover:bg-[#173025] transition-colors"
      >
        List your animal <ArrowRight size={15} />
      </button>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-white text-[#22291F]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`.font-display { font-family: 'Archivo', system-ui, sans-serif; }`}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#EAF4E7]/95 backdrop-blur border-b border-[#C9DEC5]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 lg:px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={breedifyLogo} alt="Breedify" className="h-9 w-9 object-contain" />
            <span className="font-display text-lg font-semibold text-[#1F3A2E]">Breedify</span>
          </Link>

          <div className="relative w-[min(50vw,36rem)]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9186]" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Breed or location"
              aria-label="Search listings by breed or location"
              className="w-full rounded-md border border-[#C9DEC5] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#1F3A2E]"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleSell}
              className="inline-flex items-center text-sm font-medium text-white bg-[#1F3A2E] px-3.5 py-2 rounded-md hover:bg-[#173025] transition-colors"
            >
              Sell
            </button>
            {isAuthenticated() && (
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex text-sm font-medium text-white bg-[#1F3A2E] px-3.5 py-2 rounded-md hover:bg-[#173025] transition-colors"
              >
                Breed prediction
              </Link>
            )}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                  aria-label="Open account menu"
                  aria-expanded={profileMenuOpen}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DFD3] text-[#1F3A2E] hover:bg-[#EFEAE0] transition-colors"
                >
                  <UserCircle size={20} />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-[#E4DFD3] bg-white p-1.5 shadow-lg">
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F5F2EA]"
                    >
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setProfileMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#B3261E] hover:bg-[#FBEAE9]"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button type="button" onClick={() => { setLoginOpen(true); setLoginError(''); }} className="inline-flex items-center text-sm font-medium text-white bg-[#1F3A2E] px-3.5 py-2 rounded-md hover:bg-[#173025] transition-colors">
                  Log in
                </button>
                <button type="button" onClick={() => { setRegisterOpen(true); setRegisterError(''); setRegisterSuccess(''); }} className="text-sm font-medium text-white bg-[#1F3A2E] px-4 py-2 rounded-md hover:bg-[#173025] transition-colors">
                  Register
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {loginOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#12251D]/60 px-4 py-8 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div className="relative my-auto w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setLoginOpen(false)} aria-label="Close login" className="absolute right-4 top-4 rounded-full p-1.5 text-[#6B7280] hover:bg-[#F0F4EE] hover:text-[#1F3A2E]"><X size={20} /></button>
            <div className="mb-6 pr-8">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B8E23]">Welcome back</p>
              <h2 id="login-title" className="mt-2 font-display text-2xl font-semibold text-[#1F3A2E]">Log in to Breedify</h2>
              <p className="mt-2 text-sm text-[#7A8172]">Continue browsing and selling livestock.</p>
            </div>

            {loginError && <div className="mb-5 flex items-start gap-2 rounded-md border border-[#F0C7C3] bg-[#FBEAE9] p-3 text-sm text-[#B3261E]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{loginError}</span></div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm font-medium text-[#374151]">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input type="email" value={loginData.email} onChange={(event) => setLoginData({ ...loginData, email: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="you@example.com" disabled={loginLoading} /></div></label>
              <label className="block text-sm font-medium text-[#374151]">Password<div className="relative mt-2"><Lock className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input type="password" value={loginData.password} onChange={(event) => setLoginData({ ...loginData, password: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="Enter your password" minLength={6} disabled={loginLoading} /></div></label>
              <button type="submit" disabled={loginLoading} className="flex w-full items-center justify-center rounded-md bg-[#1F3A2E] py-3 text-sm font-medium text-white transition-colors hover:bg-[#173025] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">{loginLoading ? 'Signing in...' : 'Log in'}</button>
            </form>
            <div className="my-5 flex items-center gap-3 text-xs text-[#9CA3AF]"><span className="h-px flex-1 bg-[#E4DFD3]" /><span>OR</span><span className="h-px flex-1 bg-[#E4DFD3]" /></div>
            {googleClientId ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setLoginError('Google sign-in was cancelled or failed.')} useOneTap={false} width="100%" />
              </GoogleOAuthProvider>
            ) : (
              <p className="text-center text-xs text-[#B3261E]">Google sign-in is not configured.</p>
            )}
            <p className="mt-5 text-center text-sm text-[#7A8172]">Don&apos;t have an account? <button type="button" onClick={() => { setLoginOpen(false); setRegisterOpen(true); }} className="font-medium text-[#1F3A2E] hover:underline">Register here</button></p>
          </div>
        </div>
      )}

      {registerOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#12251D]/60 px-4 py-8 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="register-title">
          <div className="relative my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setRegisterOpen(false)} aria-label="Close registration" className="absolute right-4 top-4 rounded-full p-1.5 text-[#6B7280] hover:bg-[#F0F4EE] hover:text-[#1F3A2E]"><X size={20} /></button>
            <div className="mb-6 pr-8"><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B8E23]">Join Breedify</p><h2 id="register-title" className="mt-2 font-display text-2xl font-semibold text-[#1F3A2E]">Create your account</h2><p className="mt-2 text-sm text-[#7A8172]">Buy and sell livestock from one marketplace.</p></div>
            {registerError && <div className="mb-5 flex items-start gap-2 rounded-md border border-[#F0C7C3] bg-[#FBEAE9] p-3 text-sm text-[#B3261E]"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{registerError}</span></div>}
            {registerSuccess && <div className="mb-5 flex items-start gap-2 rounded-md border border-[#C9DEC5] bg-[#EAF4E7] p-3 text-sm text-[#27613A]"><CheckCircle size={17} className="mt-0.5 shrink-0" /><span>{registerSuccess}</span></div>}
            <form onSubmit={handleRegister} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[#374151]">Full name<div className="relative mt-2"><User className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input required minLength={3} value={registerData.name} onChange={(event) => setRegisterData({ ...registerData, name: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="Your name" disabled={registerLoading} /></div></label>
              <label className="text-sm font-medium text-[#374151]">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input required type="email" value={registerData.email} onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="you@example.com" disabled={registerLoading} /></div></label>
              <label className="text-sm font-medium text-[#374151]">Phone number<div className="relative mt-2"><Phone className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input required pattern="[0-9]{10}" value={registerData.phone} onChange={(event) => setRegisterData({ ...registerData, phone: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="10-digit number" disabled={registerLoading} /></div></label>
              <label className="text-sm font-medium text-[#374151]">Password<div className="relative mt-2"><Lock className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input required minLength={6} type="password" value={registerData.password} onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="Minimum 6 characters" disabled={registerLoading} /></div></label>
              <label className="text-sm font-medium text-[#374151] sm:col-span-2">Confirm password<div className="relative mt-2"><Lock className="absolute left-3 top-3 text-[#9CA3AF]" size={17} /><input required minLength={6} type="password" value={registerData.confirmPassword} onChange={(event) => setRegisterData({ ...registerData, confirmPassword: event.target.value })} className="w-full rounded-md border border-[#E4DFD3] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F3A2E]" placeholder="Re-enter your password" disabled={registerLoading} /></div></label>
              <button type="submit" disabled={registerLoading} className="sm:col-span-2 flex w-full items-center justify-center rounded-md bg-[#1F3A2E] py-3 text-sm font-medium text-white transition-colors hover:bg-[#173025] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">{registerLoading ? 'Creating account...' : 'Create account'}</button>
            </form>
            <p className="mt-5 text-center text-sm text-[#7A8172]">Already have an account? <button type="button" onClick={() => { setRegisterOpen(false); setLoginOpen(true); }} className="font-medium text-[#1F3A2E] hover:underline">Log in</button></p>
          </div>
        </div>
      )}

      {/* App shell: sidebar + content */}
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-[#E4DFD3] px-5 py-6 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <FilterPanel />
        </aside>

        {/* Main */}
        <main className="flex-1 px-5 lg:px-8 py-6 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display text-xl font-semibold text-[#1F3A2E]">
                {animalType === 'all' ? 'All listings' : CATEGORIES.find((c) => c.key === animalType)?.label}
              </h1>
              <p className="text-sm text-[#7A8172] mt-0.5">{filteredListings.length} animals available</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 border border-[#E4DFD3] rounded-md px-3 py-2 text-sm font-medium text-[#1F3A2E]"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>

          {/* Listing grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.slice(0, 8).map((listing) => (
              <Link
                key={listing._id}
                to={`/listing/${listing._id}`}
                className="group flex aspect-square min-w-0 flex-col rounded-lg border border-[#E4DFD3] bg-white p-3 transition-colors hover:border-[#C9BFA8]"
              >
                <div className="relative h-1/2 shrink-0 overflow-hidden rounded-md bg-[#F0ECE1]">
                  {listing.images?.[0]?.imageUrl ? (
                    <img
                      src={`${listing.images[0].imageUrl.startsWith('http') ? '' : 'http://localhost:8000'}${listing.images[0].imageUrl}`}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#A9B09E]">
                      <Camera size={24} />
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col justify-between pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[#22291F] truncate">{listing.title}</h3>
                        <span className="shrink-0 flex items-center gap-1 text-xs text-[#7A8172]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6B8E23]" />
                          {listing.animalType}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#7A8172]">
                        {listing.breed} · {listing.sex}
                      </p>
                    </div>
                    <p className="shrink-0 font-display font-semibold text-[#1F3A2E]">
                      ₹{Number(listing.price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7A8172]">{listing.location}</span>
                    <span className="text-[#3F7A4F] font-medium">Available</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#C9BFA8] bg-[#F5F2EA] py-16 text-center">
              <p className="font-medium text-[#1F3A2E]">No listings match yet</p>
              <p className="mt-2 text-sm text-[#7A8172]">Try a different search, or be the first to list here.</p>
              <button
                type="button"
                onClick={handleSell}
                className="mt-5 inline-flex bg-[#1F3A2E] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#173025] transition-colors"
              >
                Create a listing
              </button>
            </div>
          )}

          {filteredListings.length > 8 && (
            <div className="mt-6 text-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 border border-[#C9BFA8] px-5 py-3 rounded-md text-sm font-medium text-[#1F3A2E] hover:bg-[#F0ECE1] transition-colors"
              >
                View all animals <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-[#FAF8F3] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-semibold text-[#1F3A2E]">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={18} className="text-[#5B6357]" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;