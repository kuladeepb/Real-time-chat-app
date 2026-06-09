import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [username, setUsername]             = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const res = await register(username, email, password);
    if (res.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-black px-4 transition-colors duration-300">

      {/* Decorative blurred orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 animate-float-slow"
          style={{ background: 'linear-gradient(45deg, #833AB4, #FD1D1D)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10 animate-float-reverse"
          style={{ background: 'linear-gradient(45deg, #FCB045, #FD1D1D)' }} />
      </div>

      <div className="w-full max-w-[350px] relative z-10">

        {/* Main Card */}
        <div className="bg-white dark:bg-[#121212] border border-[#dbdbdb] dark:border-[#262626] rounded-sm px-10 py-10 mb-3 shadow-sm animate-slide-up">

          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black tracking-tight ig-gradient-text" style={{ fontFamily: 'Billabong, cursive, Georgia, serif' }}>
              Chatgram
            </h1>
            <p className="text-[#262626] dark:text-[#f5f5f5] font-semibold text-base mt-3 leading-snug px-2">
              Sign up to see messages from your friends.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-4 gap-3">
            <div className="flex-1 h-px bg-[#dbdbdb] dark:bg-[#363636]" />
            <span className="text-xs font-semibold text-[#8e8e8e]">OR</span>
            <div className="flex-1 h-px bg-[#dbdbdb] dark:bg-[#363636]" />
          </div>

          {/* Error */}
          {(validationError || error) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-md text-center">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{validationError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              id="reg-email"
              type="email"
              placeholder="Mobile Number or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="ig-input text-sm text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e]"
            />

            <input
              id="reg-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="ig-input text-sm text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e]"
            />

            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="ig-input pr-14 text-sm text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262626] dark:text-[#f5f5f5] opacity-60 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="ig-input pr-14 text-sm text-[#262626] dark:text-[#f5f5f5] placeholder-[#8e8e8e]"
              />
            </div>

            <p className="text-[10px] text-[#8e8e8e] text-center leading-relaxed py-1">
              By signing up, you agree to our{' '}
              <span className="font-semibold text-[#262626] dark:text-[#f5f5f5]">Terms</span>,{' '}
              <span className="font-semibold text-[#262626] dark:text-[#f5f5f5]">Privacy Policy</span> and{' '}
              <span className="font-semibold text-[#262626] dark:text-[#f5f5f5]">Cookies Policy</span>.
            </p>

            <button
              id="reg-submit"
              type="submit"
              disabled={loading || !username || !email || !password || !confirmPassword}
              className="ig-btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>
              ) : 'Sign Up'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-[#8e8e8e]">
            Have an account?{' '}
            <Link to="/login" className="text-[#3797F0] font-semibold hover:underline">Log in</Link>
          </div>
        </div>

        {/* Bottom card */}
        <div className="bg-white dark:bg-[#121212] border border-[#dbdbdb] dark:border-[#262626] rounded-sm py-4 text-center">
          <p className="text-sm text-[#262626] dark:text-[#f5f5f5]">
            Have an account?{' '}
            <Link to="/login" className="text-[#3797F0] font-semibold hover:underline">Log in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#8e8e8e] mt-6">© 2025 Chatgram from Meta</p>
      </div>
    </div>
  );
};

export default Register;
