import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AuthService from '@/lib/auth-service';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component that checks if user is authenticated before rendering its children
 * If not authenticated, redirects to login page
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!isAuthenticated) {
        // If Redux store doesn't have authentication status, check with backend
        const isValid = await AuthService.isAuthenticated();
        if (!isValid) {
          // If not authenticated, redirect to login
          router.replace('/login');
          return;
        }
      }
      setIsChecking(false);
    };
    
    checkAuthStatus();
  }, [isAuthenticated]);
  
  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  // User is authenticated, render children
  return <>{children}</>;
} 