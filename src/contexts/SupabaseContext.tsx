import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { signIn, signUp, signOut, resetPassword, updatePassword } from '../lib/supabase/auth';

interface SupabaseContextType {
  user: User | null;
  session:string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, newPassword: string) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session,setSession] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Test connection
        const { error: pingError } = await supabase.from('users').select('count').limit(1);
        setIsConnected(!pingError);

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setSession(session?.access_token)
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up reconnection check
    const checkConnection = setInterval(async () => {
      try {
        const { error } = await supabase.from('users').select('count').limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    }, 30000); // Check every 30 seconds


    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setSession(session?.access_token)
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {subscription.unsubscribe();
      clearInterval(checkConnection);
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <SupabaseContext.Provider value={value}>
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Connection lost. Retrying...
        </div>
      )}
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}