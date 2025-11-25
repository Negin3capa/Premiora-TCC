/**
 * Serviço de autenticação OAuth
 * Responsável por operações de login com provedores OAuth
 */
import { supabase } from "../../utils/supabaseClient";
import { supabaseAdmin } from "../../utils/supabaseAdminClient";
import { RedirectService } from "./RedirectService";

/**
 * Classe de serviço para operações OAuth
 */
export class OAuthService {
  /**
   * Verifica conflitos de identidade no nível de email (Patreon-like identity protection)
   * Sistema de proteção de identidade:
   * - Se usuário existe com Google, bloqueia Facebook (a menos que já esteja linked)
   * - Se usuário existe com Facebook, bloqueia Google (a menos que já esteja linked)
   * - Se ambos providers já estão linked na mesma conta, permite
   * - Se usuário não existe, permite normalmente
   *
   * @param identityData - Dados da identidade OAuth (email, sub, etc.)
   * @param provider - Provider que está tentando fazer login
   * @returns Promise com informações sobre bloqueio e conta existente
   */
  static async checkIdentityProtection(
    identityData: any,
    provider: "google" | "facebook",
  ): Promise<{
    blocked: boolean;
    blockedReason?: string;
    existingAccount?: any;
    canLinkAccount: boolean;
    accountType: "existing" | "new" | "linked";
  }> {
    try {
      const email = identityData.email;
      const providerId = identityData.sub || identityData.id;

      console.log(
        `🔍 Verificando proteção de identidade Patreon-like para ${provider}:`,
        {
          email,
          providerId: providerId?.substring(0, 10) + "...", // Log seguro
        },
      );

      if (!email) {
        console.log("❌ Email não fornecido pela identidade OAuth");
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: "new",
          existingAccount: null,
        };
      }

      // 1. VERIFICAR SE JÁ EXISTE CONTA SUPABASE PARA ESTE EMAIL
      // Usar admin client para listar usuários (bypassing RLS)
      const { data: users, error: listError } = await supabaseAdmin.auth.admin
        .listUsers();

      if (listError) {
        console.error("❌ Erro ao listar usuários:", listError);
        // Fallback seguro: permitir login se admin falhar
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: "new",
          existingAccount: null,
        };
      }

      // Encontrar usuário com este email
      const existingUser = users.users.find((u) =>
        u.email?.toLowerCase() === email.toLowerCase()
      );
      const exists = !!existingUser;

      // Tentar determinar o provider original
      let existingProvider = null;
      if (
        existingUser && existingUser.identities &&
        existingUser.identities.length > 0
      ) {
        // Pegar o provider da primeira identidade (assumindo que é a original)
        existingProvider = existingUser.identities[0].provider;
      }

      // 2. SE USUÁRIO NÃO EXISTE, PERMITIR NOVO CADASTRO
      if (!exists) {
        console.log("✅ Usuário não existe - permitindo novo cadastro");
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: "new",
          existingAccount: null,
        };
      }

      const existingUserInfo = { id: existingUser.id, email }; // Minimal user info

      console.log("🔍 Verificação de conta existente:", {
        userExists: true,
        userId: existingUser.id,
        existingProvider,
      });

      // 3. SE USUÁRIO EXISTE, VERIFICAR PROVIDER ORIGINAL
      console.log("📋 Provider original da conta existente:", {
        userProvider: existingProvider,
        attemptingProvider: provider,
      });

      // Verificar se este é o mesmo provider usado originalmente
      if (existingProvider === provider) {
        console.log(
          `✅ ${provider} é o mesmo provider da conta existente - permitindo login`,
        );
        return {
          blocked: false,
          canLinkAccount: false, // Mesmo provider
          accountType: "linked",
          existingAccount: existingUserInfo,
        };
      }

      // 4. VERIFICAR SE É UM PROVIDER DIFERENTE (BLOCK FOR PATREON PROTECTION)
      // Se a conta foi criada com Google, bloquear Facebook
      if (existingProvider === "google" && provider === "facebook") {
        console.log(
          "🚫 BLOQUEADO: Facebook tentou login mas conta criada com Google",
        );
        return {
          blocked: true,
          blockedReason:
            "Esta conta já está associada ao Google. Use sua conta Google para fazer login.",
          canLinkAccount: false,
          accountType: "existing",
          existingAccount: existingUserInfo,
        };
      }

      // Se a conta foi criada com Facebook, bloquear Google
      if (existingProvider === "facebook" && provider === "google") {
        console.log(
          "🚫 BLOQUEADO: Google tentou login mas conta criada com Facebook",
        );
        return {
          blocked: true,
          blockedReason:
            "Esta conta já está associada ao Facebook. Use sua conta Facebook para fazer login.",
          canLinkAccount: false,
          accountType: "existing",
          existingAccount: existingUserInfo,
        };
      }

      // 5. CASO ESPECIAL: Se não há provider original definido, permitir
      if (!existingProvider) {
        console.log("⚠️ Conta sem provider definido - permitindo com cautela");
        return {
          blocked: false,
          canLinkAccount: true,
          accountType: "existing",
          existingAccount: existingUserInfo,
        };
      }

      // 6. DEFAULT
      console.log("⚠️ Situação não esperada - permitindo com cautela");
      return {
        blocked: false,
        canLinkAccount: true,
        accountType: "existing",
        existingAccount: existingUserInfo,
      };
    } catch (err) {
      console.error("💥 Erro geral na verificação de identidade:", err);
      return {
        blocked: true,
        blockedReason: "Erro interno na verificação de identidade",
        canLinkAccount: false,
        accountType: "existing",
      };
    }
  }

  /**
   * @deprecated Use checkIdentityProtection instead
   * Mantém compatibilidade com código existente
   */
  /**
   * @deprecated Use checkIdentityProtection instead
   * Mantém compatibilidade com código existente
   */
  static async checkConflictingProviders(email: string): Promise<{
    hasGoogle: boolean;
    hasFacebook: boolean;
    shouldBlockFacebook: boolean;
  }> {
    try {
      // Usar admin client para verificar usuários
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) throw error;

      const user = data.users.find((u) => u.email === email);

      if (!user || !user.identities) {
        return {
          hasGoogle: false,
          hasFacebook: false,
          shouldBlockFacebook: false,
        };
      }

      const hasGoogle = user.identities.some((id) => id.provider === "google");
      const hasFacebook = user.identities.some((id) =>
        id.provider === "facebook"
      );

      return {
        hasGoogle,
        hasFacebook,
        shouldBlockFacebook: hasGoogle && !hasFacebook,
      };
    } catch (err) {
      console.error("💥 Erro geral ao verificar provedores conflitantes:", err);
      return {
        hasGoogle: false,
        hasFacebook: false,
        shouldBlockFacebook: false,
      };
    }
  }

  /**
   * Realiza login com Google OAuth
   * @returns Promise que resolve quando o login é iniciado
   * @throws Error se houver falha na configuração do OAuth
   */
  static async signInWithGoogle(): Promise<void> {
    // Determinar URL de redirecionamento baseada no ambiente
    // Usar /dashboard diretamente para evitar redirecionamentos extras que podem perder o hash de autenticação
    const redirectTo = RedirectService.getRedirectUrl("/dashboard");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes: "openid email profile",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Erro ao fazer login com Google:", error.message);
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
    // Usar /dashboard diretamente para evitar redirecionamentos extras que podem perder o hash de autenticação
    const redirectTo = RedirectService.getRedirectUrl("/dashboard");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Erro ao fazer login com Facebook:", error.message);
      throw error;
    }
  }
}
