import { ImageUpload } from '../models/image.model.js';
import { AnimalRecord } from '../models/record.model.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload to cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'cattle-images') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Helper function to create thumbnail on cloudinary
const generateThumbnailUrl = (publicId) => {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });
};

// @desc    Upload image for animal record
// @route   POST /api/images/upload
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    const { animalId, imageType } = req.body;

    // Validate required fields
    if (!animalId || !imageType || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'animalId, imageType and image file are required'
      });
    }

    // Verify animal record exists
    const animalRecord = await AnimalRecord.findById(animalId);
    if (!animalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Animal record not found'
      });
    }

    // Check permission
    if (animalRecord.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload images for this record'
      });
    }

    // Upload to Cloudinary using file buffer
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // Generate thumbnail URL
    const thumbnailUrl = generateThumbnailUrl(uploadResult.public_id);

    // Create image upload record
    const imageUpload = await ImageUpload.create({
      animalId,
      imageType,
      originalName: req.file.originalname,
      fileName: uploadResult.public_id,
      fileSize: uploadResult.bytes,
      mimeType: req.file.mimetype,
      imageUrl: uploadResult.secure_url,
      thumbnailUrl: thumbnailUrl,
      dimensions: {
        width: uploadResult.width,
        height: uploadResult.height
      },
      uploadedBy: req.user.id,
      processingStatus: 'pending'
    });

    // Add image to animal record
    animalRecord.images.push({
      imageType,
      imageUrl: imageUpload.imageUrl,
      uploadedAt: Date.now()
    });
    await animalRecord.save();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageUpload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// @desc    Get images for an animal record
// @route   GET /api/images/animal/:id
// @access  Private
export const getImagesByAnimal = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify animal record exists
    const animalRecord = await AnimalRecord.findById(id);
    if (!animalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Animal record not found'
      });
    }

    // Check permission
    if (req.user.role === 'user' && animalRecord.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view images for this record'
      });
    }

    const images = await ImageUpload.find({ animalId: id })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
};

// @desc    Update image processing status
// @route   PUT /api/images/:id/status
// @access  Private
export const updateProcessingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { processingStatus, processed, extractedData } = req.body;

    // Validate processing status
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (processingStatus && !validStatuses.includes(processingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid processing status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const image = await ImageUpload.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Update fields
    if (processingStatus !== undefined) {
      image.processingStatus = processingStatus;
    }
    
    if (processed !== undefined) {
      image.processed = processed;
    }

    if (extractedData) {
      image.extractedData = extractedData;
      
      // If AI extracted data is provided, update the animal record
      if (extractedData.parameters) {
        await AnimalRecord.findByIdAndUpdate(
          image.animalId,
          {
            $set: {
              bodyParameters: {
                ...extractedData.parameters
              },
              'aiAnalysis.status': 'completed',
              'aiAnalysis.confidence': extractedData.confidence || 0,
              'aiAnalysis.analyzedAt': Date.now()
            }
          }
        );
      }
    }

    await image.save();

    res.status(200).json({
      success: true,
      message: 'Processing status updated successfully',
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating processing status',
      error: error.message
    });
  }
};

// Helper function: Process image with AI (placeholder)
export const processImageWithAI = async (imageId) => {
  try {
    const image = await ImageUpload.findById(imageId);
    if (!image) return;

    // Update status to processing
    image.processingStatus = 'processing';
    await image.save();

    // TODO: Integrate your AI model here
    // You can use the cloudinary URL to process the image
    // Example: Send image.imageUrl to your AI service
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock extracted data
    const extractedData = {
      parameters: {
        bodyLength: Math.floor(Math.random() * 50) + 100,
        heartGirth: Math.floor(Math.random() * 40) + 150,
        height: Math.floor(Math.random() * 30) + 120,
        width: Math.floor(Math.random() * 20) + 40,
        neckLength: Math.floor(Math.random() * 15) + 25,
        legLength: Math.floor(Math.random() * 20) + 60
      },
      confidence: 0.85 + Math.random() * 0.15
    };

    // Update image with extracted data
    image.extractedData = extractedData;
    image.processed = true;
    image.processingStatus = 'completed';
    await image.save();

    // Update animal record
    await AnimalRecord.findByIdAndUpdate(image.animalId, {
      $set: {
        bodyParameters: extractedData.parameters,
        'aiAnalysis.status': 'completed',
        'aiAnalysis.confidence': extractedData.confidence,
        'aiAnalysis.analyzedAt': Date.now(),
        'aiAnalysis.modelVersion': '1.0.0'
      }
    });

    console.log(`Image ${imageId} processed successfully`);
  } catch (error) {
    console.error(`Error processing image ${imageId}:`, error);
    
    // Update status to failed
    try {
      await ImageUpload.findByIdAndUpdate(imageId, {
        processingStatus: 'failed',
        'aiAnalysis.errors': [error.message]
      });
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }
  }
};

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await ImageUpload.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check permission
    if (image.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this image'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.fileName);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Remove from animal record
    await AnimalRecord.updateOne(
      { _id: image.animalId },
      { $pull: { images: { imageUrl: image.imageUrl } } }
    );

    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// @desc    Retry failed image processing
// @route   POST /api/images/:id/retry
// @access  Private
export const retryProcessing = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await ImageUpload.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    if (image.processingStatus !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed images can be retried'
      });
    }

    // Reset status and retry
    image.processingStatus = 'pending';
    image.processed = false;
    await image.save();

    // Start processing again
    processImageWithAI(image._id);

    res.status(200).json({
      success: true,
      message: 'Image processing restarted',
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrying image processing',
      error: error.message
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/images/upload-multiple
// @access  Private
export const uploadMultipleImages = async (req, res) => {
  try {
    const { animalId, images } = req.body; // images is array of {image: base64, imageType: string}

    if (!animalId || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'animalId and images array are required'
      });
    }

    // Verify animal record exists
    const animalRecord = await AnimalRecord.findById(animalId);
    if (!animalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Animal record not found'
      });
    }

    // Check permission
    if (animalRecord.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload images for this record'
      });
    }

    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < images.length; i++) {
      try {
        const { image, imageType } = images[i];

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'cattle-images',
          resource_type: 'image',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });

        // Generate thumbnail URL
        const thumbnailUrl = generateThumbnailUrl(uploadResult.public_id);

        // Create image upload record
        const imageUpload = await ImageUpload.create({
          animalId,
          imageType: imageType || 'other',
          originalName: uploadResult.original_filename || `image-${i + 1}`,
          fileName: uploadResult.public_id,
          fileSize: uploadResult.bytes,
          mimeType: `image/${uploadResult.format}`,
          imageUrl: uploadResult.secure_url,
          thumbnailUrl: thumbnailUrl,
          dimensions: {
            width: uploadResult.width,
            height: uploadResult.height
          },
          uploadedBy: req.user.id,
          processingStatus: 'pending'
        });

        uploadedImages.push(imageUpload);

        // Add image to animal record
        animalRecord.images.push({
          imageType: imageType || 'other',
          imageUrl: imageUpload.imageUrl,
          uploadedAt: Date.now()
        });
      } catch (uploadError) {
        errors.push({ index: i, error: uploadError.message });
      }
    }

    await animalRecord.save();

    res.status(201).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: uploadedImages,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};