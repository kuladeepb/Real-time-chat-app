import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/SocketContext';
import { ArrowLeft, Search, MessageCircle, UserCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ExplorePage() {
  const navigate = useNavigate();
  const { setActiveChat, contacts } = useChat();

  const [query, setQuery]   = useState('');
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  // FIX: Use `api` service (which auto-attaches Bearer token from localStorage)
  // instead of raw fetch with a missing `token` from useAuth()
  const searchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setUsers(data);
    } catch (err) {
      console.error('Search error:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(), 350);
    return () => clearTimeout(timer);
  }, [searchUsers]);

  const handleMessage = (user) => {
    // Find in existing contacts or construct a minimal object
    const existing = contacts.find((c) => c._id === user._id);
    setActiveChat(existing || user);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black transition-colors duration-300">

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-[#dbdbdb] dark:border-[#262626]">
        <div className="max-w-[600px] mx-auto px-4 h-[60px] flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-[#262626] dark:text-[#f5f5f5] flex-1">Explore People</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 py-4">

        {/* ── Search bar ── */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8e8e8e]" />
          <input
            id="explore-search"
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#efefef] dark:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] rounded-lg border-0 outline-none transition-colors"
          />
        </div>

        {/* ── Results ── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#8e8e8e]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <UserCircle2 className="h-16 w-16 text-[#dbdbdb] dark:text-[#363636]" />
            <p className="text-[#8e8e8e] text-sm">
              {query ? `No results for "${query}"` : 'Search for people to connect with'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full p-[2px] flex-shrink-0"
                  style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                >
                  <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-black">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#262626] dark:text-[#f5f5f5] truncate">{u.username}</p>
                  <p className="text-xs text-[#8e8e8e] truncate">{u.email}</p>
                  {u.bio && (
                    <p className="text-xs text-[#8e8e8e] truncate mt-0.5">{u.bio}</p>
                  )}
                </div>

                {/* Message button */}
                <button
                  onClick={() => handleMessage(u)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg flex-shrink-0 transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3797F0, #0056cc)' }}
                  title={`Message ${u.username}`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}