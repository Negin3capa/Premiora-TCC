import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { AuthService } from '../services/authService';
import type { UserProfile, AuthContextType } from '../types/auth';

// Criar contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticação que gerencia estado global de autenticação
 * Centraliza estado de usuário, sessão e perfil através da aplicação
 *
 * @component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Busca e atualiza o perfil do usuário no estado local
   */
  const refreshUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const profile = await AuthService.fetchUserProfile(user.id);
    setUserProfile(profile);
  }, [user]);

  /**
   * Handlers de autenticação que delegam para o AuthService
   */
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.signInWithGoogle();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.signInWithFacebook();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signInWithEmail(email, password);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signUpWithEmail(email, password);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  // Escutar mudanças na sessão e gerenciar estado
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // Gerenciar perfil em background
        if (session?.user) {
          AuthService.upsertUserProfile(session.user).catch(err =>
            console.error('Background profile upsert failed:', err)
          );

          // Buscar perfil após upsert
          setTimeout(() => {
            refreshUserProfile();
          }, 100);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Gerenciar perfil em background
        if (session?.user) {
          AuthService.upsertUserProfile(session.user).catch(err =>
            console.error('Background profile upsert failed:', err)
          );

          // Buscar perfil após upsert
          setTimeout(() => {
            refreshUserProfile();
          }, 100);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [refreshUserProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    loading,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
