import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check admin status when user changes
  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!user) {
        setAdmin(false);
        setAdminLoading(false);
        return;
      }
      setAdminLoading(true);
      try {
        const { data } = await supabase.rpc('is_admin');
        if (!cancelled) {
          setAdmin(data === true);
        }
      } catch (e) {
        if (!cancelled) {
          setAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setAdminLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isAdmin = () => admin;

  return {
    user,
    session,
    loading,
    adminLoading,
    signInWithGoogle,
    signOut,
    isAdmin
  };
};