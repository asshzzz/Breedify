import jwt from 'jsonwebtoken';
import { Listing } from './models/listing.model.js';
import { Message } from './models/message.model.js';
import { User } from './models/user.model.js';
import { Conversation } from './models/conversation.model.js';

const getToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const headerToken = socket.handshake.headers?.authorization?.replace('Bearer ', '');
  return authToken || headerToken;
};

const getUserFromSocket = async (socket) => {
  const token = getToken(socket);
  if (!token) throw new Error('Authentication required');

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
  const user = await User.findById(decodedToken.id).select('-password -refreshToken');
  if (!user) throw new Error('Invalid access token');
  return user;
};

const roomForListing = (listingId) => `listing-chat:${listingId}`;

export const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      socket.user = await getUserFromSocket(socket);
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_listing_chat', async ({ listingId, conversationId }, callback = () => {}) => {
      try {
        const listing = await Listing.findOne({ _id: listingId, status: 'active' });
        if (!listing) return callback({ ok: false, message: 'Listing not found' });

        let conversation;
        const isSeller = listing.seller.toString() === socket.user._id.toString();
        if (conversationId) {
          conversation = await Conversation.findOne({ _id: conversationId, listing: listingId });
        } else if (!isSeller) {
          conversation = await Conversation.findOneAndUpdate(
            { listing: listingId, buyer: socket.user._id },
            { $setOnInsert: { listing: listingId, buyer: socket.user._id, seller: listing.seller } },
            { new: true, upsert: true }
          );
        }
        if (!conversation || ![conversation.buyer.toString(), conversation.seller.toString()].includes(socket.user._id.toString())) {
          return callback({ ok: false, message: 'You are not part of this chat' });
        }

        const chatDeleted = conversation.deletedFor.some((userId) => userId.toString() === socket.user._id.toString());
        if (chatDeleted) return callback({ ok: true, messages: [] });

        socket.join(roomForListing(conversation._id));
        const messages = await Message.find({ conversation: conversation._id })
          .populate('listing', 'title animalType breed price seller status')
          .populate('conversation', 'buyer seller')
          .populate('sender', 'name')
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();

        callback({ ok: true, conversationId: conversation._id, messages });
      } catch {
        callback({ ok: false, message: 'Could not load chat messages' });
      }
    });

    socket.on('send_listing_message', async ({ listingId, conversationId, body }, callback = () => {}) => {
      try {
        const text = typeof body === 'string' ? body.trim() : '';
        if (!text || text.length > 1000) {
          return callback({ ok: false, message: 'Message must be between 1 and 1000 characters' });
        }

        const listing = await Listing.findOne({ _id: listingId, status: 'active' });
        if (!listing) return callback({ ok: false, message: 'Listing not found' });

        const conversation = await Conversation.findOne({ _id: conversationId, listing: listingId });
        if (!conversation || ![conversation.buyer.toString(), conversation.seller.toString()].includes(socket.user._id.toString())) {
          return callback({ ok: false, message: 'You are not part of this chat' });
        }

        const message = await Message.create({
          listing: listingId,
          conversation: conversation._id,
          sender: socket.user._id,
          body: text
        });
        await Conversation.updateOne(
          { _id: conversation._id },
          { $set: { deletedFor: [] } }
        );
        const populatedMessage = await message.populate('sender', 'name');
        io.to(roomForListing(conversation._id)).emit('listing_message', populatedMessage);
        callback({ ok: true });
      } catch {
        callback({ ok: false, message: 'Could not send message' });
      }
    });
  });
};