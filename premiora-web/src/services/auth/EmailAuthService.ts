/**
 * Serviço de autenticação com email
 * Responsável por operações de login/cadastro com email e senha
 */
import { supabase } from '../../utils/supabaseClient';

/**
 * Classe de serviço para operações de autenticação com email
 */
export class EmailAuthService {
  /**
   * Realiza login com email e senha
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @throws Error se as credenciais forem inválidas
   */
  static async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro ao fazer login com email:', error.message);
      throw error;
    }
  }

  /**
   * Realiza registro com email e senha
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Dados do signup incluindo informações sobre confirmação de email
   * @throws Error se o registro falhar
   */
  static async signUpWithEmail(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Erro ao registrar com email:', error.message);
      throw error;
    }

    console.log('Signup realizado com sucesso:', data);
    return data;
  }

  /**
   * Realiza logout do usuário
   * @throws Error se o logout falhar
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      throw error;
    }
  }
}
