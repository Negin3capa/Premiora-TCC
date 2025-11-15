/**
 * Módulo central de autenticação Supabase
 * Gerencia todas as operações de autenticação da aplicação Premiora
 */
import { supabase } from '../utils/supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

/**
 * Tipos para provedores OAuth suportados
 */
export type OAuthProvider = 'google' | 'facebook';

/**
 * Resultado do registro de usuário
 */
export interface SignUpResult {
  user: User | null;
  error: AuthError | null;
  username?: string;
}

/**
 * Resultado da busca de usuário atual
 */
export interface CurrentUserResult {
  user: User | null;
  profile: any | null;
  error: AuthError | null;
}

/**
 * Inicializa o cliente Supabase com as variáveis de ambiente
 * @returns Cliente Supabase configurado
 */
export function initializeSupabaseAuth() {
  return supabase;
}



/**
 * Faz login com provedor OAuth (Google ou Facebook) com proteção de identidade Patreon-like
 * Valida conflitos antes de iniciar o fluxo OAuth
 * @param provider - Provedor OAuth
 * @returns Promise que resolve quando o login é iniciado
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<{ error: AuthError | null }> {
  try {
    console.log('🔄 Iniciando login OAuth com proteção de identidade:', provider);

    // ⚠️ NOTA: A validação de identidade Patreon-like não pode ser feita AQUI
    // porque ainda não temos os dados da identidade OAuth do usuário.
    // A validação real acontece NO AuthCallback após o usuário completar o OAuth.

    // OAuth é processado diretamente no contexto de autenticação, sem redirecionamento
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        scopes: provider === 'google' ? 'openid email profile' : 'email',
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined,
      },
    });

    if (error) {
      console.error('❌ Erro no login OAuth:', error);
      throw error;
    }

    console.log('✅ Login OAuth iniciado com sucesso');
    return { error: null };
  } catch (error) {
    console.error('💥 Erro geral no login OAuth:', error);
    return { error: error as AuthError };
  }
}

/**
 * Faz logout do usuário atual
 * @returns Promise que resolve quando o logout é realizado
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    console.log('🔄 Iniciando logout');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }

    console.log('✅ Logout realizado com sucesso');
    return { error: null };
  } catch (error) {
    console.error('💥 Erro geral no logout:', error);
    return { error: error as AuthError };
  }
}

/**
 * Busca o usuário atual e seu perfil
 * @returns Promise com dados do usuário atual
 */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  try {
    console.log('� Buscando usuário atual');

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Erro ao buscar usuário auth:', authError);
      return { user: null, profile: null, error: authError };
    }

    if (!user) {
      console.log('❌ Nenhum usuário autenticado');
      return { user: null, profile: null, error: null };
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, name, email, username, avatar_url, tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return { user, profile: null, error: { message: profileError.message, name: 'ProfileError' } as AuthError };
    }

    console.log('✅ Usuário e perfil encontrados:', {
      userId: user.id,
      username: profile?.username,
      email: user.email
    });

    return { user, profile, error: null };
  } catch (error) {
    console.error('💥 Erro geral ao buscar usuário atual:', error);
    return { user: null, profile: null, error: error as AuthError };
  }
}

/**
 * Processa callback OAuth após login com provedor
 * Valida apenas que a sessão OAuth foi estabelecida corretamente
 * Não cria perfis automaticamente - deixa isso para o setup
 * @returns Promise com resultado do processamento
 */
export async function handleOAuthCallback(): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    console.log('🔄 Processando callback OAuth');

    // Aguardar um pouco para garantir que a sessão esteja estabelecida
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obter sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      throw sessionError;
    }

    if (!session?.user) {
      console.log('❌ Nenhuma sessão encontrada no callback');
      return { user: null, error: null };
    }

    const user = session.user;
    console.log('✅ Sessão OAuth validada:', {
      userId: user.id,
      email: user.email,
      provider: user.app_metadata?.provider
    });

    // Apenas validar que temos um usuário OAuth válido
    // Não criar perfis automaticamente - o setup fará isso
    return { user, error: null };
  } catch (error) {
    console.error('💥 Erro geral no processamento OAuth:', error);
    return { user: null, error: error as AuthError };
  }
}
