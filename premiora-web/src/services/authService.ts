/**
 * Serviço legado de autenticação - apenas OAuth
 * @deprecated Use os serviços especializados em services/auth/ em vez deste
 * Este arquivo será removido após migração completa dos imports
 */
import { RedirectService, OAuthService, ProfileService } from './auth';
import type { User } from '@supabase/supabase-js';

/**
 * Classe de serviço legado para manter compatibilidade
 * @deprecated Use os serviços especializados diretamente
 */
export class AuthService {
  /**
   * Determina a URL de redirecionamento apropriada baseada no ambiente
   * @deprecated Use RedirectService.getRedirectUrl
   */
  static getRedirectUrl(path: string): string {
    return RedirectService.getRedirectUrl(path);
  }

  /**
   * Realiza login com Google OAuth
   * @deprecated Use OAuthService.signInWithGoogle
   */
  static async signInWithGoogle(): Promise<void> {
    return OAuthService.signInWithGoogle();
  }

  /**
   * Realiza login com Facebook OAuth
   * @deprecated Use OAuthService.signInWithFacebook
   */
  static async signInWithFacebook(): Promise<void> {
    return OAuthService.signInWithFacebook();
  }

  /**
   * Cria ou atualiza o perfil do usuário no banco de dados
   * @deprecated Use ProfileService.upsertUserProfile
   */
  static async upsertUserProfile(user: User): Promise<void> {
    return ProfileService.upsertUserProfile(user);
  }

  /**
   * Busca o perfil do usuário do banco de dados
   * @deprecated Use ProfileService.fetchUserProfile
   */
  static async fetchUserProfile(userId: string, forceFresh: boolean = false): Promise<any> {
    return ProfileService.fetchUserProfile(userId, forceFresh);
  }
}
