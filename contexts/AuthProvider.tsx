import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;
  deviceId: string | null;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  loading: true, 
  isAnonymous: false,
  deviceId: null,
  signInAnonymously: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const DEVICE_ID_KEY = '@device_id';
const GUEST_SESSION_KEY = '@guest_session_id';

const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      // Get or create persistent device ID
      let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!storedDeviceId) {
        storedDeviceId = generateDeviceId();
        await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
      }
      setDeviceId(storedDeviceId);

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setIsAnonymous(session.user.is_anonymous || false);
        
        // Store guest session ID for report tracking
        if (session.user.is_anonymous) {
          await AsyncStorage.setItem(GUEST_SESSION_KEY, session.user.id);
        }
      } else {
        // Check if we had a previous guest session
        const previousGuestId = await AsyncStorage.getItem(GUEST_SESSION_KEY);
        if (previousGuestId) {
          // Try to restore the guest session by signing in anonymously again
          // The device_id will be used to link reports
          console.log('Previous guest session found:', previousGuestId);
        }
      }
      
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAnonymous(session?.user?.is_anonymous || false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          device_id: deviceId,
        }
      }
    });
    if (!error && data.session) {
      setSession(data.session);
      setIsAnonymous(true);
      // Store guest session for tracking
      await AsyncStorage.setItem(GUEST_SESSION_KEY, data.session.user.id);
    } else if (error) {
      console.error('Anonymous sign-in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, isAnonymous, deviceId, signInAnonymously }}>
      {children}
    </AuthContext.Provider>
  );
};
