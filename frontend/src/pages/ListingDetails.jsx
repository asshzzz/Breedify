import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { io } from 'socket.io-client';
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
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [chatConnected, setChatConnected] = useState(false);
  const [chatError, setChatError] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (!listing || !isAuthenticated()) return undefined;

    const socket = io(API_ORIGIN, { auth: { token: localStorage.getItem('token') } });
    socketRef.current = socket;
    socket.on('connect', () => {
      setChatConnected(true);
      setChatError('');
      socket.emit('join_listing_chat', { listingId: listing._id }, (response) => {
        if (!response?.ok) setChatError(response?.message || 'Could not load chat.');
        else setMessages(response.messages || []);
      });
    });
    socket.on('connect_error', () => {
      setChatConnected(false);
      setChatError('Chat connection failed. Please try again.');
    });
    socket.on('disconnect', () => setChatConnected(false));
    socket.on('listing_message', (message) => setMessages((current) => [...current, message]));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [listing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!body || !chatConnected || sending) return;

    setSending(true);
    socketRef.current.emit('send_listing_message', { listingId: listing._id, body }, (response) => {
      if (!response?.ok) setChatError(response?.message || 'Could not send message.');
      else setMessageDraft('');
      setSending(false);
    });
  };

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

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#173B2D]"><ArrowLeft size={16} /> Back to listings</Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <main>
            <div className="aspect-[4/3] overflow-hidden bg-[#173B2D]">
              {imageUrl ? <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/60">No image available</div>}
            </div>
            <div className="mt-6 bg-white p-6 ring-1 ring-[#E5E7EB]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8E23]">{listing.animalType}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173B2D]">{listing.title}</h1>
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

            <div className="mt-8 border-t border-[#EEF1ED] pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#173B2D]"><MessageCircle size={19} /> Chat</h2>
                {isAuthenticated() && <span className={`text-xs font-medium ${chatConnected ? 'text-[#3F7A4F]' : 'text-[#9CA3AF]'}`}>{chatConnected ? 'Online' : 'Connecting...'}</span>}
              </div>

              {!isAuthenticated() ? (
                <p className="mt-4 text-sm leading-relaxed text-[#66756D]">Log in to message the seller about this animal. <Link to="/login" className="font-semibold text-[#173B2D] hover:underline">Log in</Link></p>
              ) : (
                <>
                  <div className="mt-4 max-h-64 space-y-3 overflow-y-auto bg-[#F7FAF4] p-3">
                    {messages.length === 0 ? <p className="text-sm text-[#66756D]">Start the conversation about this listing.</p> : messages.map((message) => {
                      const senderId = message.sender?._id || message.sender;
                      const isMine = senderId?.toString() === currentUserId?.toString();
                      return (
                        <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3 py-2 text-sm ${isMine ? 'bg-[#173B2D] text-white' : 'bg-white text-[#374151] ring-1 ring-[#E5E7EB]'}`}>
                            {!isMine && <p className="mb-1 text-xs font-semibold text-[#6B8E23]">{message.sender?.name || 'Seller'}</p>}
                            <p className="break-words">{message.body}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} aria-hidden="true" />
                  </div>
                  {chatError && <p className="mt-3 text-xs text-[#B91C1C]">{chatError}</p>}
                  <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                    <input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} maxLength={1000} placeholder="Write a message..." disabled={!chatConnected || sending} className="min-w-0 flex-1 border border-[#D7DFD6] px-3 py-2.5 text-sm outline-none focus:border-[#6B8E23] disabled:bg-[#F9FAFB]" />
                    <button type="submit" disabled={!chatConnected || sending || !messageDraft.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#173B2D] text-white hover:bg-[#245642] disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"><Send size={16} /></button>
                  </form>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;