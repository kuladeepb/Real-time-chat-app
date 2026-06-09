import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on app start
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('chat_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Failed to load user on mount:', err);
        localStorage.removeItem('chat_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/api/auth/login', { email, password });

      localStorage.setItem('chat_token', data.token);

      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        bio: data.bio,
        website: data.website,
        onlineStatus: data.onlineStatus,
        lastSeen: data.lastSeen
      });

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/api/auth/register', { username, email, password });

      localStorage.setItem('chat_token', data.token);

      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        bio: data.bio,
        website: data.website,
        onlineStatus: data.onlineStatus,
        lastSeen: data.lastSeen
      });

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('chat_token');
    setUser(null);
    setError(null);
  };

  // Update profile handler
  const updateProfile = async (updates) => {
    try {
      const { data } = await api.put('/api/auth/profile', updates);
      setUser((prev) => ({ ...prev, ...data }));
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Update failed';
      return { success: false, error: errMsg };
    }
  };

  // Helper to get current token
  const getToken = () => localStorage.getItem('chat_token');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
        updateProfile,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);