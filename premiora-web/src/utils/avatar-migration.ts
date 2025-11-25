/**
 * Script de migração para converter avatars OAuth para Supabase Storage
 * Executa a migração dos avatars de usuários que possuem URLs do Google/Facebook/etc
 */

/**
 * Interface para resultado da migração
 */
interface MigrationResult {
  success: boolean;
  processed: number;
  converted: number;
  failed: number;
  errors: Array<{ userId: string; error: string; avatarUrl: string }>;
}

/**
 * Classe responsável pela migração de avatars OAuth
 */
export class AvatarMigration {
  private supabaseUrl: string;

  constructor() {
    // Obter URL do Supabase das variáveis de ambiente
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!this.supabaseUrl) {
      throw new Error(
        "VITE_SUPABASE_URL não encontrada nas variáveis de ambiente",
      );
    }
  }

  /**
   * Verifica se uma URL é um avatar OAuth (não Supabase)
   */
  private isOAuthAvatar(avatarUrl: string): boolean {
    if (!avatarUrl) return false;

    // Verificar se já é uma URL do Supabase
    if (avatarUrl.includes(this.supabaseUrl)) {
      return false;
    }

    // Verificar se é uma URL conhecida de OAuth providers
    const oauthPatterns = [
      /googleusercontent\.com/, // Google profile images
      /graph\.facebook\.com/, // Facebook profile images
      /platform\.linkedin\.com/, // LinkedIn images
      /avatars\.githubusercontent\.com/, // GitHub avatars
      /cdn\.discordapp\.com/, // Discord avatars
    ];

    return oauthPatterns.some((pattern) => pattern.test(avatarUrl));
  }

  /**
   * Faz download de uma imagem OAuth
   */
  private async downloadOAuthImage(avatarUrl: string): Promise<Blob | null> {
    try {
      console.log("📥 Baixando imagem OAuth:", avatarUrl);

      const response = await fetch(avatarUrl, {
        method: "GET",
        headers: {
          "Accept": "image/*",
          "User-Agent": "Mozilla/5.0 (compatible; Premiora Avatar Migration)",
        },
      });

      if (!response.ok) {
        console.error(
          `❌ Erro ao baixar imagem: ${response.status} ${response.statusText}`,
        );
        return null;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.startsWith("image/")) {
        console.error(`❌ Tipo de conteúdo não é imagem: ${contentType}`);
        return null;
      }

      const blob = await response.blob();
      console.log(
        "✅ Imagem baixada com sucesso, tamanho:",
        blob.size,
        "bytes",
      );
      return blob;
    } catch (error) {
      console.error("💥 Erro ao fazer download da imagem OAuth:", error);
      return null;
    }
  }

  /**
   * Faz upload da imagem para o bucket 'avatars' do Supabase
   */
  private async uploadToSupabase(
    blob: Blob,
    userId: string,
    originalUrl: string,
  ): Promise<string | null> {
    try {
      console.log("📤 Fazendo upload para Supabase para usuário:", userId);

      // Extrair extensão do arquivo da URL original
      const urlParts = originalUrl.split(".");
      const extension = urlParts[urlParts.length - 1]?.split("?")[0] || "jpg";

      // Sanitizar extensão
      const validExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
      const fileExt = validExtensions.includes(extension.toLowerCase())
        ? extension
        : "jpg";

      // Criar nome do arquivo
      const timestamp = Date.now();
      const fileName = `oauth-migration-${timestamp}.${fileExt}`;

      // Criar File object
      const file = new File([blob], fileName, { type: blob.type });

      // Importar dinamicamente para evitar dependências circulares
      const { FileUploadService } = await import(
        "../services/content/FileUploadService"
      );

      // Upload usando o método uploadAvatar diretamente
      const uploadResult = await FileUploadService.uploadAvatar(file, userId);

      console.log("✅ Upload para Supabase concluído:", uploadResult.url);
      return uploadResult.url;
    } catch (error) {
      console.error("💥 Erro ao fazer upload para Supabase:", error);
      return null;
    }
  }

  /**
   * Processa um usuário específico
   */
  private async processUser(userData: {
    id: string;
    avatar_url: string;
  }): Promise<{ success: boolean; newUrl?: string; error?: string }> {
    console.log(
      `🔄 Processando usuário ${userData.id} com avatar: ${userData.avatar_url}`,
    );

    try {
      // Baixar imagem OAuth
      const imageBlob = await this.downloadOAuthImage(userData.avatar_url);
      if (!imageBlob) {
        return {
          success: false,
          error: "Falha ao baixar imagem OAuth",
        };
      }

      // Upload para Supabase
      const newUrl = await this.uploadToSupabase(
        imageBlob,
        userData.id,
        userData.avatar_url,
      );
      if (!newUrl) {
        return {
          success: false,
          error: "Falha ao fazer upload para Supabase",
        };
      }

      // Importar dinamicamente para evitar dependências circulares
      const { ProfileService } = await import(
        "../services/auth/ProfileService"
      );

      // Atualizar avatar_url no banco
      await ProfileService.updateUserProfile(userData.id, {
        avatar_url: newUrl,
      });

      console.log(`✅ Usuário ${userData.id} migrado com sucesso: ${newUrl}`);
      return {
        success: true,
        newUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Erro desconhecido";
      console.error(
        `❌ Erro ao processar usuário ${userData.id}:`,
        errorMessage,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Executa a migração completa
   */
  async migrateOAuthAvatars(): Promise<MigrationResult> {
    console.log("🚀 Iniciando migração de avatars OAuth para Supabase Storage");

    const result: MigrationResult = {
      success: false,
      processed: 0,
      converted: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Importar dinamicamente para evitar dependências em tempo de carregamento
      // const { supabaseAdmin } = await import('./supabaseAdminClient'); // Removed
      throw new Error("Migration script disabled: supabaseAdminClient removed");

      // Buscar todos os usuários com avatars OAuth
      console.log("🔍 Buscando usuários com avatars OAuth...");

      /*
      const { data: users, error: queryError } = await supabaseAdmin
        .from('users')
        .select('id, avatar_url')
        .not('avatar_url', 'is', null)
        .limit(1000); // Processar em lotes para evitar timeout
      */
      const users: any[] = [];
      // const queryError = null;

      /*
      if (queryError) {
        console.error("❌ Erro ao buscar usuários:", queryError);
        result.errors.push({
          userId: "query",
          error: queryError.message,
          avatarUrl: "",
        });
        return result;
      }
      */

      if (!users || users.length === 0) {
        console.log("ℹ️ Nenhum usuário com avatar encontrado");
        result.success = true;
        return result;
      }

      console.log(
        `📊 Encontrados ${users.length} usuários com avatars. Verificando quais são OAuth...`,
      );

      // Filtrar apenas usuários com avatars OAuth
      const oauthUsers = users.filter((user) =>
        user.avatar_url && this.isOAuthAvatar(user.avatar_url)
      );

      console.log(`🎯 ${oauthUsers.length} usuários precisam de migração`);

      if (oauthUsers.length === 0) {
        console.log("✅ Nenhum avatar OAuth encontrado para migração");
        result.success = true;
        return result;
      }

      // Processar usuários em lotes de 10 para não sobrecarregar
      const batchSize = 10;

      for (let i = 0; i < oauthUsers.length; i += batchSize) {
        const batch = oauthUsers.slice(i, i + batchSize);
        console.log(
          `🔄 Processando lote ${Math.floor(i / batchSize) + 1}/${
            Math.ceil(oauthUsers.length / batchSize)
          } (${batch.length} usuários)`,
        );

        // Processar lote em paralelo
        const batchPromises = batch.map((user) => this.processUser(user));
        const batchResults = await Promise.all(batchPromises);

        // Atualizar contadores
        batchResults.forEach((batchResult, index) => {
          const user = batch[index];
          result.processed++;

          if (batchResult.success) {
            result.converted++;
            console.log(
              `✅ [${result.processed}/${oauthUsers.length}] Usuário ${user.id} convertido com sucesso`,
            );
          } else {
            result.failed++;
            result.errors.push({
              userId: user.id,
              error: batchResult.error || "Erro desconhecido",
              avatarUrl: user.avatar_url,
            });
            console.error(
              `❌ [${result.processed}/${oauthUsers.length}] Usuário ${user.id} falhou: ${batchResult.error}`,
            );
          }
        });

        // Pequena pausa entre lotes para evitar rate limiting
        if (i + batchSize < oauthUsers.length) {
          console.log("⏳ Pausa de 1 segundo entre lotes...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      result.success = result.errors.length === 0;
      console.log("🏁 Migração concluída!");
      console.log(
        `📊 Resultado: ${result.converted} convertidos, ${result.failed} falharam`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Erro desconhecido";
      console.error("💥 Erro geral durante migração:", errorMessage);

      result.errors.push({
        userId: "migration",
        error: errorMessage,
        avatarUrl: "",
      });

      return result;
    }
  }
}

/**
 * Função principal para executar a migração
 */
export const runAvatarMigration = async (): Promise<void> => {
  try {
    console.log("🚀 Iniciando Migração de Avatars OAuth");
    console.log("================================");

    const migration = new AvatarMigration();
    const result = await migration.migrateOAuthAvatars();

    console.log("================================");
    console.log("📊 RESULTADO DA MIGRAÇÃO:");
    console.log(`✅ Sucesso: ${result.success}`);
    console.log(`📈 Processados: ${result.processed}`);
    console.log(`🎯 Convertidos: ${result.converted}`);
    console.log(`❌ Falharam: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log("🚨 ERROS DETALHADOS:");
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. Usuário ${error.userId}: ${error.error}`);
        if (error.avatarUrl) {
          console.log(`   URL: ${error.avatarUrl}`);
        }
      });
    }

    console.log(
      result.success
        ? "🎉 Migração concluída com sucesso!"
        : "⚠️ Migração concluída com alguns erros. Verifique os logs acima.",
    );
  } catch (error) {
    console.error("💥 ERRO FATAL:", error);
  }
};
