import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Smile, Phone, Video, Info, Loader2, MessageCircle, Image, Mic } from 'lucide-react';
import MessageBubble from './MessageBubble';
import EmojiPicker from 'emoji-picker-react';
import { formatLastSeen } from '../utils/helpers';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    activeChat,
    setActiveChat,
    messages,
    sendMessage,
    sendTyping,
    sendStopTyping,
    typingUsers,
    loadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    onlineUsers
  } = useChat();

  const [newMessage, setNewMessage]     = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping]         = useState(false);

  const scrollRef              = useRef(null);
  const typingTimeoutRef       = useRef(null);
  const isInitialLoadRef       = useRef(true);
  const scrollHeightBeforeLoad = useRef(0);
  const inputRef               = useRef(null);

  const isTargetOnline  = activeChat
    ? onlineUsers.includes(activeChat._id) || activeChat.onlineStatus === 'online'
    : false;
  const isTargetTyping  = activeChat ? typingUsers[activeChat._id] : false;

  // Reset initial scroll flag on chat change
  useEffect(() => { isInitialLoadRef.current = true; }, [activeChat]);

  // Scroll management
  useEffect(() => {
    if (!scrollRef.current) return;

    if (isInitialLoadRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      isInitialLoadRef.current = false;
    } else if (scrollHeightBeforeLoad.current > 0) {
      const diff = scrollRef.current.scrollHeight - scrollHeightBeforeLoad.current;
      scrollRef.current.scrollTop = diff;
      scrollHeightBeforeLoad.current = 0;
    } else {
      const nearBottom =
        scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 150;
      if (nearBottom) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (activeChat && inputRef.current) inputRef.current.focus();
  }, [activeChat]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) { setIsTyping(true); sendTyping(); }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendStopTyping();
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage('');
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    sendStopTyping();
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleScroll = () => {
    if (!scrollRef.current || loadingMessages || !hasMoreMessages) return;
    if (scrollRef.current.scrollTop <= 20) {
      scrollHeightBeforeLoad.current = scrollRef.current.scrollHeight;
      loadMoreMessages();
    }
  };

  // ── Empty state ──────────────────────────────────────────
  if (!activeChat) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Instagram DM icon */}
          <div className="w-24 h-24 rounded-full border-2 border-[#262626] dark:border-[#f5f5f5] flex items-center justify-center mb-2 animate-float-slow">
            <MessageCircle className="h-12 w-12 text-[#262626] dark:text-[#f5f5f5] stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-semibold text-[#262626] dark:text-[#f5f5f5]">Your messages</h3>
          <p className="text-sm text-[#8e8e8e] text-center max-w-[220px] leading-relaxed">
            Send a message to start a conversation.
          </p>
          <button
            onClick={() => {}}
            className="mt-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3797F0, #0056cc)' }}
          >
            Send message
          </button>
        </div>
      </div>
    );
  }

  // ── Active conversation ───────────────────────────────────
  return (
    <div className="flex-1 h-full flex flex-col bg-white dark:bg-black transition-colors duration-300 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#dbdbdb] dark:border-[#262626] bg-white dark:bg-black z-10">

        {/* Mobile back */}
        <button
          onClick={() => setActiveChat(null)}
          className="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Avatar + name + status */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            {isTargetOnline ? (
              <div className="story-ring">
                <div className="story-ring-inner">
                  <img
                    src={activeChat.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activeChat.username}`}
                    alt={activeChat.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <img
                src={activeChat.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activeChat.username}`}
                alt={activeChat.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            {isTargetOnline && (
              <span className="absolute bottom-0.5 right-0.5 block h-2.5 w-2.5 rounded-full bg-[#3ea335] ring-2 ring-white dark:ring-black" />
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#262626] dark:text-[#f5f5f5] leading-tight">
              {activeChat.username}
            </h2>
            <p className="text-xs text-[#8e8e8e] leading-tight mt-0.5">
              {isTargetTyping
                ? <span className="text-[#3797F0] font-medium">typing...</span>
                : isTargetOnline
                  ? 'Active now'
                  : formatLastSeen(activeChat.lastSeen)
              }
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors" title="Voice call">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors" title="Video call">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors" title="Info">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-white dark:bg-black transition-colors duration-300"
      >
        {/* Load more spinner */}
        {loadingMessages && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#8e8e8e]" />
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}

        {/* Typing indicator */}
        {isTargetTyping && (
          <div className="flex justify-start mb-2">
            <div className="flex items-center gap-1 px-4 py-3 rounded-[22px] rounded-bl-[4px] bg-[#efefef] dark:bg-[#262626]">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 py-3 bg-white dark:bg-black border-t border-[#dbdbdb] dark:border-[#262626] relative">

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[#dbdbdb] dark:border-[#363636]">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              searchDisabled
              skinTonesDisabled
              height={300}
              width={300}
            />
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-[#3797F0]' : 'text-[#262626] dark:text-[#f5f5f5] hover:text-[#3797F0]'}`}
          >
            <Smile className="h-6 w-6" />
          </button>

          {/* Image button */}
          <button
            type="button"
            className="p-2 rounded-full text-[#262626] dark:text-[#f5f5f5] hover:text-[#3797F0] transition-colors"
          >
            <Image className="h-6 w-6" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
              className="w-full px-4 py-2.5 text-sm bg-transparent border border-[#dbdbdb] dark:border-[#363636] rounded-full text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] outline-none focus:border-[#a8a8a8] dark:focus:border-[#555] transition-colors"
            />
          </div>

          {/* Send or mic (Instagram-style: shows send only when there's text) */}
          {newMessage.trim() ? (
            <button
              type="submit"
              className="p-2 font-semibold text-sm transition-colors"
              style={{ color: '#3797F0' }}
            >
              Send
            </button>
          ) : (
            <button
              type="button"
              className="p-2 rounded-full text-[#262626] dark:text-[#f5f5f5] hover:text-[#3797F0] transition-colors"
            >
              <Mic className="h-6 w-6" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
