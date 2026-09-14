import express from 'express';
import { Listing } from '../models/listing.model.js';
import { Message } from '../models/message.model.js';
import { Conversation } from '../models/conversation.model.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Browse active cattle and buffalo listings.
router.get('/', async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (['cattle', 'buffalo'].includes(req.query.animalType)) {
      filter.animalType = req.query.animalType;
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching listings', error: error.message });
  }
});

// Create a listing owned by the authenticated seller.
router.post('/', verifyJWT, async (req, res) => {
  try {
    const {
      title, animalType, breed, sex, age, price, location, description,
      images, animalRecord
    } = req.body;

    const listing = await Listing.create({
      title,
      animalType,
      breed,
      sex,
      age,
      price,
      location,
      description,
      images: Array.isArray(images) ? images : [],
      animalRecord,
      seller: req.user._id
    });

    res.status(201).json({ success: true, message: 'Listing created successfully', data: listing });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not create listing', error: error.message });
  }
});

// View the authenticated seller's listings.
router.get('/mine', verifyJWT, async (req, res) => {
  try {
    const listings = await Listing.find({
      seller: req.user._id,
      status: { $in: ['active', 'withdrawn'] }
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your listings', error: error.message });
  }
});

router.get('/chats', verifyJWT, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
      deletedFor: { $ne: req.user._id }
    }).select('_id');
    const conversationIds = conversations.map((conversation) => conversation._id);
    const messages = await Message.find({ conversation: { $in: conversationIds } })
      .populate({
        path: 'listing',
        select: 'title animalType breed price seller status',
        populate: { path: 'seller', select: 'name' }
      })
      .populate('conversation', 'buyer seller')
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chats', error: error.message });
  }
});

router.delete('/:id/chat', verifyJWT, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).select('seller');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isSeller = listing.seller.toString() === req.user._id.toString();
    const isParticipant = isSeller || await Message.exists({ listing: listing._id, sender: req.user._id });
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'You are not part of this chat' });
    }

    const conversation = await Conversation.findOne({
      _id: req.body.conversationId,
      listing: listing._id,
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    });
    if (!conversation) {
      return res.status(403).json({ success: false, message: 'You are not part of this chat' });
    }

    await Conversation.updateOne(
      { _id: conversation._id },
      { $addToSet: { deletedFor: req.user._id } }
    );

    res.status(200).json({ success: true, message: 'Chat deleted for you' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not delete chat', error: error.message });
  }
});

router.post('/:id/chat/restore', verifyJWT, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).select('seller');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isSeller = listing.seller.toString() === req.user._id.toString();
    const conversation = req.body.conversationId && isSeller
      ? await Conversation.findOne({ _id: req.body.conversationId, listing: listing._id, seller: req.user._id })
      : await Conversation.findOneAndUpdate(
        { listing: listing._id, buyer: req.user._id },
        { $setOnInsert: { listing: listing._id, buyer: req.user._id, seller: listing.seller } },
        { new: true, upsert: !isSeller }
      );
    if (!isSeller && !conversation) {
      return res.status(403).json({ success: false, message: 'You are not part of this chat' });
    }

    if (conversation) {
      await Conversation.updateOne(
        { _id: conversation._id },
        { $pull: { deletedFor: req.user._id } }
      );
    }
    res.status(200).json({ success: true, conversationId: conversation?._id, message: 'Chat restored' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not restore chat', error: error.message });
  }
});

// View one active listing with public seller contact details.
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, status: 'active' })
      .populate('seller', 'name email phone');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not fetch listing', error: error.message });
  }
});

router.patch('/:id/status', verifyJWT, async (req, res) => {
  try {
    if (!['active', 'sold', 'withdrawn'].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid listing status' });
    }

    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not update listing', error: error.message });
  }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
      status: 'withdrawn'
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Withdrawn listing not found' });
    }

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not delete listing', error: error.message });
  }
});

export default router;