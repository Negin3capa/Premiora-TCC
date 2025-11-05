/**
 * Serviço legado de autenticação
 * @deprecated Use os serviços especializados em services/auth/ em vez deste
 * Este arquivo será removido após migração completa dos imports
 */
import { RedirectService, OAuthService, EmailAuthService, ProfileService } from './auth';
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
   * Realiza login com email e senha
   * @deprecated Use EmailAuthService.signInWithEmail
   */
  static async signInWithEmail(email: string, password: string): Promise<void> {
    return EmailAuthService.signInWithEmail(email, password);
  }

  /**
   * Realiza registro com email e senha
   * @deprecated Use EmailAuthService.signUpWithEmail
   */
  static async signUpWithEmail(email: string, password: string): Promise<any> {
    return EmailAuthService.signUpWithEmail(email, password);
  }

  /**
   * Realiza logout do usuário
   * @deprecated Use EmailAuthService.signOut
   */
  static async signOut(): Promise<void> {
    return EmailAuthService.signOut();
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
  static async fetchUserProfile(userId: string): Promise<any> {
    return ProfileService.fetchUserProfile(userId);
  }
}
