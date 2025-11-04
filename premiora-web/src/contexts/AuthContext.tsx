import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { AuthService } from '../services/authService';
import { signOut } from '../lib/supabaseAuth';
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
  }, [user]); // Adicionada dependência de user

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
      const result = await AuthService.signUpWithEmail(email, password);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signOut();
      if (result.error) {
        throw result.error;
      }
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Escutar mudanças na sessão e gerenciar estado
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticação...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          if (isMounted) setLoading(false);
          return;
        }

        console.log('✅ Sessão obtida:', { hasSession: !!session, userId: session?.user?.id });
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false); // Finalizar loading imediatamente após definir usuário
        }

        // Buscar perfil em background (não bloqueia a UI)
        if (session?.user) {
          console.log('👤 Usuário autenticado, buscando perfil em background...');

          // Buscar perfil diretamente para evitar stale closure
          AuthService.fetchUserProfile(session.user.id).then(profile => {
            if (isMounted) {
              setUserProfile(profile);
            }
          }).catch(err => {
            console.error('Profile fetch failed:', err);
          });
        } else {
          console.log('❌ Nenhum usuário autenticado');
          if (isMounted) {
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('💥 Erro geral ao inicializar autenticação:', error);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        console.log('🔄 Auth state change:', event, { hasSession: !!session, userId: session?.user?.id });

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false); // Finalizar loading imediatamente
        }

        // Buscar perfil em background (não bloqueia a UI)
        if (session?.user) {
          console.log('👤 Auth state change - usuário autenticado, buscando perfil em background...');

          // Buscar perfil diretamente para evitar stale closure
          AuthService.fetchUserProfile(session.user.id).then(profile => {
            if (isMounted) {
              setUserProfile(profile);
            }
          }).catch(err => {
            console.error('Profile fetch failed:', err);
          });
        } else {
          console.log('❌ Auth state change - nenhum usuário autenticado');
          if (isMounted) {
            setUserProfile(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signOut: handleSignOut,
    loading,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
