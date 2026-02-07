import { Settings } from '../models/setting.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ===================== GET USER SETTINGS =====================
export const getSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let settings = await Settings.findOne({ userId });

  // If settings don't exist, create default settings
  if (!settings) {
    settings = await Settings.create({
      userId,
      systemSettings: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY'
      },
      notifications: {
        email: {
          enabled: true,
          newEvaluation: true,
          reportGenerated: true,
          statusUpdate: true
        },
        sms: {
          enabled: false,
          criticalAlerts: false
        },
        inApp: {
          enabled: true
        }
      },
      aiSettings: {
        autoProcess: true,
        confidenceThreshold: 0.85,
        modelVersion: 'v1.0'
      },
      displaySettings: {
        theme: 'light',
        compactMode: false,
        itemsPerPage: 20
      },
      defaults: {
        center: '',
        animalType: '',
        breed: ''
      }
    });
  }

  res.status(200).json(
    new ApiResponse(200, settings, 'Settings fetched successfully')
  );
});

// ===================== UPDATE USER SETTINGS (FIXED) =====================
export const updateSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  console.log('📝 Updating settings for user:', userId);
  console.log('📦 Update data:', JSON.stringify(updateData, null, 2));

  // Validate confidenceThreshold if provided
  if (updateData.aiSettings?.confidenceThreshold !== undefined) {
    const threshold = updateData.aiSettings.confidenceThreshold;
    if (threshold < 0 || threshold > 1) {
      throw new ApiError(400, 'Confidence threshold must be between 0 and 1');
    }
  }

  // Validate itemsPerPage if provided
  if (updateData.displaySettings?.itemsPerPage !== undefined) {
    const items = updateData.displaySettings.itemsPerPage;
    if (items < 10 || items > 100) {
      throw new ApiError(400, 'Items per page must be between 10 and 100');
    }
  }

  // Validate theme if provided
  if (updateData.displaySettings?.theme) {
    if (!['light', 'dark', 'auto'].includes(updateData.displaySettings.theme)) {
      throw new ApiError(400, 'Theme must be light, dark, or auto');
    }
  }

  // Get existing settings or create new
  let settings = await Settings.findOne({ userId });

  if (!settings) {
    // Create new settings with default values + updates
    settings = await Settings.create({
      userId,
      systemSettings: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        ...updateData.systemSettings
      },
      notifications: {
        email: {
          enabled: true,
          newEvaluation: true,
          reportGenerated: true,
          statusUpdate: true,
          ...updateData.notifications?.email
        },
        sms: {
          enabled: false,
          criticalAlerts: false,
          ...updateData.notifications?.sms
        },
        inApp: {
          enabled: true,
          ...updateData.notifications?.inApp
        }
      },
      aiSettings: {
        autoProcess: true,
        confidenceThreshold: 0.85,
        modelVersion: 'v1.0',
        ...updateData.aiSettings
      },
      displaySettings: {
        theme: 'light',
        compactMode: false,
        itemsPerPage: 20,
        ...updateData.displaySettings
      },
      defaults: {
        center: '',
        animalType: '',
        breed: '',
        ...updateData.defaults
      }
    });
  } else {
    // Update existing settings - merge nested objects properly
    if (updateData.systemSettings) {
      settings.systemSettings = {
        ...settings.systemSettings.toObject(),
        ...updateData.systemSettings
      };
    }

    if (updateData.notifications) {
      if (updateData.notifications.email) {
        settings.notifications.email = {
          ...settings.notifications.email.toObject(),
          ...updateData.notifications.email
        };
      }
      if (updateData.notifications.sms) {
        settings.notifications.sms = {
          ...settings.notifications.sms.toObject(),
          ...updateData.notifications.sms
        };
      }
      if (updateData.notifications.inApp) {
        settings.notifications.inApp = {
          ...settings.notifications.inApp.toObject(),
          ...updateData.notifications.inApp
        };
      }
    }

    if (updateData.aiSettings) {
      settings.aiSettings = {
        ...settings.aiSettings.toObject(),
        ...updateData.aiSettings
      };
    }

    if (updateData.displaySettings) {
      settings.displaySettings = {
        ...settings.displaySettings.toObject(),
        ...updateData.displaySettings
      };
    }

    if (updateData.defaults) {
      settings.defaults = {
        ...settings.defaults.toObject(),
        ...updateData.defaults
      };
    }

    // Save the updated settings
    await settings.save();
  }

  console.log('✅ Settings updated successfully');
  console.log('📊 Final settings:', JSON.stringify(settings, null, 2));

  res.status(200).json(
    new ApiResponse(200, settings, 'Settings updated successfully')
  );
});

// ===================== UPDATE SYSTEM SETTINGS =====================
export const updateSystemSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { language, timezone, dateFormat } = req.body;

  const updateFields = {};
  if (language !== undefined) updateFields['systemSettings.language'] = language;
  if (timezone !== undefined) updateFields['systemSettings.timezone'] = timezone;
  if (dateFormat !== undefined) updateFields['systemSettings.dateFormat'] = dateFormat;

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  console.log('✅ System settings updated:', updateFields);

  res.status(200).json(
    new ApiResponse(200, settings.systemSettings, 'System settings updated successfully')
  );
});

// ===================== UPDATE NOTIFICATION SETTINGS =====================
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { email, sms, inApp } = req.body;

  const updateFields = {};
  
  if (email) {
    Object.keys(email).forEach(key => {
      updateFields[`notifications.email.${key}`] = email[key];
    });
  }
  
  if (sms) {
    Object.keys(sms).forEach(key => {
      updateFields[`notifications.sms.${key}`] = sms[key];
    });
  }
  
  if (inApp) {
    Object.keys(inApp).forEach(key => {
      updateFields[`notifications.inApp.${key}`] = inApp[key];
    });
  }

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  console.log('✅ Notification settings updated:', updateFields);

  res.status(200).json(
    new ApiResponse(200, settings.notifications, 'Notification settings updated successfully')
  );
});

// ===================== UPDATE AI SETTINGS =====================
export const updateAISettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { autoProcess, confidenceThreshold, modelVersion } = req.body;

  // Validate confidenceThreshold
  if (confidenceThreshold !== undefined && (confidenceThreshold < 0 || confidenceThreshold > 1)) {
    throw new ApiError(400, 'Confidence threshold must be between 0 and 1');
  }

  const updateFields = {};
  if (autoProcess !== undefined) updateFields['aiSettings.autoProcess'] = autoProcess;
  if (confidenceThreshold !== undefined) updateFields['aiSettings.confidenceThreshold'] = confidenceThreshold;
  if (modelVersion !== undefined) updateFields['aiSettings.modelVersion'] = modelVersion;

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  console.log('✅ AI settings updated:', updateFields);

  res.status(200).json(
    new ApiResponse(200, settings.aiSettings, 'AI settings updated successfully')
  );
});

// ===================== UPDATE DISPLAY SETTINGS =====================
export const updateDisplaySettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { theme, compactMode, itemsPerPage } = req.body;

  // Validate itemsPerPage
  if (itemsPerPage !== undefined && (itemsPerPage < 10 || itemsPerPage > 100)) {
    throw new ApiError(400, 'Items per page must be between 10 and 100');
  }

  // Validate theme
  if (theme && !['light', 'dark', 'auto'].includes(theme)) {
    throw new ApiError(400, 'Theme must be light, dark, or auto');
  }

  const updateFields = {};
  if (theme !== undefined) updateFields['displaySettings.theme'] = theme;
  if (compactMode !== undefined) updateFields['displaySettings.compactMode'] = compactMode;
  if (itemsPerPage !== undefined) updateFields['displaySettings.itemsPerPage'] = itemsPerPage;

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  console.log('✅ Display settings updated:', updateFields);

  res.status(200).json(
    new ApiResponse(200, settings.displaySettings, 'Display settings updated successfully')
  );
});

// ===================== UPDATE DEFAULT VALUES =====================
export const updateDefaults = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { center, animalType, breed } = req.body;

  const updateFields = {};
  if (center !== undefined) updateFields['defaults.center'] = center;
  if (animalType !== undefined) updateFields['defaults.animalType'] = animalType;
  if (breed !== undefined) updateFields['defaults.breed'] = breed;

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  console.log('✅ Default values updated:', updateFields);

  res.status(200).json(
    new ApiResponse(200, settings.defaults, 'Default values updated successfully')
  );
});

// ===================== RESET SETTINGS TO DEFAULT =====================
export const resetSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const defaultSettings = {
    userId,
    systemSettings: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY'
    },
    notifications: {
      email: {
        enabled: true,
        newEvaluation: true,
        reportGenerated: true,
        statusUpdate: true
      },
      sms: {
        enabled: false,
        criticalAlerts: false
      },
      inApp: {
        enabled: true
      }
    },
    aiSettings: {
      autoProcess: true,
      confidenceThreshold: 0.85,
      modelVersion: 'v1.0'
    },
    displaySettings: {
      theme: 'light',
      compactMode: false,
      itemsPerPage: 20
    },
    defaults: {
      center: '',
      animalType: '',
      breed: ''
    }
  };

  // Delete existing and create new with defaults
  await Settings.findOneAndDelete({ userId });
  const settings = await Settings.create(defaultSettings);

  console.log('✅ Settings reset to default');

  res.status(200).json(
    new ApiResponse(200, settings, 'Settings reset to default successfully')
  );
});

// ===================== DELETE SETTINGS =====================
export const deleteSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await Settings.findOneAndDelete({ userId });

  if (!result) {
    throw new ApiError(404, 'Settings not found');
  }

  console.log('✅ Settings deleted for user:', userId);

  res.status(200).json(
    new ApiResponse(200, {}, 'Settings deleted successfully')
  );
});