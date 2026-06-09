import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc    Get/Search users with last message and unread counts
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    // FIX: use req.query.search (was referencing undefined `search` variable)
    const searchTerm = req.query.search;

    const keyword = searchTerm
      ? {
          $and: [
            {
              $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
              ]
            },
            { _id: { $ne: req.user._id } }
          ]
        }
      : { _id: { $ne: req.user._id } };

    const users = await User.find(keyword).select('-password');

    // For each user, fetch the last message and unread count
    const usersWithMeta = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: req.user._id, receiverId: user._id },
            { senderId: user._id, receiverId: req.user._id }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: req.user._id,
          readStatus: { $ne: 'seen' }
        });

        return {
          ...user.toObject(),
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
                readStatus: lastMessage.readStatus
              }
            : null,
          unreadCount
        };
      })
    );

    // Sort users: put users with more recent messages first
    usersWithMeta.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    res.json(usersWithMeta);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
