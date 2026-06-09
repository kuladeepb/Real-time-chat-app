import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { Search, SquarePen, Sun, Moon, Compass, LogOut } from 'lucide-react';
import { formatContactDate } from '../utils/helpers';

/* ── tiny local hook for dark mode ── */
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  return [isDark, setIsDark];
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { contacts, activeChat, setActiveChat, onlineUsers, fetchContacts } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useTheme();
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isOnline = (contact) =>
    onlineUsers.includes(contact._id) || contact.onlineStatus === 'online';

  return (
    <div className="w-full md:w-[360px] h-full flex flex-col bg-white dark:bg-black border-r border-[#dbdbdb] dark:border-[#262626] transition-colors duration-300">

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        {/* Username (Instagram shows username in header) */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 group"
        >
          {/* Avatar with online ring */}
          <div className={`story-ring ${user?.onlineStatus === 'online' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="story-ring-inner">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          </div>
          <span className="font-bold text-[15px] text-[#262626] dark:text-[#f5f5f5] group-hover:opacity-70 transition-opacity">
            {user?.username}
          </span>
        </button>

        <div className="flex items-center gap-1">
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDark
              ? <Sun className="h-5 w-5 text-amber-400" />
              : <Moon className="h-5 w-5 text-indigo-500" />
            }
          </button>

          {/* Explore */}
          <button
            onClick={() => navigate('/explore')}
            className="p-2 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors"
            title="Explore users"
          >
            <Compass className="h-5 w-5" />
          </button>

          {/* New message (compose) */}
          <button
            className="p-2 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors"
            title="New message"
          >
            <SquarePen className="h-5 w-5" />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* ── Messages label ── */}
      <div className="px-4 py-1">
        <h2 className="text-[#262626] dark:text-[#f5f5f5] font-bold text-base">Messages</h2>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#efefef] dark:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] rounded-lg outline-none border-0 transition-colors"
          />
        </div>
      </div>

      {/* ── Online users stories strip ── */}
      {onlineUsers.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {contacts
              .filter((c) => isOnline(c))
              .slice(0, 8)
              .map((c) => (
                <button
                  key={c._id}
                  onClick={() => setActiveChat(c)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 group"
                >
                  <div className="story-ring">
                    <div className="story-ring-inner">
                      <img
                        src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.username}`}
                        alt={c.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#262626] dark:text-[#f5f5f5] truncate max-w-[52px] text-center">
                    {c.username}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ── Contacts list ── */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-[#8e8e8e] text-sm">No conversations yet</p>
            <p className="text-[#8e8e8e] text-xs">Search for users to start chatting</p>
          </div>
        ) : (
          contacts.map((contact) => {
            const selected  = activeChat?._id === contact._id;
            const online    = isOnline(contact);
            const hasUnread = contact.unreadCount > 0;

            return (
              <button
                key={contact._id}
                onClick={() => setActiveChat(contact)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors outline-none text-left
                  ${selected
                    ? 'bg-[#efefef] dark:bg-[#1a1a1a]'
                    : 'hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a]'
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {online ? (
                    <div className="story-ring">
                      <div className="story-ring-inner">
                        <img
                          src={contact.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.username}`}
                          alt={contact.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={contact.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.username}`}
                      alt={contact.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  {/* Online green dot */}
                  {online && (
                    <span className="absolute bottom-1 right-1 block h-3 w-3 rounded-full bg-[#3ea335] ring-2 ring-white dark:ring-black" />
                  )}
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm truncate ${hasUnread ? 'font-bold text-[#262626] dark:text-[#f5f5f5]' : 'font-semibold text-[#262626] dark:text-[#f5f5f5]'}`}>
                      {contact.username}
                    </span>
                    <span className="text-[11px] text-[#8e8e8e] whitespace-nowrap ml-2">
                      {contact.lastMessage ? formatContactDate(contact.lastMessage.createdAt) : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${hasUnread ? 'text-[#262626] dark:text-[#f5f5f5] font-semibold' : 'text-[#8e8e8e]'}`}>
                      {contact.lastMessage ? contact.lastMessage.content : 'No messages yet'}
                    </p>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="flex-shrink-0 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-white font-bold text-[10px]"
                        style={{ background: 'linear-gradient(45deg, #833AB4, #FD1D1D, #FCB045)' }}>
                        {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
