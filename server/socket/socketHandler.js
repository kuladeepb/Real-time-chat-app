import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

const userSocketMap = new Map();

export const socketHandler = (io) => {
  // Authentication middleware for Socket.IO connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      
      // Fetch user to confirm existence
      const user = await User.findById(socket.userId);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.username = user.username;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${socket.username} (${userId}), socketId: ${socket.id}`);

    // Store socket mapping
    userSocketMap.set(userId, socket.id);

    try {
      // Update online status in DB
      await User.findByIdAndUpdate(userId, { onlineStatus: 'online' });
      
      // Broadcast online status to all other users
      socket.broadcast.emit('user_status_change', {
        userId,
        onlineStatus: 'online',
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating user status on connection:', error);
    }

    // Send the list of currently online users to the connected client
    const onlineUsers = Array.from(userSocketMap.keys());
    socket.emit('online_users_list', onlineUsers);

    // Event: send_message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;
        
        if (!receiverId || !content.trim()) {
          return socket.emit('error_message', { message: 'Receiver and content are required' });
        }

        // Determine if receiver is online to set initial status
        const isReceiverOnline = userSocketMap.has(receiverId);
        const readStatus = isReceiverOnline ? 'delivered' : 'sent';

        // Create new message in DB
        const newMessage = await Message.create({
          senderId: userId,
          receiverId,
          content,
          readStatus
        });

        // Populate message info (if needed, or just send raw message)
        const messageData = {
          _id: newMessage._id,
          senderId: newMessage.senderId,
          receiverId: newMessage.receiverId,
          content: newMessage.content,
          readStatus: newMessage.readStatus,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt
        };

        // Send confirmation back to the sender
        socket.emit('message_sent', messageData);

        // Deliver message to receiver if online
        if (isReceiverOnline) {
          const receiverSocketId = userSocketMap.get(receiverId);
          io.to(receiverSocketId).emit('receive_message', messageData);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error_message', { message: 'Failed to send message' });
      }
    });

    // Event: typing
    socket.on('typing', (data) => {
      const { receiverId } = data;
      if (userSocketMap.has(receiverId)) {
        const receiverSocketId = userSocketMap.get(receiverId);
        io.to(receiverSocketId).emit('typing_status', {
          senderId: userId,
          isTyping: true
        });
      }
    });

    // Event: stop_typing
    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      if (userSocketMap.has(receiverId)) {
        const receiverSocketId = userSocketMap.get(receiverId);
        io.to(receiverSocketId).emit('typing_status', {
          senderId: userId,
          isTyping: false
        });
      }
    });

    // Event: mark_messages_seen
    socket.on('mark_messages_seen', async (data) => {
      try {
        const { senderId } = data; // the user who sent the messages
        
        // Update DB
        await Message.updateMany(
          { senderId, receiverId: userId, readStatus: { $ne: 'seen' } },
          { $set: { readStatus: 'seen' } }
        );

        // Notify the sender that their messages to us have been seen
        if (userSocketMap.has(senderId)) {
          const senderSocketId = userSocketMap.get(senderId);
          io.to(senderSocketId).emit('messages_marked_seen', {
            seenBy: userId // current user has seen messages from senderId
          });
        }
      } catch (error) {
        console.error('Error marking messages as seen in socket:', error);
      }
    });

    // Event: disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username} (${userId})`);
      
      // Remove socket mapping
      if (userSocketMap.get(userId) === socket.id) {
        userSocketMap.delete(userId);
      }

      try {
        const disconnectTime = new Date();
        // Update database
        await User.findByIdAndUpdate(userId, {
          onlineStatus: 'offline',
          lastSeen: disconnectTime
        });

        // Broadcast offline status to all clients
        socket.broadcast.emit('user_status_change', {
          userId,
          onlineStatus: 'offline',
          lastSeen: disconnectTime
        });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    });
  });
};
