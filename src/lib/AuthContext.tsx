import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple mock auth for demo - will be replaced with Supabase
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('career_engine_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock validation
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    const mockUser = { id: crypto.randomUUID(), email };
    setUser(mockUser);
    localStorage.setItem('career_engine_user', JSON.stringify(mockUser));
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    // Mock validation
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }
    if (!email.includes('@')) {
      return { error: 'Please enter a valid email' };
    }

    const mockUser = { id: crypto.randomUUID(), email };
    setUser(mockUser);
    localStorage.setItem('career_engine_user', JSON.stringify(mockUser));
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('career_engine_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
