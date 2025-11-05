/**
 * Serviço de autenticação OAuth
 * Responsável por operações de login com provedores OAuth
 */
import { supabase } from '../../utils/supabaseClient';
import { RedirectService } from './RedirectService';

/**
 * Classe de serviço para operações OAuth
 */
export class OAuthService {
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
