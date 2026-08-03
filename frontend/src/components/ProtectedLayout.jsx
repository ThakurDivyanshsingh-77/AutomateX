import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedLayout = () => {
  const { isAuthenticated, loginAsDemo } = useAuth();

  // If no auth token found, default to instant demo mode for smooth preview experience
  if (!isAuthenticated) {
    loginAsDemo();
  }

  return <Outlet />;
};
