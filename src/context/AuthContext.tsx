"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Starting auth state monitoring');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('AuthProvider: Auth state changed', {
        user: user ? {
          uid: user.uid,
          email: user.email,
        } : null
      });
      
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('AuthProvider: Auth state error', error);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth state monitoring');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 