import express from 'express';
import { getMessages, markMessagesAsSeen } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:userId', protect, getMessages);
router.put('/seen/:senderId', protect, markMessagesAsSeen);

export default router;
