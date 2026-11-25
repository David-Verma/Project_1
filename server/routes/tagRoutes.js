import { Router } from 'express';
import { listTags, postsByTag } from '../controllers/tagController.js';
const router = Router();
router.get('/', listTags); router.get('/:slug/posts', postsByTag);
export default router;
