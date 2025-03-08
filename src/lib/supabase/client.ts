import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { ConfigurationError } from '../errors'; 
import { retryWithBackoff } from '../utils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl?.startsWith('https://') || !supabaseAnonKey) {
  throw new ConfigurationError(
    'Invalid Supabase configuration. Please check your environment variables:\n' +
    '- VITE_SUPABASE_URL should start with https://\n' +
    '- VITE_SUPABASE_ANON_KEY should not be empty'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'health-rocket'
    },
    fetch: async (url, options) => {
      return retryWithBackoff(
        () => fetch(url, options),
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 5000,
          shouldRetry: (error) => {
            // Retry on network errors, 5xx server errors, or CORS errors
            return error instanceof TypeError ||
                   (error.status >= 500 && error.status < 600) ||
                   error.name === 'TypeError' ||
                   error.message === 'Failed to fetch';
          }
        }
      );
    }
  }
});