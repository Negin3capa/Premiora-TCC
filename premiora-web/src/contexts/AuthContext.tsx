import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { AuthService } from '../services/authService';
import { signOut } from '../lib/supabaseAuth';
import { clearSetupLock, clearExpiredSetupLocks } from '../utils/profileUtils';
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
  const currentUserIdRef = useRef<string | null>(null);

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
      // Limpar bloqueio do setup antes do logout
      if (user?.id) {
        clearSetupLock(user.id);
        console.log('🔓 Setup lock removido no logout para usuário:', user.id);
      }

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
  }, [user?.id]);

  // Escutar mudanças na sessão e gerenciar estado
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Limpar bloqueios expirados na inicialização
        clearExpiredSetupLocks();

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

          // Aguardar um pouco antes de buscar perfil para dar tempo ao callback OAuth processar
          setTimeout(async () => {
            if (!isMounted) return;

            // Buscar perfil diretamente para evitar stale closure
            AuthService.fetchUserProfile(session.user.id).then(profile => {
              if (isMounted) {
                // Se perfil é null, significa que o usuário foi deletado do banco
                // mas ainda tem sessão ativa - fazer logout automático
                if (profile === null) {
                  console.log('🚨 Usuário autenticado mas perfil não encontrado - conta deletada, fazendo logout automático');
                  // Não definir userProfile como null para evitar loop
                  // Em vez disso, fazer logout silencioso
                  supabase.auth.signOut().catch(err => {
                    console.error('Erro no logout automático:', err);
                  });
                  return;
                }
                setUserProfile(profile);
              }
            }).catch(err => {
              console.error('Profile fetch failed:', err);
              // Em caso de erro, assumir que perfil não existe e fazer logout
              if (isMounted) {
                console.log('🚨 Erro ao buscar perfil - fazendo logout automático');
                supabase.auth.signOut().catch(logoutErr => {
                  console.error('Erro no logout automático:', logoutErr);
                });
              }
            });
          }, 1000); // Aguardar 1 segundo para dar tempo ao callback
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

        // Limpar bloqueios expirados periodicamente
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          clearExpiredSetupLocks();
        }

        // Se usuário fez logout, limpar setup locks usando o ref
        if (event === 'SIGNED_OUT' && currentUserIdRef.current) {
          clearSetupLock(currentUserIdRef.current);
          console.log('🔓 Setup lock removido no sign out para usuário:', currentUserIdRef.current);
          currentUserIdRef.current = null;
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          // Atualizar ref com ID do usuário atual
          currentUserIdRef.current = session?.user?.id ?? null;
          setLoading(false); // Finalizar loading imediatamente
        }

        // Buscar perfil em background (não bloqueia a UI)
        if (session?.user) {
          console.log('👤 Auth state change - usuário autenticado, buscando perfil em background...');

          // Buscar perfil diretamente para evitar stale closure
          AuthService.fetchUserProfile(session.user.id).then(profile => {
            if (isMounted) {
              // Se perfil é null, significa que o usuário foi deletado do banco
              // mas ainda tem sessão ativa - fazer logout automático
              if (profile === null) {
                console.log('🚨 Auth state change - usuário autenticado mas perfil não encontrado - conta deletada, fazendo logout automático');
                // Fazer logout silencioso
                supabase.auth.signOut().catch(err => {
                  console.error('Erro no logout automático:', err);
                });
                return;
              }
              setUserProfile(profile);
            }
          }).catch(err => {
            console.error('Profile fetch failed:', err);
            // Em caso de erro, assumir que perfil não existe e fazer logout
            if (isMounted) {
              console.log('🚨 Auth state change - erro ao buscar perfil - fazendo logout automático');
              supabase.auth.signOut().catch(logoutErr => {
                console.error('Erro no logout automático:', logoutErr);
              });
            }
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
