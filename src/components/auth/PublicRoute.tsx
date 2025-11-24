import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from '@tanstack/react-router';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/crm" replace />;
  }
  
  return <>{children}</>;
}
