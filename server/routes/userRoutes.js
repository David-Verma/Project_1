import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();
router.put('/me', protect, updateProfile); router.get('/:id', getProfile);
export default router;
