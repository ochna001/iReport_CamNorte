import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';

const AuthCallbackScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const incomingUrl = Linking.useURL();

  const resolvedParams = useMemo(() => {
    const urlFromLinking = incomingUrl || buildUrlFromParams(params);
    const parsedFromUrl = urlFromLinking ? extractParamsFromUrl(urlFromLinking) : {};

    return {
      access_token:
        parsedFromUrl.access_token ||
        getParamValue(params.access_token),
      refresh_token:
        parsedFromUrl.refresh_token ||
        getParamValue(params.refresh_token),
      code: parsedFromUrl.code || getParamValue(params.code),
    };
  }, [incomingUrl, params]);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('[AuthCallback] 1. Callback triggered. Params:', JSON.stringify(resolvedParams));
      
      const accessToken = resolvedParams.access_token;
      const refreshToken = resolvedParams.refresh_token;
      const authCode = resolvedParams.code;

      try {
        if (accessToken && refreshToken) {
          console.log('[AuthCallback] 2. Found tokens, setting session...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[AuthCallback] Session set error:', error);
            throw error;
          }
          console.log('[AuthCallback] 3. Session set successfully');
        } else if (authCode) {
          console.log('[AuthCallback] 2. Found auth code, exchanging...');
          const { error } = await supabase.auth.exchangeCodeForSession(authCode);

          if (error) {
            console.error('[AuthCallback] Code exchange error:', error);
            throw error;
          }
          console.log('[AuthCallback] 3. Code exchange successful');
        } else {
          console.warn('[AuthCallback] OAuth callback invoked without tokens/code');
        }

        console.log('[AuthCallback] 4. Redirecting to home...');
        router.replace('/(tabs)');
      } catch (error: any) {
        console.error('[AuthCallback] OAuth callback error:', error);
        Alert.alert(
          'Sign in failed',
          error?.message || 'Could not finish signing you in. Please try again.'
        );
        router.replace('/welcome');
      }
    };

    handleOAuthCallback();
  }, [resolvedParams, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.statusText}>Finishing sign in…</Text>
    </View>
  );
};

const getParamValue = (param?: string | string[]) => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};

const buildUrlFromParams = (params: Record<string, string | string[] | undefined>) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(getParamValue(value) || '')}`)
    .join('&');

  return query ? `ireportv1://auth/callback?${query}` : undefined;
};

const extractParamsFromUrl = (url: string) => {
  const queryParams = Linking.parse(url).queryParams ?? {};
  const hashIndex = url.indexOf('#');
  const hash = hashIndex > -1 ? url.slice(hashIndex + 1) : '';
  const hashParams = hash ? parseQueryString(hash) : {};

  return {
    ...queryParams,
    ...hashParams,
  } as Record<string, string>;
};

const parseQueryString = (query: string) => {
  return query.split('&').reduce<Record<string, string>>((acc, pair) => {
    if (!pair) return acc;
    const [key, value] = pair.split('=');
    if (key) {
      acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    return acc;
  }, {});
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
});

export default AuthCallbackScreen;
