import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users / search users (search via ?search=query param)
router.get('/', protect, getUsers);

// Search users by username (for ExplorePage)
router.get('/search', protect, async (req, res) => {
  try {
    const query = req.query.q || '';

    const users = await User.find({
      _id: { $ne: req.user._id },
      username: {
        $regex: query,
        $options: 'i'
      }
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

export default router;