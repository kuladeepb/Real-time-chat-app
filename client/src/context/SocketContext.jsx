import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Use refs to avoid stale closures in socket event handlefrs
  const activeChatRef = useRef(null);
  const contactsRef = useRef([]);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  // Fetch initial contacts list
  const fetchContacts = async (searchQuery = '') => {
    try {
      const url = searchQuery ? `/api/users?search=${encodeURIComponent(searchQuery)}` : '/api/users';
      const { data } = await api.get(url);
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  // Request notifications permission on user mount
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  // Effect to update document title based on unread counts
  useEffect(() => {
    const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Chatify - Real-Time Premium Chat`;
    } else {
      document.title = 'Chatify - Real-Time Premium Chat Application';
    }
  }, [contacts]);

  // Synthesize soft ping sound dynamically (so it works on any browser without static assets)
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // A5

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio playback blocked or failed:', e);
    }
  };

  // Trigger HTML5 Desktop Notification
  const triggerDesktopNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState === 'hidden') {
      const contact = contactsRef.current.find(c => c._id === message.senderId);
      const title = contact ? contact.username : 'New Message';
      new Notification(title, {
        body: message.content,
        icon: contact?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(title)}`
      });
    }
  };

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setContacts([]);
      setActiveChat(null);
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers({});
      return;
    }

    // Fetch initial contacts on login
    fetchContacts();

    // Connect to Socket.IO server
    const token = localStorage.getItem('chat_token');
    const socketInstance = io(import.meta.env.VITE_API_URL, {
  auth: { token }
});

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
    });

    // Handle online users list
    socketInstance.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    // Handle single user online status updates
    socketInstance.on('user_status_change', (data) => {
      const { userId, onlineStatus, lastSeen } = data;
      
      // Update online status array
      setOnlineUsers((prev) => {
        if (onlineStatus === 'online') {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });

      // Update in contacts list
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c._id === userId ? { ...c, onlineStatus, lastSeen } : c
        )
      );
    });

    // Handle receiving a message from someone else
    socketInstance.on('receive_message', (message) => {
      const activeChatId = activeChatRef.current?._id;
      
      // Play audio notification
      playNotificationSound();

      // Trigger push/system notification if page is hidden
      triggerDesktopNotification(message);

      if (activeChatId === message.senderId) {
        // Appending to active conversation
        setMessages((prev) => [...prev, message]);
        
        // Mark message as seen
        socketInstance.emit('mark_messages_seen', { senderId: message.senderId });
        api.put(`/api/messages/seen/${message.senderId}`).catch((err) =>
          console.error('Error marking seen via API:', err)
        );
      } else {
        // Increment unread count for that contact
        setContacts((prevContacts) =>
          prevContacts.map((c) =>
            c._id === message.senderId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        );
      }

      // Update last message in contact list and reorder contacts
      updateContactLastMessage(message.senderId, message);
    });

    // Handle confirmation of sent message
    socketInstance.on('message_sent', (message) => {
      setMessages((prev) => [...prev, message]);
      updateContactLastMessage(message.receiverId, message);
    });

    // Handle typing status from other users
    socketInstance.on('typing_status', (data) => {
      const { senderId, isTyping } = data;
      setTypingUsers((prev) => ({
        ...prev,
        [senderId]: isTyping
      }));
    });

    // Handle receipt marking messages as seen by our recipient
    socketInstance.on('messages_marked_seen', (data) => {
      const { seenBy } = data;
      const activeChatId = activeChatRef.current?._id;
      
      if (activeChatId === seenBy) {
        // Update all our messages in the list to seen
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === user._id && msg.readStatus !== 'seen'
              ? { ...msg, readStatus: 'seen' }
              : msg
          )
        );
      }

      // Update in contacts metadata
      setContacts((prevContacts) =>
        prevContacts.map((c) =>
          c._id === seenBy && c.lastMessage && c.lastMessage.senderId === user._id
            ? { ...c, lastMessage: { ...c.lastMessage, readStatus: 'seen' } }
            : c
        )
      );
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Update contact's last message info and sort contact to the top
  const updateContactLastMessage = (contactId, message) => {
    setContacts((prevContacts) => {
      const contactIdx = prevContacts.findIndex((c) => c._id === contactId);
      if (contactIdx === -1) return prevContacts;

      const updatedContact = {
        ...prevContacts[contactIdx],
        lastMessage: {
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId,
          readStatus: message.readStatus
        }
      };

      const rest = prevContacts.filter((c) => c._id !== contactId);
      // Place updated contact at index 0 (top of chat list)
      return [updatedContact, ...rest];
    });
  };

  // Fetch older messages for infinite scrolling
  const loadMoreMessages = async () => {
    if (!activeChat || loadingMessages || !hasMoreMessages) return;

    setLoadingMessages(true);
    try {
      const firstMessage = messages[0];
      const beforeTimestamp = firstMessage ? firstMessage.createdAt : null;
      
      const url = beforeTimestamp 
        ? `/api/messages/${activeChat._id}?before=${beforeTimestamp}&limit=30` 
        : `/api/messages/${activeChat._id}?limit=30`;
        
      const { data } = await api.get(url);

      if (data.length < 30) {
        setHasMoreMessages(false);
      }

      if (data.length > 0) {
        setMessages((prev) => [...data, ...prev]);
      }
    } catch (err) {
      console.error('Error loading older messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Effect: When activeChat changes, fetch message history and clear unread counts
  useEffect(() => {
    const loadConversation = async () => {
      if (!activeChat) {
        setMessages([]);
        setHasMoreMessages(true);
        return;
      }

      setLoadingMessages(true);
      setHasMoreMessages(true);
      try {
        // Fetch last 30 messages
        const { data } = await api.get(`/api/messages/${activeChat._id}?limit=30`);
        setMessages(data);
        if (data.length < 30) {
          setHasMoreMessages(false);
        }

        // Mark all messages as read
        await api.put(`/api/messages/seen/${activeChat._id}`);
        
        // Notify socket
        if (socket) {
          socket.emit('mark_messages_seen', { senderId: activeChat._id });
        }

        // Reset local unreadCount
        setContacts((prevContacts) =>
          prevContacts.map((c) =>
            c._id === activeChat._id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        console.error('Error loading conversation:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadConversation();
  }, [activeChat]);

  const sendMessage = (content) => {
  const trimmed = content.trim();

  if (!trimmed || !socket || !activeChat) return;

  socket.emit('send_message', {
    receiverId: activeChat._id,
    content: trimmed
  });
};

  const sendTyping = () => {
    if (socket && activeChat) {
      socket.emit('typing', { receiverId: activeChat._id });
    }
  };

  const sendStopTyping = () => {
    if (socket && activeChat) {
      socket.emit('stop_typing', { receiverId: activeChat._id });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        contacts,
        activeChat,
        messages,
        typingUsers,
        loadingMessages,
        hasMoreMessages,
        setActiveChat,
        sendMessage,
        sendTyping,
        sendStopTyping,
        loadMoreMessages,
        fetchContacts
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useChat = () => useContext(SocketContext);
