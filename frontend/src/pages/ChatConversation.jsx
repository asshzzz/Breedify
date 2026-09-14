import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, LoaderCircle, Send } from 'lucide-react';
import { io } from 'socket.io-client';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getUserData, listingAPI } from '../api';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '');

const ChatConversation = () => {
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const requestedConversationId = searchParams.get('conversationId');
  const [listing, setListing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUser = getUserData();
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const loadListing = async () => {
      try {
        const response = await listingAPI.getById(listingId);
        setListing(response.data || response);
        const chatResponse = await listingAPI.restoreChat(listingId, requestedConversationId);
        setConversationId(chatResponse.conversationId || null);
      } catch (requestError) {
        setError(requestError?.message || 'Could not load this conversation.');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  useEffect(() => {
    const activeConversationId = requestedConversationId || conversationId;
    if (!listing || !activeConversationId) return undefined;

    const socket = io(API_ORIGIN, { auth: { token: localStorage.getItem('token') } });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_listing_chat', { listingId, conversationId: activeConversationId }, (response) => {
        if (!response?.ok) setError(response?.message || 'Could not load messages.');
        else {
          setConversationId(response.conversationId || conversationId);
          setMessages(response.messages || []);
        }
      });
    });
    socket.on('connect_error', () => {
      setConnected(false);
      setError('Chat connection failed. Please try again.');
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('listing_message', (message) => setMessages((current) => (
      current.some((item) => item._id === message._id) ? current : [...current, message]
    )));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [listing, listingId, requestedConversationId, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getId = (value) => value?._id || value?.id || value;
  const isCurrentUserSeller = listing && (
    getId(listing.seller)?.toString() === currentUserId?.toString()
    || (currentUser?.name && currentUser.name === listing.seller?.name)
  );
  const isMine = (message) => {
    const senderId = getId(message.sender)?.toString();
    const ownId = isCurrentUserSeller ? getId(listing?.seller)?.toString() : currentUserId?.toString();
    return senderId === ownId;
  };
  const participant = useMemo(() => {
    const isSeller = isCurrentUserSeller;
    const otherMessage = messages.find((message) => !isMine(message));
    return {
      name: isSeller ? otherMessage?.sender?.name || 'Buyer' : listing?.seller?.name || 'Seller',
      role: isSeller ? 'Buyer' : 'Seller'
    };
  }, [listing, messages, currentUserId]);

  const sendMessage = (event) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!body || !connected || sending) return;

    setSending(true);
    socketRef.current.emit('send_listing_message', { listingId, conversationId, body }, (response) => {
      if (!response?.ok) setError(response?.message || 'Could not send message.');
      else setMessageDraft('');
      setSending(false);
    });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><LoaderCircle className="animate-spin text-[#6B8E23]" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-4 py-6 sm:px-5 sm:py-8 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/chats" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#173B2D]"><ArrowLeft size={16} /> Back to chats</Link>
        {error && <p className="mt-6 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">{error}</p>}
        {listing && <>
          <header className="mt-8 border-b border-[#D7DFD6] pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">{participant.role}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173B2D] sm:text-3xl">{participant.name}</h1>
            <p className="mt-2 text-sm text-[#66756D]">{listing.title} · {listing.breed}</p>
          </header>
          <div className="mt-8 bg-white p-5 ring-1 ring-[#E5E7EB]">
            <div className="max-h-[32rem] space-y-3 overflow-y-auto bg-[#F7FAF4] p-4">
              {messages.length === 0 ? <p className="text-sm text-[#66756D]">Start the conversation about this listing.</p> : messages.map((message) => <div key={message._id} className={`flex ${isMine(message) ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] px-3 py-2 text-sm ${isMine(message) ? 'bg-[#173B2D] text-white' : 'bg-white text-[#374151] ring-1 ring-[#E5E7EB]'}`}><p className="mb-1 text-xs font-semibold opacity-70">{isMine(message) ? 'You' : message.sender?.name || participant.name}</p><p className="break-words">{message.body}</p><p className="mt-1 text-[11px] opacity-60">{new Date(message.createdAt).toLocaleString()}</p></div></div>)}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} maxLength={1000} placeholder={`Message ${participant.name}...`} disabled={!connected || sending} className="min-w-0 flex-1 border border-[#D7DFD6] px-3 py-2.5 text-sm outline-none focus:border-[#6B8E23] disabled:bg-[#F9FAFB]" />
              <button type="submit" disabled={!connected || sending || !messageDraft.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#173B2D] text-white hover:bg-[#245642] disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"><Send size={16} /></button>
            </form>
          </div>
        </>}
      </div>
    </div>
  );
};

export default ChatConversation;
