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
 * Faz login com provedor OAuth (Google ou Facebook)
 * @param provider - Provedor OAuth
 * @returns Promise que resolve quando o login é iniciado
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<{ error: AuthError | null }> {
  try {
    console.log('🔄 Iniciando login OAuth:', provider);

    // Determinar URL de redirecionamento baseada no ambiente
    const redirectTo = getRedirectUrl('/auth/callback');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
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

/**
 * Determina a URL de redirecionamento apropriada baseada no ambiente
 * @param path - Caminho relativo para redirecionamento
 * @returns URL completa de redirecionamento
 */
function getRedirectUrl(path: string): string {
  // Verificar se estamos rodando localmente
  const isLocalDev = !import.meta.env.VERCEL && window.location.hostname === 'localhost';
  const isLocalDevAlt = import.meta.env.DEV && !import.meta.env.VERCEL_ENV;

  console.log('🔍 Verificando ambiente para redirect:', {
    DEV: import.meta.env.DEV,
    VERCEL: import.meta.env.VERCEL,
    VERCEL_ENV: import.meta.env.VERCEL_ENV,
    hostname: window.location.hostname,
    isLocalDev,
    isLocalDevAlt
  });

  // Em desenvolvimento local, usar a origem atual
  if (isLocalDev || isLocalDevAlt) {
    console.log('✅ Ambiente de desenvolvimento local detectado');
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
