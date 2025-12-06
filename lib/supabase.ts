import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Flag to check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Use browser's localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

// Create a mock client for offline mode when credentials are missing
const createMockClient = (): SupabaseClient => {
  const mockResponse = { data: null, error: { message: 'Supabase not configured - running in offline mode' } };
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => mockResponse,
    signUp: async () => mockResponse,
    signOut: async () => ({ error: null }),
    signInAnonymously: async () => mockResponse,
  };
  
  const mockQueryResult = Promise.resolve({ data: null, error: null, count: 0 });
  
  const mockQuery: any = () => {
    const chainable: any = {
      select: () => chainable,
      insert: () => chainable,
      update: () => chainable,
      delete: () => chainable,
      upsert: () => chainable,
      eq: () => chainable,
      neq: () => chainable,
      gt: () => chainable,
      gte: () => chainable,
      lt: () => chainable,
      lte: () => chainable,
      like: () => chainable,
      ilike: () => chainable,
      is: () => chainable,
      in: () => chainable,
      not: () => chainable,
      or: () => chainable,
      and: () => chainable,
      order: () => chainable,
      limit: () => chainable,
      range: () => chainable,
      match: () => chainable,
      filter: () => chainable,
      contains: () => chainable,
      containedBy: () => chainable,
      single: () => mockQueryResult,
      maybeSingle: () => mockQueryResult,
      then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
      catch: () => mockQueryResult,
    };
    return chainable;
  };

  return {
    auth: mockAuth,
    from: () => mockQuery(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Offline mode' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as SupabaseClient;
};

// Export the real client if configured, otherwise export mock client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createMockClient();

// Log warning if running in offline mode
if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not found. Running in offline mode. Reports will be saved locally.');
}
