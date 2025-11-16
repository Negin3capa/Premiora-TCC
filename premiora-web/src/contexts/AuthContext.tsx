import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { AuthService } from '../services/authService';
import { signOut } from '../lib/supabaseAuth';
import { clearSetupLock, clearExpiredSetupLocks, setSetupLock, isOAuthCallbackProcessed, setOAuthCallbackProcessed } from '../utils/profileUtils';
import { OAuthService } from '../services/auth/OAuthService';
import type { UserProfile, AuthContextType } from '../types/auth';
import type { OAuthProvider } from '../lib/supabaseAuth';

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
  const userProfileRef = useRef<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserIdRef = useRef<string | null>(null);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  /**
   * Processa OAuth callback diretamente no contexto, evitando a página intermediária
   * Redireciona usuários com perfis incompletos usando um mecanismo que respeita o React Router
   * Contém toda a lógica que estava no AuthCallback.tsx
   */
  const processOAuthCallback = useCallback(async (authUser: User) => {
    // Evitar processamento duplicado
    if (isProcessingOAuth) {
      console.log('🔄 Processamento OAuth já em andamento, ignorando...');
      return;
    }

    setIsProcessingOAuth(true);
    console.log('🔄 Processando OAuth callback diretamente no contexto para usuário:', authUser.id);

    try {
      // 🔒 VERIFICAÇÃO DE PROTEÇÃO DE IDENTIDADE PATREON-LIKE
      console.log('🔍 Verificando proteção de identidade Patreon-like...');

      // Determinar qual provider foi usado neste login
      const provider = authUser.app_metadata?.provider as OAuthProvider;
      console.log('📋 Provider usado neste login:', provider);

      if (provider && (provider === 'google' || provider === 'facebook')) {
        // Extrair dados da identidade OAuth do usuário para validação
        const identityData = {
          email: authUser.email || '',
          sub: authUser.id, // ID único da identidade OAuth
          // Outros dados da identidade podem estar em user.user_metadata
          ...authUser.user_metadata
        };

        console.log('🔍 Extraindo dados da identidade OAuth para validação:', {
          email: identityData.email,
          sub: identityData.sub?.substring(0, 10) + '...',
          provider: provider
        });

        // Verificar proteção de identidade
        const protectionCheck = await OAuthService.checkIdentityProtection(identityData, provider);

        console.log('🔒 Resultado da proteção de identidade:', {
          blocked: protectionCheck.blocked,
          reason: protectionCheck.blockedReason,
          accountType: protectionCheck.accountType,
          canLinkAccount: protectionCheck.canLinkAccount
        });

        // 🚫 SE ESTIVER BLOQUEADO: REJEITAR LOGIN
        if (protectionCheck.blocked) {
          console.error('🚫 LOGIN BLOQUEADO:', protectionCheck.blockedReason);

          // LIMPAR DADOS DO GOOGLE ONE TAP PARA PRIOR ACCES O (já que login foi bloqueado)
          if (provider === 'google') {
            try {
              localStorage.removeItem('lastGoogleAccount');
              localStorage.removeItem('hasGoogleLoginHistory');
              console.log('🗑️ Dados do Google One Tap limpos devido ao bloqueio');
            } catch (error) {
              console.warn('⚠️ Erro ao limpar dados do Google One Tap:', error);
            }
          }

          // Logout automático para limpar sessão
          await signOut();
          return;
        }

        // ✅ SE PERMITIDO: Continuar com processamento normal
        console.log('✅ Proteção de identidade aprovada, continuando processamento...');

        // SALVAR INFORMAÇÕES DO LOGIN GOOGLE PARA ONE TAP (se for Google)
        if (provider === 'google' && authUser.email) {
          try {
            console.log('💾 Salvando dados do login Google para One Tap futuro');

            // Salvar marcação de que o usuário já logou com Google ao menos uma vez
            localStorage.setItem('hasGoogleLoginHistory', 'true');

            // Salvar dados da conta Google para personalização futura
            const googleAccountData = {
              email: authUser.email,
              name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
              picture: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
              savedAt: Date.now()
            };

            localStorage.setItem('lastGoogleAccount', JSON.stringify(googleAccountData));
            console.log('✅ Dados do login Google salvos para One Tap');
          } catch (error) {
            console.warn('⚠️ Erro ao salvar dados do login Google:', error);
            // Não falhar o login por causa disso
          }
        }
      } else {
        console.warn('⚠️ Provider não identificado ou não suportado:', provider);
      }

      // Criar/atualizar perfil do usuário no banco de dados
      console.log('👤 Criando/atualizando perfil do usuário OAuth...');
      await AuthService.upsertUserProfile(authUser);

      // Aguardar um pouco para garantir que o perfil foi criado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se o perfil já está completo
      console.log('🔍 Verificando se perfil está completo...');
      const userProfile = await AuthService.fetchUserProfile(authUser.id);

      console.log('📋 Dados do perfil obtido:', {
        id: userProfile?.id,
        name: userProfile?.name,
        username: userProfile?.username,
        profile_setup_completed: userProfile?.profile_setup_completed,
        email: userProfile?.email
      });

      if (!userProfile) {
        console.error('❌ Perfil não foi criado corretamente - será redirectado pelo PublicRoute');

        // Bloquear setup para este usuário
        setSetupLock(authUser.id, true);
        console.log('🔒 Setup bloqueado para novo usuário OAuth (sem perfil)');

        // O PublicRoute detectará o perfil incompleto e redirecionará automaticamente
        return;
      }

      // Para usuários OAuth, considerar novo usuário se:
      // - Não tem profile_setup_completed como true, OU
      // - Não tem name/username
      const isProfileComplete = userProfile.name &&
                               userProfile.username &&
                               userProfile.profile_setup_completed === true;

      console.log('🎯 Análise de completude do perfil:', {
        hasName: !!userProfile.name,
        hasUsername: !!userProfile.username,
        hasCompletedSetup: userProfile.profile_setup_completed === true,
        isProfileComplete
      });

      if (isProfileComplete) {
        console.log('✅ Perfil já está completo, PublicRoute irá redirecionar para dashboard');
      } else {
        console.log('⚠️ Perfil incompleto OU é novo usuário OAuth - PublicRoute irá redirecionar para setup');

        // Bloquear setup para este usuário
        setSetupLock(authUser.id, true);
        console.log('🔒 Setup bloqueado para novo usuário OAuth');
      }

      console.log('✅ Processamento OAuth concluído com sucesso');

    } catch (error) {
      console.error('💥 Erro geral no processamento OAuth:', error);
      // Em caso de erro, fazer logout
      await signOut();
    } finally {
      setIsProcessingOAuth(false);
    }
  }, [isProcessingOAuth]);

  /**
   * Busca e atualiza o perfil do usuário no estado local
   */
  const refreshUserProfile = useCallback(async (forceFresh: boolean = false) => {
    if (!user) {
      console.log('🔄 refreshUserProfile: Nenhum usuário logado');
      setUserProfile(null);
      return;
    }

    console.log('🔄 refreshUserProfile: Buscando perfil atualizado para userId:', user.id, forceFresh ? '(forçando busca fresca)' : '');
    try {
      const profile = await AuthService.fetchUserProfile(user.id, forceFresh);
      console.log('🔄 refreshUserProfile: Perfil obtido:', profile);

      // Forçar atualização mesmo se for igual para garantir re-render
      userProfileRef.current = profile;
      setUserProfile(profile);

      console.log('✅ refreshUserProfile: Contexto atualizado com novo perfil');
    } catch (error) {
      console.error('❌ refreshUserProfile: Erro ao buscar perfil:', error);
    }
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

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      // Salvar última conta Google antes do logout para One Tap
      if (user?.app_metadata?.provider === 'google') {
        const lastGoogleAccount = {
          email: user.email,
          picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          savedAt: Date.now()
        };
        localStorage.setItem('lastGoogleAccount', JSON.stringify(lastGoogleAccount));
        console.log('💾 Última conta Google salva para One Tap:', lastGoogleAccount);
      }

      // Limpar bloqueio do setup antes do logout
      if (user?.id) {
        clearSetupLock(user.id);
      }

      const result = await signOut();
      if (result.error) {
        console.warn('Supabase signOut failed, but clearing local state anyway:', result.error);
        // Mesmo com erro, continuar com logout local
      }
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Error during signOut:', err);
      // Mesmo com erro, definir estados para null para garantir logout local
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.app_metadata, user?.email, user?.user_metadata]);

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
                // Se perfil é null, pode ser que seja um usuário OAuth novo cuja conta está sendo criada
                // Não fazer logout automático durante INITIAL_SESSION, apenas definir profile como null
                if (profile === null) {
                  console.log('⚠️ Perfil não encontrado durante inicialização - pode ser criação de conta OAuth em andamento');
                  // Definir profile como null para permitir que rotas funcionem corretamente
                  userProfileRef.current = null;
                  setUserProfile(null);
                  return;
                }

                // Só atualizar se o perfil mudou para evitar re-renderizações desnecessárias
                if (JSON.stringify(userProfileRef.current) !== JSON.stringify(profile)) {
                  userProfileRef.current = profile;
                  setUserProfile(profile);
                }
              }
            }).catch(err => {
              console.error('Profile fetch failed:', err);
              // Durante INITIAL_SESSION, ser mais tolerante com erros para evitar logout desnecessário
              // O PublicRoute e ProfileSetupGuard irão redirecionar adequadamente baseado no estado atual
              if (isMounted) {
                console.log('⚠️ Erro ao buscar perfil durante inicialização - definindo perfil como null');
                userProfileRef.current = null;
                setUserProfile(null);
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

        // Se usuário fez logout, limpar setup locks e rastreamento OAuth usando o ref
        if (event === 'SIGNED_OUT' && currentUserIdRef.current) {
          clearSetupLock(currentUserIdRef.current);
          setOAuthCallbackProcessed(currentUserIdRef.current, false); // Limpar rastreamento OAuth
          console.log('🔓 Setup lock e rastreamento OAuth removidos no sign out para usuário:', currentUserIdRef.current);
          currentUserIdRef.current = null;
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          // Atualizar ref com ID do usuário atual
          currentUserIdRef.current = session?.user?.id ?? null;
          setLoading(false); // Finalizar loading imediatamente
        }

        // Processar OAuth callback quando usuário faz SIGNED_IN via provedor OAuth
        if (event === 'SIGNED_IN' && session?.user) {
          const provider = session.user.app_metadata?.provider as OAuthProvider;
          const isOAuthLogin = provider === 'google' || provider === 'facebook';

          if (isOAuthLogin) {
            // Verificar se já processamos o callback OAuth para este usuário nesta sessão
            const alreadyProcessed = isOAuthCallbackProcessed(session.user.id);

            console.log('🔍 Verificação OAuth callback:', {
              userId: session.user.id,
              alreadyProcessed,
              provider,
              isOAuthLogin
            });

            if (alreadyProcessed) {
              console.log('🔄 OAuth callback já foi processado para este usuário nesta sessão, pulando processamento OAuth e continuando com busca normal...');
              // Já processado, continuar com busca normal de perfil (não retorna, deixa cair para a busca abaixo)
            } else {
              console.log('🔄 OAuth login detectado (primeira vez nesta sessão), processando callback...');
              // Marcar como processado ANTES de processar para evitar re-execuções
              setOAuthCallbackProcessed(session.user.id, true);
              console.log('✅ OAuth callback marcado como processado antecipadamente para usuário:', session.user.id);

              // Processar OAuth callback sem redirecionamento intermediário
              await processOAuthCallback(session.user);
              console.log('✅ OAuth callback processamento concluído para usuário:', session.user.id);
              return; // Evitar processamento duplicado do perfil
            }
          }
        }

        // Buscar perfil em background (não bloqueia a UI) para logins não-OAuth
        if (session?.user) {
          console.log('👤 Auth state change - usuário autenticado, buscando perfil em background...');

          // Buscar perfil diretamente para evitar stale closure, forçando busca fresca após login
          const forceFresh = event === 'SIGNED_IN';
          AuthService.fetchUserProfile(session.user.id, forceFresh).then(profile => {
            if (isMounted) {
              // Se perfil é null, pode ser que seja um usuário OAuth novo cuja conta ainda não foi criada
              // Não fazer logout automático, apenas definir profile como null
              if (profile === null) {
                console.log('⚠️ Auth state change - perfil não encontrado, definindo como null (pode ser conta OAuth em criação)');
                userProfileRef.current = null;
                setUserProfile(null);
                return;
              }

              // Sempre atualizar após login para garantir avatar correto
              if (forceFresh || JSON.stringify(userProfileRef.current) !== JSON.stringify(profile)) {
                userProfileRef.current = profile;
                setUserProfile(profile);
                console.log('✅ Auth state change - perfil atualizado:', profile);
              }
            }
          }).catch(err => {
            console.error('Profile fetch failed:', err);
            // Durante auth state changes, ser mais tolerante com erros temporários
            // O PublicRoute e ProfileSetupGuard irão redirecionar adequadamente baseado no estado atual
            if (isMounted) {
              console.log('⚠️ Auth state change - erro ao buscar perfil - definindo perfil como null');
              userProfileRef.current = null;
              setUserProfile(null);
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
    signOut: handleSignOut,
    loading,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
