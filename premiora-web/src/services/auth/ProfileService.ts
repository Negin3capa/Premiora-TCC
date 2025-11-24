/**
 * Serviço de gerenciamento de perfil
 * Responsável por operações CRUD de perfil de usuário
 */
import { supabase } from '../../utils/supabaseClient';
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

        const { data: insertData, error: insertError } = await supabase
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

        // Só atualizar avatar OAuth se o perfil não estiver completo ou se o avatar atual for o mesmo OAuth (não foi customizado)
        if (oauthAvatarUrl && !existingProfile.profile_setup_completed) {
          console.log('⚠️ Perfil não está completo, atualizando avatar OAuth');
          updateData.avatar_url = oauthAvatarUrl;
        } else if (oauthAvatarUrl && existingProfile.avatar_url === oauthAvatarUrl) {
          console.log('✅ Avatar já é o mesmo OAuth, mantendo');
          // Não atualizar se já é o mesmo
        } else if (oauthAvatarUrl && existingProfile.avatar_url && existingProfile.avatar_url !== oauthAvatarUrl) {
          console.log('⚠️ Avatar atual é diferente do OAuth - mantendo avatar customizado');
          // Não atualizar se é um avatar customizado diferente
        } else if (oauthAvatarUrl && !existingProfile.avatar_url) {
          console.log('📝 Perfil completo mas sem avatar, definindo avatar OAuth');
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
   * Usa cliente admin para bypass de RLS policies durante OAuth
   * @param userId - ID do usuário
   * @param forceFresh - Força busca fresca ignorando cache
   * @returns Promise com dados do perfil ou null se não encontrado
   */
  static async fetchUserProfile(userId: string, forceFresh: boolean = false): Promise<any> {
    console.log('🔍 Buscando perfil do usuário:', userId, forceFresh ? '(forçando busca fresca)' : '');
    try {
      // Usar cliente padrão em vez de admin para evitar erros em produção onde service role key não existe
      let query = supabase
        .from('users')
        .select('id, name, username, email, avatar_url, tier, profile_setup_completed')
        .eq('id', userId);

      // Adicionar timestamp para forçar busca fresca e evitar cache
      if (forceFresh) {
        query = query.select('id, name, username, email, avatar_url, tier, profile_setup_completed, updated_at');
      }

      const { data: profile, error } = await query.single();

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
   * Busca creator por username
   * @param username - Username do usuário
   * @returns Promise com dados combinados do usuário e creator
   */
  static async getCreatorByUsername(username: string): Promise<any> {
    try {
      console.log('🔍 Buscando creator por username:', username);

      // Primeiro buscar o usuário pelo username
      // Usar supabase client padrão (requer RLS policy pública para leitura de perfis)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, username, email, avatar_url, tier, profile_setup_completed')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        return null;
      }

      // Primeiro buscar dados do creator para obter o ID correto
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('id', userData.id)
        .single();

      let postsCount = 0;
      if (creatorError && creatorError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar creator:', creatorError);
      } else if (creatorData) {
        // Buscar contagem de posts do creator (usando creator_id)
        const { count, error: postsError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', creatorData.id)
          .eq('is_published', true); // Só contar posts publicados

        if (postsError) {
          console.error('❌ Erro ao contar posts:', postsError);
        } else {
          postsCount = count || 0;
          console.log('✅ Contagem de posts do creator:', postsCount);
        }
      }

      if (creatorError && creatorError.code === 'PGRST116') {
        // Se não existe creator, retornar dados básicos do usuário
        console.log('⚠️ Creator não encontrado, retornando dados básicos do usuário');
        return {
          user: userData,
          creator: null,
          // Dados compatíveis com CreatorProfile
          name: userData.name || userData.username || 'Usuário',
          totalPosts: postsCount,
          description: null,
          bannerImage: null,
          avatar_url: userData.avatar_url,
          username: userData.username
        };
      }

      // Retornar dados combinados
      return {
        user: userData,
        creator: creatorData,
        // Dados compatíveis com CreatorProfile
        name: creatorData.display_name || userData.name || userData.username || 'Usuário',
        totalPosts: postsCount,
        description: creatorData.bio || null,
        bannerImage: creatorData.cover_image_url || null,
        avatar_url: userData.avatar_url,
        username: userData.username
      };
    } catch (err) {
      console.error('💥 Erro geral ao buscar creator por username:', err);
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
    avatar_url: string | null;
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

    // Se o avatar foi atualizado (incluindo remoção), sincronizar com a tabela creators
    if (updateData.hasOwnProperty('avatar_url')) {
      console.log('🔄 Iniciando sincronização do avatar com tabela creators:', updateData.avatar_url);

      try {
        // Verificar se existe registro de creator
        const { data: existingCreator, error: creatorCheckError } = await supabase
          .from('creators')
          .select('id, profile_image_url')
          .eq('id', userId)
          .single();

        console.log('🔍 Verificação de creator existente:', {
          exists: !!existingCreator,
          error: creatorCheckError?.code,
          currentProfileImageUrl: existingCreator?.profile_image_url
        });

        if (creatorCheckError && creatorCheckError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar creator para sincronização:', creatorCheckError);
        } else if (existingCreator) {
          console.log('📝 Creator encontrado, atualizando profile_image_url');

          // Atualizar avatar na tabela creators
          const { data: updatedCreator, error: updateCreatorError } = await supabase
            .from('creators')
            .update({ profile_image_url: updateData.avatar_url })
            .eq('id', userId)
            .select('id, profile_image_url')
            .single();

          if (updateCreatorError) {
            console.error('❌ Erro ao sincronizar avatar com creators:', updateCreatorError);
          } else {
            console.log('✅ Avatar sincronizado com sucesso:', {
              creatorId: updatedCreator.id,
              newProfileImageUrl: updatedCreator.profile_image_url
            });
          }
        } else {
          console.log('⚠️ Creator não encontrado - avatar será sincronizado quando creator for criado');
        }
      } catch (syncError) {
        console.error('💥 Erro geral na sincronização do avatar:', syncError);
        // Não falhar a operação principal se a sincronização falhar
      }
    }

    return data;
  }

  /**
   * Atualiza o banner do perfil do usuário
   * @param userId - ID do usuário
   * @param bannerImage - URL da imagem do banner ou null para remover
   * @returns Promise com dados do perfil atualizado
   */
  static async updateProfileBanner(userId: string, bannerImage: string | null): Promise<any> {
    try {
      console.log('🔄 Atualizando banner do perfil:', { userId, bannerImage });

      // Primeiro buscar dados atuais do creator
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('id', userId)
        .single();

      if (creatorError && creatorError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ Erro ao buscar creator:', creatorError);
        throw creatorError;
      }

      // Se creator não existe, criar um novo
      if (!creatorData) {
        console.log('📝 Criando novo registro de creator para banner');
        const { data: newCreator, error: createError } = await supabase
          .from('creators')
          .insert({
            id: userId,
            cover_image_url: bannerImage,
            bio: null,
            display_name: null,
            total_subscribers: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar creator:', createError);
          throw createError;
        }

        console.log('✅ Creator criado com banner:', newCreator);
        return newCreator;
      }

      // Atualizar banner existente
      const { data: updatedCreator, error: updateError } = await supabase
        .from('creators')
        .update({ cover_image_url: bannerImage })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar banner:', updateError);
        throw updateError;
      }

      console.log('✅ Banner atualizado:', updatedCreator);
      return updatedCreator;
    } catch (err) {
      console.error('💥 Erro geral ao atualizar banner:', err);
      throw err;
    }
  }

  /**
   * Atualiza a bio/descrição do perfil do usuário
   * @param userId - ID do usuário
   * @param bio - Texto da bio
   * @returns Promise com dados do perfil atualizado
   */
  static async updateProfileBio(userId: string, bio: string): Promise<any> {
    try {
      console.log('🔄 Atualizando bio do perfil:', { userId, bio });

      // Primeiro buscar dados atuais do creator
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('id', userId)
        .single();

      if (creatorError && creatorError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ Erro ao buscar creator:', creatorError);
        throw creatorError;
      }

      // Se creator não existe, criar um novo
      if (!creatorData) {
        console.log('📝 Criando novo registro de creator para bio');
        const { data: newCreator, error: createError } = await supabase
          .from('creators')
          .insert({
            id: userId,
            cover_image_url: null,
            bio: bio,
            display_name: null,
            total_subscribers: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar creator:', createError);
          throw createError;
        }

        console.log('✅ Creator criado com bio:', newCreator);
        return newCreator;
      }

      // Atualizar bio existente
      const { data: updatedCreator, error: updateError } = await supabase
        .from('creators')
        .update({ bio: bio })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar bio:', updateError);
        throw updateError;
      }

      console.log('✅ Bio atualizada:', updatedCreator);
      return updatedCreator;
    } catch (err) {
      console.error('💥 Erro geral ao atualizar bio:', err);
      throw err;
    }
  }

  /**
   * Atualiza o nome de exibição do perfil do usuário (display_name)
   * @param userId - ID do usuário
   * @param displayName - Nome de exibição
   * @returns Promise com dados do perfil atualizado
   */
  static async updateProfileDisplayName(userId: string, displayName: string): Promise<any> {
    try {
      console.log('🔄 Atualizando display_name do perfil:', { userId, displayName });

      // Primeiro buscar dados atuais do creator
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('id', userId)
        .single();

      if (creatorError && creatorError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ Erro ao buscar creator:', creatorError);
        throw creatorError;
      }

      // Se creator não existe, criar um novo
      if (!creatorData) {
        console.log('📝 Criando novo registro de creator para display_name');
        const { data: newCreator, error: createError } = await supabase
          .from('creators')
          .insert({
            id: userId,
            cover_image_url: null,
            bio: null,
            display_name: displayName,
            total_subscribers: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar creator:', createError);
          throw createError;
        }

        console.log('✅ Creator criado com display_name:', newCreator);

        // Sincronizar com a tabela users (campo name)
        await supabase.from('users').update({ name: displayName }).eq('id', userId);

        return newCreator;
      }

      // Atualizar display_name existente
      const { data: updatedCreator, error: updateError } = await supabase
        .from('creators')
        .update({ display_name: displayName })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar display_name:', updateError);
        throw updateError;
      }

      // Sincronizar com a tabela users (campo name)
      await supabase.from('users').update({ name: displayName }).eq('id', userId);

      console.log('✅ Display_name atualizado:', updatedCreator);
      return updatedCreator;
    } catch (err) {
      console.error('💥 Erro geral ao atualizar display_name:', err);
      throw err;
    }
  }
}
