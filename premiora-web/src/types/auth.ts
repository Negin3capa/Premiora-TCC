/**
 * Tipos relacionados à autenticação e perfis de usuário
 */

/**
 * Perfil do usuário no sistema Premiora
 */
export interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  avatar_url: string | null;
  tier?: string; // Tier de assinatura (supporters, premium, etc.)
}

/**
 * Interface para o contexto de autenticação
 */
export interface AuthContextType {
  user: import('@supabase/supabase-js').User | null;
  userProfile: UserProfile | null;
  session: import('@supabase/supabase-js').Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshUserProfile: (forceFresh?: boolean) => Promise<void>;
}
