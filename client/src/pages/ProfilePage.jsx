import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Grid, MessageCircle, Settings, Loader2, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio]           = useState('');
  const [website, setWebsite]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // Load user data into form
  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setWebsite(user.website || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateProfile({ bio, website });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-black">
        <Loader2 className="h-6 w-6 animate-spin text-[#8e8e8e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black transition-colors duration-300">

      {/* ── Instagram top nav ── */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-[#dbdbdb] dark:border-[#262626]">
        <div className="max-w-[935px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-[#262626] dark:text-[#f5f5f5]">{user.username}</h1>
          <button className="p-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-[935px] mx-auto px-4">

        {/* ── Profile header ── */}
        <div className="py-8 flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Avatar with IG story ring gradient */}
          <div className="flex-shrink-0">
            <div
              className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full p-[3px]"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <div className="w-full h-full rounded-full p-[3px] bg-white dark:bg-black">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-5">
              <h2 className="text-2xl font-light text-[#262626] dark:text-[#f5f5f5]">{user.username}</h2>
              <div className="flex gap-2">
                <button
                  className="px-5 py-1.5 text-sm font-semibold bg-[#efefef] dark:bg-[#363636] text-[#262626] dark:text-[#f5f5f5] rounded-lg hover:bg-[#dbdbdb] dark:hover:bg-[#444] transition-colors"
                >
                  Edit profile
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="p-1.5 bg-[#efefef] dark:bg-[#363636] text-[#262626] dark:text-[#f5f5f5] rounded-lg hover:bg-[#dbdbdb] dark:hover:bg-[#444] transition-colors"
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8 mb-5">
              <div className="text-center md:text-left">
                <span className="font-semibold text-[#262626] dark:text-[#f5f5f5] text-sm">0</span>
                <span className="text-[#262626] dark:text-[#f5f5f5] text-sm ml-1">posts</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-semibold text-[#262626] dark:text-[#f5f5f5] text-sm">—</span>
                <span className="text-[#262626] dark:text-[#f5f5f5] text-sm ml-1">followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-semibold text-[#262626] dark:text-[#f5f5f5] text-sm">—</span>
                <span className="text-[#262626] dark:text-[#f5f5f5] text-sm ml-1">following</span>
              </div>
            </div>

            {/* Bio display */}
            {user.bio && (
              <p className="text-sm text-[#262626] dark:text-[#f5f5f5] whitespace-pre-wrap mb-1">{user.bio}</p>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noreferrer"
                className="text-sm font-semibold text-[#3797F0] hover:underline">
                {user.website}
              </a>
            )}
            <p className="text-xs text-[#8e8e8e] mt-1">{user.email}</p>
          </div>
        </div>

        {/* ── Edit bio section ── */}
        <div className="mb-8 p-5 bg-white dark:bg-[#121212] border border-[#dbdbdb] dark:border-[#262626] rounded-xl">
          <h3 className="text-sm font-semibold text-[#262626] dark:text-[#f5f5f5] mb-4">Edit Profile</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={150}
                placeholder="Write something about yourself..."
                className="w-full px-3 py-2 text-sm bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#dbdbdb] dark:border-[#363636] rounded-lg text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] resize-none outline-none focus:border-[#a8a8a8] dark:focus:border-[#555] transition-colors"
              />
              <p className="text-xs text-[#8e8e8e] text-right mt-0.5">{bio.length}/150</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-1.5 block">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 text-sm bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#dbdbdb] dark:border-[#363636] rounded-lg text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] outline-none focus:border-[#a8a8a8] dark:focus:border-[#555] transition-colors"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #3797F0, #0056cc)' }}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="h-4 w-4" /> Saved!</>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-t border-[#dbdbdb] dark:border-[#262626] flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-widest uppercase transition-colors border-t-2 ${
              activeTab === 'posts'
                ? 'border-[#262626] dark:border-[#f5f5f5] text-[#262626] dark:text-[#f5f5f5]'
                : 'border-transparent text-[#8e8e8e] hover:text-[#262626] dark:hover:text-[#f5f5f5]'
            }`}
          >
            <Grid className="h-4 w-4" />
            Posts
          </button>
        </div>

        {/* ── Empty posts grid ── */}
        <div className="py-16 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full border-2 border-[#262626] dark:border-[#f5f5f5] flex items-center justify-center">
            <Grid className="h-8 w-8 text-[#262626] dark:text-[#f5f5f5] stroke-[1.5]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#262626] dark:text-[#f5f5f5]">No Posts Yet</h3>
          <p className="text-sm text-[#8e8e8e]">When you share photos, they will appear on your profile.</p>
        </div>

        {/* Logout */}
        <div className="pb-8 text-center">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-red-500 font-semibold hover:underline"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}