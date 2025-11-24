import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase administrativo configurado com service role key
 * Usado para operações que requerem privilégios administrativos como:
 * - Criação de perfis de usuário durante OAuth signup
 * - Operações de gerenciamento de usuários
 * - Bypass de RLS policies quando necessário
 *
 * ATENÇÃO: Este cliente tem acesso total ao banco de dados.
 * Use apenas para operações administrativas críticas.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// ATENÇÃO: Em produção, a service role key NÃO deve estar presente no frontend.
// Este check evita que a aplicação quebre se a chave não estiver presente,
// mas funcionalidades que dependem dela falharão.
// TODO: Refatorar serviços para não dependerem de supabaseAdmin no frontend.

export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : (null as unknown as SupabaseClient);
