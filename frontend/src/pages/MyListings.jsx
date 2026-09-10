import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, LoaderCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listingAPI } from '../api';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadListings = async () => {
    try {
      const response = await listingAPI.getMine();
      setListings(response.data || response || []);
    } catch (requestError) {
      setError(requestError?.message || 'Could not load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, []);

  const changeStatus = async (id, status) => {
    try {
      await listingAPI.updateStatus(id, status);
      await loadListings();
    } catch (requestError) {
      setError(requestError?.message || 'Could not update listing.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151]"><ArrowLeft size={16} /> Home </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#D7DFD6] pb-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">Seller centre</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173B2D]">My listings</h1></div>
          <Link to="/sell" className="bg-[#173B2D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245642]">Create listing</Link>
        </div>
        {error && <p className="mt-6 border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">{error}</p>}
        {loading ? <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-[#6B8E23]" /></div> : listings.length === 0 ? (
          <div className="mt-8 border border-dashed border-[#B8C8B5] bg-white p-12 text-center"><ShoppingBag className="mx-auto text-[#6B8E23]" size={32} /><p className="mt-3 text-sm text-[#66756D]">You have not published an animal yet.</p></div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {listings.map((listing) => <article key={listing._id} className="bg-white p-5 ring-1 ring-[#E5E7EB]"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-[#173B2D]">{listing.title}</h2><p className="mt-1 text-sm text-[#66756D]">{listing.animalType} · {listing.breed} · {listing.sex}</p></div><span className="text-xs font-semibold uppercase tracking-wide text-[#6B8E23]">{listing.status}</span></div><div className="mt-5 flex items-center justify-between border-t border-[#EEF1ED] pt-4"><p className="text-lg font-semibold text-[#173B2D]">{listing.price.toLocaleString()}</p><p className="text-sm text-[#66756D]">{listing.location}</p></div>{listing.status === 'active' && <div className="mt-4 flex gap-3"><button onClick={() => changeStatus(listing._id, 'sold')} className="inline-flex items-center gap-2 bg-[#D5F36B] px-3 py-2 text-sm font-semibold text-[#173B2D]"><CheckCircle size={16} /> Mark sold</button><button onClick={() => changeStatus(listing._id, 'withdrawn')} className="border border-[#D7DFD6] px-3 py-2 text-sm font-semibold text-[#66756D]">Withdraw</button></div>}</article>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;