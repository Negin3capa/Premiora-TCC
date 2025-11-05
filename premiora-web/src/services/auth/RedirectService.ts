/**
 * Serviço de utilitários de redirecionamento
 * Responsável por determinar URLs de redirecionamento apropriadas
 */
export class RedirectService {
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
}
