import Message from '../models/Message.js';

// @desc    Get messages between two users (paginated)
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30, before } = req.query;
    const currentUserId = req.user._id;

    const query = {
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    };

    // If 'before' is provided, fetch messages older than that timestamp
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    const messageLimit = Math.min(parseInt(limit) || 30, 100);

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(messageLimit);

    // Send messages reversed so they are in chronological order for the client
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Mark messages from a sender to current user as seen
// @route   PUT /api/messages/seen/:senderId
// @access  Private
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;

    // Update all messages from senderId to currentUserId that are not seen
    const result = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: currentUserId,
        readStatus: { $ne: 'seen' }
      },
      {
        $set: { readStatus: 'seen' }
      }
    );

    res.json({ message: 'Messages marked as seen', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
