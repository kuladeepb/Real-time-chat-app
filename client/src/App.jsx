import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';

// ── Loading spinner (Instagram style) ──────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-black gap-4">
    <h1 className="text-5xl font-black ig-gradient-text" style={{ fontFamily: 'Georgia, serif' }}>
      Chatgram
    </h1>
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: '#833AB4', borderTopColor: 'transparent' }} />
  </div>
);

// ── Protected Route ─────────────────────────────────────────
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  ) : (
    <Navigate to="/login" replace />
  );
};

// ── Public Route ────────────────────────────────────────────
const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

// ── App ─────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicRoute />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/explore" element={<ExplorePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
