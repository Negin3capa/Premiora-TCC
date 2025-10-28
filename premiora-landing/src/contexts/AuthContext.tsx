import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provedor do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para login com Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error('Erro ao fazer login com Google:', error.message);
        throw error;
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Função para login com email e senha
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Erro ao fazer login com email:', error.message);
        throw error;
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Função para registro com email e senha
  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error('Erro ao registrar com email:', error.message);
        throw error;
      }
      // Após registro bem-sucedido, setar loading false, pois não loga automaticamente
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Função para logout
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error.message);
        throw error;
      }
      // Após logout, loading será setado false pelo onAuthStateChange
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Função para upsert do perfil do usuário na tabela 'users'
  const upsertUserProfile = async (user: User) => {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });
    if (error) {
      console.error('Erro ao upsertar perfil do usuário:', error.message);
    }
  };

  // Escutar mudanças na sessão
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await upsertUserProfile(session.user);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await upsertUserProfile(session.user);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
