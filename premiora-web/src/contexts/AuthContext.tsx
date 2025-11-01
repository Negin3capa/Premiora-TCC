import React, { createContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

// Interface para o perfil do usuário
interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

// Criar contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para login com Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
          scopes: 'openid email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
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

  /**
   * Realiza login com Facebook usando OAuth do Supabase
   * Requer configuração prévia do aplicativo Facebook no Supabase
   */
  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) {
        console.error('Erro ao fazer login com Facebook:', error.message);
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
      // Após login bem-sucedido, setar loading false
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Função para registro com email e senha
  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) {
        console.error('Erro ao registrar com email:', error.message);
        throw error;
      }

      console.log('Signup realizado com sucesso:', data);

      // Para registro de email/senha, tentar criar perfil diretamente após signup
      if (data.user) {
        console.log('Tentando criar perfil para usuário:', data.user);
        try {
          await upsertUserProfile(data.user);
          console.log('Perfil criado/verificado após signup');
        } catch (profileError) {
          console.error('Erro ao criar perfil após cadastro:', profileError);
          // Não falha o signup por causa do perfil, apenas registra o erro
        }
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
  // Esta função roda em background e não bloqueia o fluxo de autenticação
  const upsertUserProfile = async (user: User) => {
    try {
      console.log('🔄 Criando/atualizando perfil do usuário:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        session: !!supabase.auth.getUser()
      });

      // Para usuários de email/senha, podemos tentar extrair nome do email ou deixar nulo
      const displayName = user.user_metadata?.full_name ||
                         user.user_metadata?.name ||
                         (user.email ? user.email.split('@')[0] : null);

      // Obtém a URL do avatar (Google OAuth usa 'picture', outros podem usar 'avatar_url')
      const avatarUrl = user.user_metadata?.avatar_url ||
                       user.user_metadata?.picture || null;



      console.log('📝 Dados para inserir:', {
        id: user.id,
        email: user.email,
        name: displayName,
        avatar_url: avatarUrl
      });

      // Primeiro, tentar inserir (funciona melhor com RLS)
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: displayName,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro na inserção do perfil:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });

        // Se falhar por chave duplicada, tentar atualizar
        if (insertError.message?.includes('duplicate key') || insertError.code === '23505') {
          console.log('🔄 Chave duplicada, tentando atualizar...');
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({
              name: displayName,
              avatar_url: avatarUrl,
            })
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Erro na atualização do perfil:', updateError);
          } else {
            console.log('✅ Perfil atualizado com sucesso:', updateData);
          }
        } else {
          // Log completamente o erro para debug
          console.error('🔍 Detalhes do erro de permissão:', {
            error: insertError,
            userId: user.id,
            email: user.email,
            authUser: await supabase.auth.getUser()
          });
          throw insertError;
        }
      } else {
        console.log('✅ Perfil criado com sucesso via insert:', insertData);
      }
    } catch (err) {
      console.error('💥 Erro geral ao upsertar perfil do usuário:', err);
      // Não lançamos erro para não quebrar o fluxo de autenticação
    }
  };

  // Função para buscar o perfil do usuário do banco de dados
  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        setUserProfile(null);
        return;
      }

      setUserProfile(profile);
    } catch (err) {
      console.error('Erro geral ao buscar perfil:', err);
      setUserProfile(null);
    }
  };

  // Escutar mudanças na sessão
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // Executa upsert em background sem bloquear
        if (session?.user) {
          upsertUserProfile(session.user).catch(err =>
            console.error('Background upsert failed:', err)
          );

          // Após upsert, tenta buscar o perfil atualizado
          setTimeout(() => {
            refreshUserProfile();
          }, 100);
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Executa upsert em background sem bloquear
        if (session?.user) {
          upsertUserProfile(session.user).catch(err =>
            console.error('Background upsert failed:', err)
          );

          // Após upsert, tenta buscar o perfil atualizado
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
  }, []);

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
