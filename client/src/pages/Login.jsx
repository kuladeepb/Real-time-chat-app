import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    const res = await login(email, password);
    if (res.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-black px-4 transition-colors duration-300">

      {/* ── Decorative blurred orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-float-slow"
          style={{ background: 'linear-gradient(45deg, #833AB4, #FD1D1D)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10 animate-float-reverse"
          style={{ background: 'linear-gradient(45deg, #FCB045, #FD1D1D)' }} />
      </div>

      <div className="w-full max-w-[350px] relative z-10">

        {/* ── Instagram Logo Card ── */}
        <div className="bg-white dark:bg-[#121212] border border-[#dbdbdb] dark:border-[#262626] rounded-sm px-10 py-12 mb-3 text-center shadow-sm animate-slide-up">

          {/* Instagram wordmark with gradient */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight ig-gradient-text" style={{ fontFamily: 'Billabong, cursive, Georgia, serif' }}>
              Chatgram
            </h1>
            <p className="text-[#8e8e8e] text-sm mt-1">Connect &amp; Chat in Real-Time</p>
          </div>

          {/* Error alert */}
          {(validationError || error) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-md text-center">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{validationError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Email */}
            <div className="relative">
              <input
                id="login-email"
                type="email"
                placeholder="Phone number, username, or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="ig-input text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] text-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="ig-input pr-14 text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262626] dark:text-[#f5f5f5] opacity-60 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="ig-btn-primary mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</>
              ) : 'Log in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-px bg-[#dbdbdb] dark:bg-[#363636]" />
            <span className="text-xs font-semibold text-[#8e8e8e]">OR</span>
            <div className="flex-1 h-px bg-[#dbdbdb] dark:bg-[#363636]" />
          </div>

          {/* Sign up link */}
          <p className="text-sm text-[#8e8e8e]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3797F0] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* ── Bottom card ── */}
        <div className="bg-white dark:bg-[#121212] border border-[#dbdbdb] dark:border-[#262626] rounded-sm py-4 text-center">
          <p className="text-sm text-[#262626] dark:text-[#f5f5f5]">
            New to Chatgram?{' '}
            <Link to="/register" className="text-[#3797F0] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#8e8e8e] mt-6">
          © 2025 Chatgram from Meta
        </p>
      </div>
    </div>
  );
};

export default Login;
