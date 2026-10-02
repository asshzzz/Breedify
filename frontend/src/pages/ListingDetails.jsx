import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getUserData, isAuthenticated, listingAPI } from '../api';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '');

const getImageUrl = (imageUrl) => (
  imageUrl?.startsWith('/') ? `${API_ORIGIN}${imageUrl}` : imageUrl
);

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [failedImageUrl, setFailedImageUrl] = useState('');

  useEffect(() => {
    const loadListing = async () => {
      try {
        const response = await listingAPI.getById(id);
        setListing(response.data);
      } catch (requestError) {
        setError(requestError?.message || 'Could not load this listing.');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#66756D]">Loading listing...</div>;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151]"><ArrowLeft size={16} /> Back to listings</Link>
          <p className="mt-10 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">{error || 'Listing not found.'}</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(listing.images?.[0]?.imageUrl);
  const seller = listing.seller || {};
  const currentUser = getUserData();
  const currentUserId = currentUser?._id || currentUser?.id;
  const sellerId = seller._id || seller;
  const isOwner = currentUserId?.toString() === sellerId?.toString();

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#173B2D]"><ArrowLeft size={16} /> Back to listings</Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <main>
            <div className="aspect-[4/3] overflow-hidden bg-[#173B2D]">
              {imageUrl && imageUrl !== failedImageUrl ? (
                <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover" onError={() => setFailedImageUrl(imageUrl)} />
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">No image available</div>
              )}
            </div>
            <div className="mt-6 bg-white p-6 ring-1 ring-[#E5E7EB]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8E23]">{listing.animalType}</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173B2D] sm:text-3xl">{listing.title}</h1>
                </div>
                <p className="text-2xl font-semibold text-[#173B2D]">₹{Number(listing.price || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="mt-6 grid gap-4 border-t border-[#EEF1ED] pt-5 text-sm sm:grid-cols-3">
                <div><p className="text-[#66756D]">Breed</p><p className="mt-1 font-semibold text-[#173B2D]">{listing.breed}</p></div>
                <div><p className="text-[#66756D]">Sex</p><p className="mt-1 font-semibold capitalize text-[#173B2D]">{listing.sex}</p></div>
                <div><p className="text-[#66756D]">Age</p><p className="mt-1 font-semibold text-[#173B2D]">{listing.age?.years || 0} years, {listing.age?.months || 0} months</p></div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-[#66756D]"><MapPin size={17} className="text-[#6B8E23]" /> {listing.location}</div>
              {listing.description && <p className="mt-5 border-t border-[#EEF1ED] pt-5 text-sm leading-relaxed text-[#66756D]">{listing.description}</p>}
            </div>
          </main>

          <aside className="h-fit bg-white p-6 ring-1 ring-[#E5E7EB]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8E23]">Seller</p>
            <h2 className="mt-2 text-xl font-semibold text-[#173B2D]">{seller.name || 'Seller'}</h2>
            <div className="mt-6 space-y-4 text-sm">
              {seller.phone && <a href={`tel:${seller.phone}`} className="flex items-center gap-3 text-[#374151] hover:text-[#173B2D]"><Phone size={17} className="text-[#6B8E23]" /> {seller.phone}</a>}
              {seller.email && <a href={`mailto:${seller.email}`} className="flex items-center gap-3 break-all text-[#374151] hover:text-[#173B2D]"><Mail size={17} className="shrink-0 text-[#6B8E23]" /> {seller.email}</a>}
              {!seller.phone && !seller.email && <p className="text-[#66756D]">Contact details are not available.</p>}
            </div>

            {!isOwner && <div className="mt-8 border-t border-[#EEF1ED] pt-6">
              {!isAuthenticated() ? (
                <p className="mt-4 text-sm leading-relaxed text-[#66756D]">Log in to message the seller about this animal. <Link to="/login" className="font-semibold text-[#173B2D] hover:underline">Log in</Link></p>
              ) : (
                <Link to={`/chats/${listing._id}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#1F3A2E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#173025]"><MessageCircle size={17} /> Chat with seller</Link>
              )}
            </div>}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;