import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Camera, Search, ShieldCheck, UserCircle } from 'lucide-react';
import { isAuthenticated, listingAPI } from '../api';
import breedifyLogo from '../assets/breedify_logo.png';

const Home = () => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [animalType, setAnimalType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="w-full px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={breedifyLogo}
              alt="Logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-xl font-semibold tracking-tight text-[#173B2D]">Breedify</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/sell"
              className="text-sm font-semibold text-[#173B2D] border border-[#9DBA87] px-4 py-2 rounded-lg hover:bg-[#F0FDF4] transition-colors"
            >
              Sell
            </Link>
            {isAuthenticated() ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-[#173B2D] border border-[#9DBA87] px-4 py-2 rounded-lg hover:bg-[#F0FDF4] transition-colors"
                >
                  Breed prediction
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                    aria-label="Open user menu"
                    aria-expanded={profileMenuOpen}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D7DFD6] text-[#173B2D] hover:bg-[#F0FDF4] transition-colors"
                  >
                    <UserCircle size={22} />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-12 z-50 w-44 rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
                      <button
                        type="button"
                        onClick={() => { setProfileMenuOpen(false); navigate('/settings'); }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#374151] hover:bg-[#F0FDF4]"
                      >
                        Profile
                      </button>
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0FDF4]"
                      >
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          setProfileMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Marketplace hero */}
      <section className="relative min-h-[620px] flex items-end overflow-hidden bg-[#173B2D]">
        <img
          src="https://images.pexels.com/photos/4577861/pexels-photo-4577861.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt="Cattle grazing in a pasture"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#10261E]/65" />
        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-10 pt-36 pb-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              <ShieldCheck size={15} /> India&apos;s livestock marketplace
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.03]">
              Find the right animal<br />for your herd.
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/80">
              Browse verified cattle and buffalo listings, compare breeds, and connect directly with trusted sellers.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#marketplace" className="inline-flex items-center gap-3 bg-[#D5F36B] px-6 py-3.5 text-sm font-semibold text-[#173B2D] transition-colors hover:bg-white">Browse animals <ArrowRight className="w-4 h-4" /></a>
              <Link to="/sell" className="inline-flex items-center gap-3 border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">Sell your animal</Link>
            </div>
          </div>
          <div className="mt-16 grid max-w-2xl grid-cols-3 border-t border-white/25 pt-5 text-white">
            <div><p className="text-2xl font-semibold">Cattle</p><p className="mt-1 text-xs text-white/65">Healthy breeds</p></div>
            <div><p className="text-2xl font-semibold">Buffalo</p><p className="mt-1 text-xs text-white/65">Ready to compare</p></div>
            <div><p className="text-2xl font-semibold">AI</p><p className="mt-1 text-xs text-white/65">Breed insights</p></div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section id="marketplace" className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">Live from sellers</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[#173B2D]">Animals looking for a new home.</h2>
          </div>
          <Link to="/sell" className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] hover:text-[#14532D]">List your animal <ArrowRight size={16} /></Link>
        </div>
        <div className="mb-8 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9A88]" size={18} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by breed or location" className="w-full border border-[#D7DFD6] bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#6B8E23]" /></div>
          <div className="flex border border-[#D7DFD6] bg-white p-1"><button onClick={() => setAnimalType('all')} className={`px-4 py-2 text-sm font-semibold ${animalType === 'all' ? 'bg-[#173B2D] text-white' : 'text-[#66756D]'}`}>All</button><button onClick={() => setAnimalType('cattle')} className={`px-4 py-2 text-sm font-semibold ${animalType === 'cattle' ? 'bg-[#173B2D] text-white' : 'text-[#66756D]'}`}>Cattle</button><button onClick={() => setAnimalType('buffalo')} className={`px-4 py-2 text-sm font-semibold ${animalType === 'buffalo' ? 'bg-[#173B2D] text-white' : 'text-[#66756D]'}`}>Buffalo</button></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.filter((listing) => (animalType === 'all' || listing.animalType === animalType) && `${listing.breed} ${listing.location} ${listing.title}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6).map((listing) => (
            <article key={listing._id} className="group overflow-hidden border border-[#DCE7D5] bg-white transition-shadow hover:shadow-xl">
              <div className="relative h-56 bg-[#EAF0E6]">{listing.images?.[0]?.imageUrl ? <img src={`${listing.images[0].imageUrl.startsWith('http') ? '' : 'http://localhost:8000'}${listing.images[0].imageUrl}`} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#8A9A88]"><Camera size={34} /></div>}<span className="absolute left-3 top-3 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#173B2D]">{listing.animalType}</span></div>
              <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#173B2D]">{listing.title}</h3><p className="mt-1 text-sm text-[#66756D]">{listing.breed} · {listing.sex}</p></div><p className="whitespace-nowrap text-lg font-semibold text-[#173B2D]">₹{Number(listing.price || 0).toLocaleString('en-IN')}</p></div><div className="mt-5 flex items-center justify-between border-t border-[#EEF1ED] pt-4 text-sm text-[#66756D]"><span>{listing.location}</span><span className="font-semibold text-[#6B8E23]">Available</span></div></div>
            </article>
          ))}
        </div>
        {listings.length === 0 && <div className="border border-dashed border-[#B8C8B5] bg-[#F7FAF4] py-16 text-center"><p className="font-semibold text-[#173B2D]">No listings yet</p><p className="mt-2 text-sm text-[#66756D]">Be the first seller to list a cattle or buffalo.</p><Link to="/sell" className="mt-5 inline-flex bg-[#173B2D] px-5 py-3 text-sm font-semibold text-white">Create a listing</Link></div>}
        {listings.length > 6 && <div className="mt-8 text-center"><button onClick={handleGetStarted} className="inline-flex items-center gap-2 border border-[#9DBA87] px-5 py-3 text-sm font-semibold text-[#173B2D] hover:bg-[#F0FDF4]">View all animals <ArrowRight size={16} /></button></div>}
      </section>

      <section className="border-y border-[#DCE7D5] bg-[#F4F7F0]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3 lg:px-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">Why Breedify</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#173B2D]">Buy with more confidence.</h2></div>
          <div><div className="mb-4 flex h-10 w-10 items-center justify-center bg-[#D5F36B]"><Camera size={19} className="text-[#173B2D]" /></div><h3 className="font-semibold text-[#173B2D]">Breed identified from a photo</h3><p className="mt-2 text-sm leading-relaxed text-[#66756D]">Every seller can add an AI-assisted breed assessment to help you compare animals clearly.</p></div>
          <div><div className="mb-4 flex h-10 w-10 items-center justify-center bg-[#D5F36B]"><ShieldCheck size={19} className="text-[#173B2D]" /></div><h3 className="font-semibold text-[#173B2D]">Details made easy to scan</h3><p className="mt-2 text-sm leading-relaxed text-[#66756D]">See animal type, age, sex, price, and location before you contact a seller.</p></div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#173B2D] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20 grid md:grid-cols-[1fr_1.5fr] gap-10 items-start">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Better animals. Better decisions.</h3>
          <p className="text-white/70 text-base leading-relaxed">Breedify brings livestock sellers and buyers together with practical animal information, AI-assisted breed identification, and a simpler way to find cattle and buffalo.</p>
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