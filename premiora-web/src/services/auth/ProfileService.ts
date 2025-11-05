/**
 * Serviço de gerenciamento de perfil
 * Responsável por operações CRUD de perfil de usuário
 */
import { supabase } from '../../utils/supabaseClient';
import { supabaseAdmin } from '../../utils/supabaseAdminClient';
import type { User } from '@supabase/supabase-js';

/**
 * Classe de serviço para operações de perfil
 */
export class ProfileService {
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

      // Extrair dados OAuth
      const oauthName = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       (user.email ? user.email.split('@')[0] : null);

      const oauthAvatarUrl = user.user_metadata?.avatar_url ||
                            user.user_metadata?.picture || null;

      // Primeiro, tentar buscar perfil existente
      const existingProfile = await ProfileService.fetchUserProfile(user.id);

      if (!existingProfile) {
        // Perfil não existe - criar novo com username temporário (usuário deve configurar manualmente)
        console.log('📝 Criando novo perfil básico com dados OAuth (setup será completado manualmente)');

        // Criar username temporário único baseado no ID do usuário
        const tempUsername = `temp_${user.id.replace(/-/g, '').substring(0, 20)}`;

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: tempUsername, // Username temporário único
            name: oauthName,
            avatar_url: oauthAvatarUrl,
            profile_setup_completed: false, // Explicitamente marcar como incompleto
          })
          .select()
          .single();

        if (insertError) {
          // Se erro for de chave duplicada, significa que outra requisição criou o perfil
          // Vamos tentar buscar novamente
          if (insertError.code === '23505') {
            console.log('⚠️ Perfil já existe (criado por outra requisição), tentando buscar novamente...');
            const retryProfile = await ProfileService.fetchUserProfile(user.id);
            if (retryProfile) {
              console.log('✅ Perfil encontrado no retry:', retryProfile);
              return;
            }
          }
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
        console.log('🔍 Verificando profile_setup_completed:', existingProfile.profile_setup_completed);
        if (!existingProfile.profile_setup_completed) {
          console.log('⚠️ Perfil não está completo, atualizando dados OAuth');
          if (oauthName && existingProfile.name !== oauthName) {
            updateData.name = oauthName;
            console.log('📝 Atualizando name para:', oauthName);
          }
          // Username geralmente não deve ser alterado se já existe
        } else {
          console.log('✅ Perfil já está completo, não atualizará dados OAuth');
        }

        // Só fazer update se há dados para atualizar
        if (Object.keys(updateData).length > 0) {
          const { data: updateResult, error: updateError } = await supabaseAdmin
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
   * Usa cliente admin para bypass de RLS policies durante OAuth
   * @param userId - ID do usuário
   * @returns Promise com dados do perfil ou null se não encontrado
   */
  static async fetchUserProfile(userId: string): Promise<any> {
    console.log('🔍 Buscando perfil do usuário:', userId);
    try {
      const { data: profile, error } = await supabaseAdmin
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

  /**
   * Atualiza o perfil do usuário
   * @param userId - ID do usuário
   * @param updateData - Dados para atualizar
   * @returns Promise com dados do perfil atualizado
   */
  static async updateUserProfile(userId: string, updateData: Partial<{
    name: string;
    username: string;
    avatar_url: string;
    profile_setup_completed: boolean;
  }>): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, username, email, avatar_url, tier, profile_setup_completed')
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }

    return data;
  }
}
