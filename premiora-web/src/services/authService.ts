import { supabase } from '../utils/supabaseClient';
import { generateUniqueUsername } from '../utils/generateUniqueUsername';
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
    // Verificar se estamos rodando localmente (não em Vercel)
    const isLocalDev = !import.meta.env.VERCEL && window.location.hostname === 'localhost';
    const isLocalDevAlt = import.meta.env.DEV && !import.meta.env.VERCEL_ENV;

    console.log('🔍 Verificando ambiente:', {
      DEV: import.meta.env.DEV,
      VERCEL: import.meta.env.VERCEL,
      VERCEL_ENV: import.meta.env.VERCEL_ENV,
      hostname: window.location.hostname,
      isLocalDev,
      isLocalDevAlt
    });

    // Em desenvolvimento local, usar a origem atual (suporta portas dinâmicas do Vite)
    if (isLocalDev || isLocalDevAlt) {
      console.log('✅ Ambiente de desenvolvimento local detectado, usando origem atual');
      return `${window.location.origin}${path}`;
    }

    // Para produção/Vercel, usar VERCEL_URL se disponível
    const vercelUrl = import.meta.env.VITE_VERCEL_URL || import.meta.env.VERCEL_URL;

    if (vercelUrl) {
      try {
        console.log('🔄 Usando VERCEL_URL:', vercelUrl);
        const url = new URL(vercelUrl);
        return `${url.origin}${path}`;
      } catch (error) {
        console.warn('VERCEL_URL inválida, usando fallback:', vercelUrl);
      }
    }

    // Fallback: determinar dinamicamente baseada no ambiente atual
    const origin = window.location.origin;
    console.log('🔄 Usando origin atual:', origin);

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
   * Preserva dados customizados do usuário (name, username) se já configurados
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

      // Primeiro, verificar se o perfil já existe
      const existingProfile = await AuthService.fetchUserProfile(user.id);

      // Extrair dados OAuth
      const oauthName = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       (user.email ? user.email.split('@')[0] : null);

      const oauthAvatarUrl = user.user_metadata?.avatar_url ||
                            user.user_metadata?.picture || null;

      if (!existingProfile) {
        // Perfil não existe - criar novo com dados OAuth
        console.log('📝 Criando novo perfil com dados OAuth');

        const baseUsername = user.email ? user.email.split('@')[0] : 'user';
        const username = await generateUniqueUsername(baseUsername);

        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: username,
            name: oauthName,
            avatar_url: oauthAvatarUrl,
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao criar perfil:', insertError);
          throw insertError;
        } else {
          console.log('✅ Perfil criado com sucesso:', insertData);
        }
      } else {
        // Perfil existe - atualizar apenas dados não customizados
        console.log('🔄 Perfil existente encontrado, atualizando dados OAuth');

        const updateData: any = {};

        // Atualizar avatar se não foi customizado ou se é diferente
        if (oauthAvatarUrl && (!existingProfile.avatar_url || existingProfile.avatar_url !== oauthAvatarUrl)) {
          updateData.avatar_url = oauthAvatarUrl;
        }

        // Só atualizar name/username se o perfil ainda não foi configurado
        if (!existingProfile.profile_setup_completed) {
          if (oauthName && existingProfile.name !== oauthName) {
            updateData.name = oauthName;
          }
          // Username geralmente não deve ser alterado se já existe
        }

        // Só fazer update se há dados para atualizar
        if (Object.keys(updateData).length > 0) {
          const { data: updateResult, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Erro ao atualizar perfil:', updateError);
            throw updateError;
          } else {
            console.log('✅ Perfil atualizado com sucesso:', updateResult);
          }
        } else {
          console.log('ℹ️ Nenhum dado OAuth para atualizar');
        }
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
        .select('id, name, username, email, avatar_url, tier, profile_setup_completed')
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
