import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await authService.getCurrentUser();
      const userData = res.data || res.user || res;
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('Failed to fetch profile, clearing session.');
      authService.logout();
      setUser(null);
      setToken(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.token) {
        setToken(res.token);
        const userData = await fetchProfile();
        toast.success(`Welcome back, ${userData?.name || res.user?.name || 'User'}!`);
        return { success: true, user: userData || res.user };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to login. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.token) {
        setToken(res.token);
        const fetchedUser = await fetchProfile();
        toast.success(res.message || 'Registration successful!');
        return { success: true, user: fetchedUser || res.user };
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    return await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
