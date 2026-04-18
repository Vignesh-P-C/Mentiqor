import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });

  // Updated signUp to accept name
  const signUp = async (email, password, name) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0] } // store name in user metadata
      }
    });
  };

  const signOut = () => supabase.auth.signOut();

  // Helper to get user's display name
  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  };

  return { user, loading, signIn, signUp, signOut, getUserName };
}