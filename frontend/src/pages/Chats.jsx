import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LoaderCircle, MessageCircle, MoreVertical, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import { getUserData, listingAPI } from '../api';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '');

const Chats = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [hiddenConversationIds, setHiddenConversationIds] = useState(new Set());
  const currentUser = getUserData();
  const currentUserId = currentUser?._id || currentUser?.id;

  const loadChats = async () => {
    setLoading(true);
    try {
      const response = await listingAPI.getChats();
      setMessages(response.data || response || []);
      setError('');
    } catch (requestError) {
      setError(requestError?.message || 'Could not load your chats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChats(); }, []);

  const chatTargets = useMemo(
    () => [...new Map(messages.map((message) => {
      const listingId = message.listing?._id || message.listing;
      const conversationId = message.conversation?._id || message.conversation || listingId;
      return [`${listingId}:${conversationId}`, { listingId, conversationId }];
    }).filter(([, target]) => target.listingId)).values()],
    [messages]
  );
  const chatTargetsKey = chatTargets.map(({ listingId, conversationId }) => `${listingId}:${conversationId}`).join(',');

  useEffect(() => {
    if (!chatTargets.length) return undefined;

    const socket = io(API_ORIGIN, { auth: { token: localStorage.getItem('token') } });
    const addMessage = (message) => setMessages((current) => {
      const listingId = message.listing?._id || message.listing;
      const previous = current.find((item) => (item.listing?._id || item.listing) === listingId);
      const normalizedMessage = message.listing?._id ? message : { ...message, listing: previous?.listing, conversation: message.conversation || previous?.conversation };
      const conversationId = message.conversation?._id || message.conversation || listingId;
      return hiddenConversationIds.has(conversationId) || current.some((item) => item._id === message._id)
        ? current
        : [...current, normalizedMessage];
    });

    socket.on('connect', () => {
      chatTargets.forEach(({ listingId, conversationId }) => {
        socket.emit('join_listing_chat', { listingId, conversationId }, (response) => {
          if (response?.ok) response.messages?.forEach(addMessage);
        });
      });
    });
    socket.on('listing_message', addMessage);

    return () => socket.disconnect();
  }, [chatTargetsKey, hiddenConversationIds]);

  const conversations = useMemo(() => {
    const grouped = new Map();
    messages.forEach((message) => {
      const listing = message.listing;
      const listingId = listing?._id || listing;
      const conversationId = message.conversation?._id || message.conversation || listingId;
      const conversationKey = `${listingId}:${conversationId}`;
      if (!listingId) return;
      if (!grouped.has(conversationKey)) grouped.set(conversationKey, { listing, messages: [] });
      grouped.get(conversationKey).messages.push(message);
    });
    return [...grouped.values()].sort((a, b) => {
      const lastA = a.messages[a.messages.length - 1]?.createdAt || '';
      const lastB = b.messages[b.messages.length - 1]?.createdAt || '';
      return new Date(lastB) - new Date(lastA);
    });
  }, [messages]);

  const isMine = (message) => (message.sender?._id || message.sender)?.toString() === currentUserId?.toString();

  const deleteChat = async (listingId, conversationId) => {
    if (!window.confirm('Delete this chat for you? The other person will still see it.')) return;

    try {
      await listingAPI.deleteChat(listingId, conversationId);
      setHiddenConversationIds((current) => new Set(current).add(conversationId));
      setMessages((current) => current.filter((message) => (
        (message.conversation?._id || message.conversation || message.listing?._id || message.listing) !== conversationId
      )));
      setOpenMenu(null);
    } catch (requestError) {
      setError(requestError?.message || 'Could not delete this chat.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-4 py-6 sm:px-5 sm:py-8 md:px-10">
      <div className="mr-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#173B2D]"><ArrowLeft size={16} /> Back to marketplace</Link>
          <button type="button" onClick={loadChats} className="inline-flex items-center gap-2 border border-[#D7DFD6] bg-white px-3 py-2 text-sm font-medium text-[#173B2D] hover:bg-[#F7FAF4]"><RefreshCw size={15} /> Refresh</button>
        </div>
        <div className="mt-8 border-b border-[#D7DFD6] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">Messages</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173B2D] sm:text-3xl">Your chats</h1>
          <p className="mt-2 text-sm text-[#66756D]">Messages you sent and received about livestock listings.</p>
        </div>

        {error && <p className="mt-6 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">{error}</p>}
        {loading ? <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-[#6B8E23]" /></div> : conversations.length === 0 ? (
          <div className="mt-8 border border-dashed border-[#B8C8B5] bg-white p-12 text-center"><MessageCircle className="mx-auto text-[#6B8E23]" size={32} /><p className="mt-3 font-semibold text-[#173B2D]">No chats yet</p><p className="mt-2 text-sm text-[#66756D]">Open a listing and message the seller to start a conversation.</p><Link to="/" className="mt-5 inline-flex bg-[#173B2D] px-5 py-3 text-sm font-semibold text-white">Browse listings</Link></div>
        ) : (
          <div className="mt-8 space-y-4">
            {conversations.map(({ listing, messages: conversationMessages }) => {
              const lastMessage = conversationMessages[conversationMessages.length - 1];
              const listingId = listing?._id || listing;
              const conversationId = lastMessage?.conversation?._id || lastMessage?.conversation || conversationMessages[0]?.conversation?._id || conversationMessages[0]?.conversation || listingId;
              const chatKey = `${listingId}:${conversationId}`;
              const sellerId = listing?.seller?._id || listing?.seller;
              const isSeller = sellerId?.toString() === currentUserId?.toString();
              const otherMessage = conversationMessages.find((message) => !isMine(message));
              const participantName = isSeller
                ? otherMessage?.sender?.name || 'Buyer'
                : listing?.seller?.name || 'Seller';
              const participantRole = isSeller ? 'Buyer' : 'Seller';
              const lastMessagePrefix = isMine(lastMessage) ? 'You: ' : `${lastMessage?.sender?.name || participantName}: `;
              return (
                <article key={chatKey} className="rounded-2xl border border-[#DDE8D9] bg-[#F1F8EE] p-5 shadow-sm transition-colors hover:bg-[#EAF4E7]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link to={`/chats/${listingId}?conversationId=${lastMessage?.conversation?._id || lastMessage?.conversation || ''}`} className="inline-flex max-w-full items-center gap-2 text-lg font-semibold text-[#173B2D] hover:underline"><MessageCircle size={17} className="shrink-0" /> <span className="truncate">{participantName}</span></Link>
                      <p className="mt-2 truncate text-sm text-[#66756D]">{lastMessage ? `${lastMessagePrefix}${lastMessage.body}` : 'No messages yet'}</p>
                      <button type="button" onClick={() => navigate(`/listing/${listingId}`)} className="mt-2 text-xs font-medium text-[#7A8978] hover:text-[#173B2D] hover:underline">{listing?.title || 'Animal listing'} · {listing?.breed || 'Breed information unavailable'}</button>
                    </div>
                    <div className="relative flex shrink-0 items-start gap-3">
                      <span className="rounded-full bg-[#EAF4E7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#3F7A4F]">{participantRole}</span>
                      <button type="button" onClick={() => setOpenMenu(openMenu === chatKey ? null : chatKey)} aria-label="Chat options" className="rounded-full p-1 text-[#66756D] hover:bg-white hover:text-[#173B2D]"><MoreVertical size={18} /></button>
                      {openMenu === chatKey && <div className="absolute right-0 top-9 z-10 w-44 rounded-lg border border-[#DDE8D9] bg-white p-1.5 shadow-lg"><button type="button" onClick={() => deleteChat(listingId, conversationId)} className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#B3261E] hover:bg-[#FBEAE9]">Delete chat</button></div>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
