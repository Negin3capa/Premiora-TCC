import { createClient } from '@supabase/supabase-js';

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

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Variáveis de ambiente administrativas do Supabase não encontradas. ' +
    'Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY estão definidas no arquivo .env'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
