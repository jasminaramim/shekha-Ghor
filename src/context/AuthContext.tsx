import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types/index.js';
import { api, setToken, removeToken } from '../services/api.js';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  bookmarkedSlugs: string[];
  toggleBookmark: (courseSlug: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setBookmarkedSlugs(res.data.user.bookmarks || []);
      } else {
        setUser(null);
        setBookmarkedSlugs([]);
      }
    } catch (err) {
      setUser(null);
      setBookmarkedSlugs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.auth.login({ identifier, password });
    if (res.success && res.user) {
      setUser(res.user);
      setBookmarkedSlugs(res.user.bookmarks || []);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'লগইন ব্যর্থ হয়েছে।' };
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const res = await api.auth.register({ name, username, email, password });
    if (res.success && res.user) {
      setUser(res.user);
      setBookmarkedSlugs(res.user.bookmarks || []);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'নিবন্ধন ব্যর্থ হয়েছে।' };
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setBookmarkedSlugs([]);
  };

  const toggleBookmark = async (courseSlug: string) => {
    if (!user) return false;
    const res = await api.progress.toggleBookmark(courseSlug);
    if (res.success) {
      if (res.isBookmarked) {
        setBookmarkedSlugs((prev) => [...prev, courseSlug]);
      } else {
        setBookmarkedSlugs((prev) => prev.filter((s) => s !== courseSlug));
      }
      return res.isBookmarked;
    }
    return false;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        bookmarkedSlugs,
        toggleBookmark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
