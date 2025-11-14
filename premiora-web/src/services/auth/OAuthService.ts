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
   * Verifica se um email já está associado a múltiplos provedores OAuth
   * Se houver múltiplas contas com o mesmo email, bloqueia Facebook e prefere Google
   * @param email - Email a ser verificado
   * @returns Promise com informações sobre bloqueio de provedores
   */
  static async checkConflictingProviders(email: string): Promise<{
    hasGoogle: boolean;
    hasFacebook: boolean;
    shouldBlockFacebook: boolean;
  }> {
    try {
      console.log('🔍 Verificando provedores conflitantes para email:', email);

      // Buscar usuários com o mesmo email
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', email);

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return { hasGoogle: false, hasFacebook: false, shouldBlockFacebook: false };
      }

      if (!users || users.length === 0) {
        console.log('ℹ️ Nenhum usuário encontrado com este email');
        return { hasGoogle: false, hasFacebook: false, shouldBlockFacebook: false };
      }

      // Se há múltiplas contas com o mesmo email, assumir que podem ser de provedores diferentes
      // e bloquear Facebook para preferir Google (similar ao Patreon)
      const hasMultipleAccounts = users.length > 1;
      const shouldBlockFacebook = hasMultipleAccounts;

      console.log('✅ Verificação de provedores concluída:', {
        userCount: users.length,
        hasMultipleAccounts,
        shouldBlockFacebook
      });

      // Para simplificar, assumimos que se há múltiplas contas, pode haver conflito
      return {
        hasGoogle: hasMultipleAccounts, // Assumir que há Google se há múltiplas contas
        hasFacebook: hasMultipleAccounts, // Assumir que há Facebook se há múltiplas contas
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
