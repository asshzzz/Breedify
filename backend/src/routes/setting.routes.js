import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  updateSystemSettings,
  updateNotificationSettings,
  updateAISettings,
  updateDisplaySettings,
  updateDefaults,
  resetSettings,
  deleteSettings
} from '../controllers/setting.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(verifyJWT);

// Main settings routes
router.route('/')
  .get(getSettings)
  .put(updateSettings)
  .delete(deleteSettings);

// Specific settings update routes
router.put('/system', updateSystemSettings);
router.put('/notifications', updateNotificationSettings);
router.put('/ai', updateAISettings);
router.put('/display', updateDisplaySettings);
router.put('/defaults', updateDefaults);

// Reset route
router.post('/reset', resetSettings);

export default router;