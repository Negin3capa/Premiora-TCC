import { supabase } from '../utils/supabaseClient';
import type { User } from '@supabase/supabase-js';

/**
 * Serviço de autenticação para gerenciar operações de login/logout
 * Centraliza toda a lógica de autenticação e comunicação com Supabase
 */
export class AuthService {
  /**
   * Determina a URL de redirecionamento apropriada baseada no ambiente
   * @param path - Caminho relativo para redirecionamento
   * @returns URL completa de redirecionamento
   */
  static getRedirectUrl(path: string): string {
    const origin = window.location.origin;

    // Para ambientes de preview do Vercel, garantir que usamos HTTPS
    if (origin.includes('vercel-preview') || origin.includes('vercel.app')) {
      return `https://${window.location.host}${path}`;
    }

    return `${origin}${path}`;
  }
  /**
   * Realiza login com Google OAuth
   * @returns Promise que resolve quando o login é iniciado
   * @throws Error se houver falha na configuração do OAuth
   */
  static async signInWithGoogle(): Promise<void> {
    // Determinar URL de redirecionamento baseada no ambiente
    const redirectTo = AuthService.getRedirectUrl('/home');

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
    const redirectTo = AuthService.getRedirectUrl('/home');

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

  /**
   * Cria ou atualiza o perfil do usuário no banco de dados
   * @param user - Objeto User do Supabase
   * @returns Promise que resolve quando o perfil é criado/atualizado
   */
  static async upsertUserProfile(user: User): Promise<void> {
    try {
      console.log('🔄 Criando/atualizando perfil do usuário:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        session: !!supabase.auth.getUser()
      });

      // Extrair nome do usuário dos metadados
      const displayName = user.user_metadata?.full_name ||
                         user.user_metadata?.name ||
                         (user.email ? user.email.split('@')[0] : null);

      // Obter URL do avatar
      const avatarUrl = user.user_metadata?.avatar_url ||
                       user.user_metadata?.picture || null;

      console.log('📝 Dados para inserir:', {
        id: user.id,
        email: user.email,
        name: displayName,
        avatar_url: avatarUrl
      });

      // Tentar inserir novo perfil
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
            throw updateError;
          } else {
            console.log('✅ Perfil atualizado com sucesso:', updateData);
          }
        } else {
          throw insertError;
        }
      } else {
        console.log('✅ Perfil criado com sucesso via insert:', insertData);
      }
    } catch (err) {
      console.error('💥 Erro geral ao upsertar perfil do usuário:', err);
      // Não lançar erro para não quebrar fluxo de autenticação
    }
  }

  /**
   * Busca o perfil do usuário do banco de dados
   * @param userId - ID do usuário
   * @returns Promise com dados do perfil ou null se não encontrado
   */
  static async fetchUserProfile(userId: string): Promise<any> {
    console.log('🔍 Buscando perfil do usuário:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, tier')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil do usuário:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      console.log('✅ Perfil encontrado:', profile);
      return profile;
    } catch (err) {
      console.error('💥 Erro geral ao buscar perfil:', err);
      return null;
    }
  }
}
