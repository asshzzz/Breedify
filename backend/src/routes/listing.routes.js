import express from 'express';
import { Listing } from '../models/listing.model.js';
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
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your listings', error: error.message });
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

export default router;