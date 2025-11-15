/**
 * Serviço de autenticação OAuth
 * Responsável por operações de login com provedores OAuth
 */
import { supabase } from '../../utils/supabaseClient';
import { supabaseAdmin } from '../../utils/supabaseAdminClient';
import { RedirectService } from './RedirectService';

/**
 * Classe de serviço para operações OAuth
 */
export class OAuthService {
  /**
   * Verifica conflitos de identidade no nível de email (Patreon-like identity protection)
   * Sistema de proteção de identidade:
   * - Se usuário existe com Google, bloqueia Facebook (a menos que já esteja linked)
   * - Se usuário existe com Facebook, bloqueia Google (a menos que já esteja linked)
   * - Se ambos providers já estão linked na mesma conta, permite
   * - Se usuário não existe, permite normalmente
   *
   * @param identityData - Dados da identidade OAuth (email, sub, etc.)
   * @param provider - Provider que está tentando fazer login
   * @returns Promise com informações sobre bloqueio e conta existente
   */
  static async checkIdentityProtection(identityData: any, provider: 'google' | 'facebook'): Promise<{
    blocked: boolean;
    blockedReason?: string;
    existingAccount?: any;
    canLinkAccount: boolean;
    accountType: 'existing' | 'new' | 'linked';
  }> {
    try {
      const email = identityData.email;
      const providerId = identityData.sub || identityData.id;

      console.log(`🔍 Verificando proteção de identidade Patreon-like para ${provider}:`, {
        email,
        providerId: providerId?.substring(0, 10) + '...' // Log seguro
      });

      if (!email) {
        console.log('❌ Email não fornecido pela identidade OAuth');
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: 'new'
        };
      }

      // 1. VERIFICAR SE JÁ EXISTE CONTA SUPABASE PARA ESTE EMAIL
      const { data: existingUsers, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, username, profile_setup_completed')
        .eq('email', email)
        .limit(1);

      // Buscar metadados separadamente se usuário existir
      let appMetadata = null;
      if (!userError && existingUsers?.[0]) {
        try {
          const { data: metadataData } = await supabaseAdmin
            .from('users')
            .select('app_metadata')
            .eq('id', existingUsers[0].id)
            .single();

          appMetadata = metadataData?.app_metadata;
        } catch (metadataError) {
          console.warn('⚠️ Não foi possível buscar app_metadata:', metadataError);
          appMetadata = null;
        }
      }

      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar usuários existentes:', userError);
        return {
          blocked: true,
          blockedReason: 'Erro interno ao verificar conta existente',
          canLinkAccount: false,
          accountType: 'existing'
        };
      }

      const existingUser = existingUsers?.[0];
      console.log('🔍 Verificação de conta existente:', {
        userExists: !!existingUser,
        userId: existingUser?.id,
        username: existingUser?.username,
        setupCompleted: existingUser?.profile_setup_completed
      });

      // 2. SE USUÁRIO NÃO EXISTE, PERMITIR NOVO CADASTRO
      if (!existingUser) {
        console.log('✅ Usuário não existe - permitindo novo cadastro');
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: 'new',
          existingAccount: null
        };
      }

      // 3. SE USUÁRIO EXISTE, VERIFICAR PROVIDER ORIGINAL ATRAVÉS DOS METADADOS
      // Supabase Auth armazena informações sobre o provider em app_metadata
      const userProvider = appMetadata?.provider;
      console.log('📋 Provider original da conta existente:', {
        userProvider: userProvider,
        attemptingProvider: provider
      });

      // Verificar se este é o mesmo provider usado originalmente
      if (userProvider === provider) {
        console.log(`✅ ${provider} é o mesmo provider da conta existente - permitindo login`);
        return {
          blocked: false,
          canLinkAccount: false, // Mesmo provider
          accountType: 'linked',
          existingAccount: existingUser
        };
      }

      // 4. VERIFICAR SE É UM PROVIDER DIFERENTE (BLOCK FOR PATREON PROTECTION)
      // Se a conta foi criada com Google, bloquear Facebook
      if (userProvider === 'google' && provider === 'facebook') {
        console.log('🚫 BLOQUEADO: Facebook tentou login mas conta criada com Google');
        return {
          blocked: true,
          blockedReason: 'Esta conta já está associada ao Google. Use sua conta Google para fazer login.',
          canLinkAccount: false,
          accountType: 'existing',
          existingAccount: existingUser
        };
      }

      // Se a conta foi criada com Facebook, bloquear Google
      if (userProvider === 'facebook' && provider === 'google') {
        console.log('🚫 BLOQUEADO: Google tentou login mas conta criada com Facebook');
        return {
          blocked: true,
          blockedReason: 'Esta conta já está associada ao Facebook. Use sua conta Facebook para fazer login.',
          canLinkAccount: false,
          accountType: 'existing',
          existingAccount: existingUser
        };
      }

      // 5. CASO ESPECIAL: Se não há provider original definido, permitir
      // (Isso pode acontecer em contas antigas ou migrações)
      if (!userProvider) {
        console.log('⚠️ Conta sem provider definido - permitindo com cautela');
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: 'existing',
          existingAccount: existingUser
        };
      }

      // 6. DEFAULT: Se chegou aqui, é uma situação válida mas não esperada
      console.log('⚠️ Situação não esperada - permitindo com cautela');
      return {
        blocked: false,
        canLinkAccount: true,
        accountType: 'existing',
        existingAccount: existingUser
      };

    } catch (err) {
      console.error('💥 Erro geral na verificação de identidade:', err);
      return {
        blocked: true,
        blockedReason: 'Erro interno na verificação de identidade',
        canLinkAccount: false,
        accountType: 'existing'
      };
    }
  }

  /**
   * @deprecated Use checkIdentityProtection instead
   * Mantém compatibilidade com código existente
   */
  static async checkConflictingProviders(email: string): Promise<{
    hasGoogle: boolean;
    hasFacebook: boolean;
    shouldBlockFacebook: boolean;
  }> {
    try {
      console.log('⚠️ checkConflictingProviders DEPRECATED - use checkIdentityProtection');

      // Buscar na tabela auth.identities para verificar provedores OAuth
      const { data: identities, error } = await supabaseAdmin
        .from('auth.identities')
        .select('provider, identity_data')
        .eq('identity_data->>email', email);

      if (error) {
        console.error('❌ Erro ao buscar auth.identities:', error);
        return { hasGoogle: false, hasFacebook: false, shouldBlockFacebook: false };
      }

      const hasGoogle = identities?.some((identity: any) =>
        identity.provider === 'google'
      ) || false;

      const hasFacebook = identities?.some((identity: any) =>
        identity.provider === 'facebook'
      ) || false;

      const shouldBlockFacebook = hasGoogle;

      return {
        hasGoogle,
        hasFacebook,
        shouldBlockFacebook
      };
    } catch (err) {
      console.error('💥 Erro geral ao verificar provedores conflitantes:', err);
      return { hasGoogle: false, hasFacebook: false, shouldBlockFacebook: false };
    }
  }

  /**
   * Realiza login com Google OAuth
   * @returns Promise que resolve quando o login é iniciado
   * @throws Error se houver falha na configuração do OAuth
   */
  static async signInWithGoogle(): Promise<void> {
    // Determinar URL de redirecionamento baseada no ambiente
    const redirectTo = RedirectService.getRedirectUrl('/home');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
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
  }

  /**
   * Realiza login com Facebook OAuth
   * @returns Promise que resolve quando o login é iniciado
   * @throws Error se houver falha na configuração do OAuth
   */
  static async signInWithFacebook(): Promise<void> {
    // Determinar URL de redirecionamento baseada no ambiente
    const redirectTo = RedirectService.getRedirectUrl('/home');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Erro ao fazer login com Facebook:', error.message);
      throw error;
    }
  }
}
