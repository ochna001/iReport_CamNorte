import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;
  isGuestMode: boolean;
  isOffline: boolean;
  deviceId: string | null;
  signInAnonymously: () => Promise<void>;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  loading: true, 
  isAnonymous: false,
  isGuestMode: false,
  isOffline: false,
  deviceId: null,
  signInAnonymously: async () => {},
  enterGuestMode: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const DEVICE_ID_KEY = '@device_id';
const GUEST_SESSION_KEY = '@guest_session_id';

const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

const GUEST_MODE_KEY = '@guest_mode';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
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

      // Check if user was in guest mode (browsing without auth)
      const wasGuestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      if (wasGuestMode === 'true') {
        setIsGuestMode(true);
      }

      // Always try to connect - like YouTube, FB, etc.
      // Don't rely on system's reported connectivity status
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session) {
          setSession(session);
          setIsAnonymous(session.user.is_anonymous || false);
          
          // Store guest session ID for report tracking
          if (session.user.is_anonymous) {
            await AsyncStorage.setItem(GUEST_SESSION_KEY, session.user.id);
          }
        }
        setIsOffline(false);
      } catch (error) {
        console.log('Session check failed or timed out:', error);
        setIsOffline(true);
      }
      
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes - this also indicates we're online
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAnonymous(session?.user?.is_anonymous || false);
      // If we receive auth events, we're online
      if (_event !== 'INITIAL_SESSION') {
        setIsOffline(false);
      }
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
      setIsGuestMode(false); // No longer in guest mode, now have actual session
      // Store guest session for tracking
      await AsyncStorage.setItem(GUEST_SESSION_KEY, data.session.user.id);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
    } else if (error) {
      console.error('Anonymous sign-in error:', error);
      throw error;
    }
  };

  // Enter guest mode without creating a Supabase session
  // This allows browsing the app without cluttering auth table
  const enterGuestMode = async () => {
    setIsGuestMode(true);
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
  };

  return (
    <AuthContext.Provider value={{ session, loading, isAnonymous, isGuestMode, isOffline, deviceId, signInAnonymously, enterGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
};
