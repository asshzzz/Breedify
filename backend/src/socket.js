import jwt from 'jsonwebtoken';
import { Listing } from './models/listing.model.js';
import { Message } from './models/message.model.js';
import { User } from './models/user.model.js';

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
    socket.on('join_listing_chat', async ({ listingId }, callback = () => {}) => {
      try {
        const listing = await Listing.findOne({ _id: listingId, status: 'active' });
        if (!listing) return callback({ ok: false, message: 'Listing not found' });

        socket.join(roomForListing(listingId));
        const messages = await Message.find({ listing: listingId })
          .populate('sender', 'name')
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();

        callback({ ok: true, messages });
      } catch {
        callback({ ok: false, message: 'Could not load chat messages' });
      }
    });

    socket.on('send_listing_message', async ({ listingId, body }, callback = () => {}) => {
      try {
        const text = typeof body === 'string' ? body.trim() : '';
        if (!text || text.length > 1000) {
          return callback({ ok: false, message: 'Message must be between 1 and 1000 characters' });
        }

        const listing = await Listing.findOne({ _id: listingId, status: 'active' });
        if (!listing) return callback({ ok: false, message: 'Listing not found' });

        const message = await Message.create({
          listing: listingId,
          sender: socket.user._id,
          body: text
        });
        const populatedMessage = await message.populate('sender', 'name');
        io.to(roomForListing(listingId)).emit('listing_message', populatedMessage);
        callback({ ok: true });
      } catch {
        callback({ ok: false, message: 'Could not send message' });
      }
    });
  });
};