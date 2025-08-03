import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/api';
import { authService } from '@/services/api';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    city?: string,
    code?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  sendOTP: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check if user is already logged in
    checkCurrentUser();
  }, []);

  // Navigate when user changes
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading]);

  const checkCurrentUser = async () => {
    try {
      // Check if token exists in SecureStore
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // If token is invalid, clear it
        await SecureStore.deleteItemAsync('token');
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      // Clear invalid token on error
      await SecureStore.deleteItemAsync('token');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string) => {
    try {
      const response = await authService.sendOTP(email);
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    city?: string,
    code?: string
  ) => {
    try {
      setIsLoading(true);

      if (!code) {
        return { error: { message: 'OTP verification code is required' } };
      }

      const response = await authService.register({
        email,
        password,
        full_name: fullName,
        phone,
        city,
        code,
      });

      if (response.success && response.data) {
        // Store the token in SecureStore
        if (response.data.token) {
          await SecureStore.setItemAsync('token', response.data.token);
        }

        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        // Store the token in SecureStore
        if (response.data.token) {
          await SecureStore.setItemAsync('token', response.data.token);
        }

        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      console.log(error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      // Clear token from SecureStore
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear token even if logout API fails
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await authService.resetPassword(email);
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error } };
      }
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
        sendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
