import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
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
          redirectTo: `${window.location.origin}/home`,
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

      console.log('📝 Dados para inserir:', {
        id: user.id,
        email: user.email,
        name: displayName,
        avatar_url: user.user_metadata?.avatar_url || null
      });

      // Primeiro, tentar inserir (funciona melhor com RLS)
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: displayName,
          avatar_url: user.user_metadata?.avatar_url || null,
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
              avatar_url: user.user_metadata?.avatar_url || null,
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
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
