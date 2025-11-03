import { useContext } from 'react';
import { UIContext } from '../contexts/UIContext';
import type { UIContextType } from '../types/ui';

/**
 * Hook personalizado para acesso ao contexto de UI
 * Fornece acesso centralizado às preferências e configurações da interface
 *
 * @returns Contexto de UI com todas as funções disponíveis
 * @throws Error se usado fora do UIProvider
 *
 * @example
 * ```typescript
 * const {
 *   theme,
 *   language,
 *   layout,
 *   setTheme,
 *   toggleSidebar
 * } = useUI();
 *
 * // Alterar tema
 * setTheme('dark');
 *
 * // Alternar sidebar
 * toggleSidebar();
 * ```
 */
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);

  if (context === undefined) {
    throw new Error('useUI deve ser usado dentro de um UIProvider');
  }

  return context;
};

/**
 * Hook específico para gerenciamento de tema
 * Retorna estado e ações relacionadas ao tema
 *
 * @returns Estado e ações do tema
 *
 * @example
 * ```typescript
 * const { theme, setTheme, isDark, isLight } = useTheme();
 *
 * // Verificar se está no tema escuro
 * if (isDark) {
 *   // Aplicar estilos específicos
 * }
 *
 * // Alternar entre claro e escuro
 * setTheme(theme === 'dark' ? 'light' : 'dark');
 * ```
 */
export const useTheme = () => {
  const { theme, setTheme } = useUI();

  return {
    /** Tema atual */
    theme,
    /** Define o tema */
    setTheme,
    /** Verifica se está no tema escuro */
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    /** Verifica se está no tema claro */
    isLight: theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches),
    /** Verifica se está usando tema do sistema */
    isSystem: theme === 'system',
  };
};

/**
 * Hook específico para gerenciamento de idioma
 * Retorna estado e ações relacionadas ao idioma
 *
 * @returns Estado e ações do idioma
 *
 * @example
 * ```typescript
 * const { language, setLanguage, isPortuguese } = useLanguage();
 *
 * // Verificar se está em português
 * if (isPortuguese) {
 *   // Usar textos em português
 * }
 *
 * // Alterar idioma
 * setLanguage('en-US');
 * ```
 */
export const useLanguage = () => {
  const { language, setLanguage } = useUI();

  return {
    /** Idioma atual */
    language,
    /** Define o idioma */
    setLanguage,
    /** Verifica se está em português brasileiro */
    isPortuguese: language === 'pt-BR',
    /** Verifica se está em inglês americano */
    isEnglish: language === 'en-US',
    /** Verifica se está em espanhol */
    isSpanish: language === 'es-ES',
  };
};

/**
 * Hook específico para gerenciamento de layout
 * Retorna estado e ações relacionadas ao layout da interface
 *
 * @returns Estado e ações do layout
 *
 * @example
 * ```typescript
 * const {
 *   layout,
 *   updateLayout,
 *   toggleSidebar,
 *   isSidebarCollapsed
 * } = useLayout();
 *
 * // Verificar se sidebar está recolhida
 * if (isSidebarCollapsed) {
 *   // Ajustar layout
 * }
 *
 * // Alterar densidade dos componentes
 * updateLayout({ density: 'compact' });
 * ```
 */
export const useLayout = () => {
  const { layout, updateLayout, toggleSidebar } = useUI();

  return {
    /** Preferências de layout atuais */
    layout,
    /** Atualiza preferências de layout */
    updateLayout,
    /** Alterna estado da sidebar */
    toggleSidebar,
    /** Verifica se sidebar está recolhida */
    isSidebarCollapsed: layout.sidebarCollapsed,
    /** Verifica se tooltips estão habilitados */
    showTooltips: layout.showTooltips,
    /** Densidade atual dos componentes */
    density: layout.density,
  };
};

/**
 * Hook específico para configurações de acessibilidade
 * Retorna estado e ações relacionadas à acessibilidade
 *
 * @returns Estado e ações de acessibilidade
 *
 * @example
 * ```typescript
 * const {
 *   accessibility,
 *   updateAccessibility,
 *   hasHighContrast,
 *   shouldReduceMotion
 * } = useAccessibility();
 *
 * // Verificar se deve reduzir animações
 * if (shouldReduceMotion) {
 *   // Desabilitar animações
 * }
 *
 * // Ativar alto contraste
 * updateAccessibility({ highContrast: true });
 * ```
 */
export const useAccessibility = () => {
  const { accessibility, updateAccessibility } = useUI();

  return {
    /** Preferências de acessibilidade atuais */
    accessibility,
    /** Atualiza preferências de acessibilidade */
    updateAccessibility,
    /** Verifica se alto contraste está ativado */
    hasHighContrast: accessibility.highContrast,
    /** Verifica se deve reduzir movimento/animações */
    shouldReduceMotion: accessibility.reduceMotion,
    /** Tamanho da fonte atual */
    fontSize: accessibility.fontSize,
    /** Verifica se fonte é pequena */
    isSmallFont: accessibility.fontSize === 'small',
    /** Verifica se fonte é média */
    isMediumFont: accessibility.fontSize === 'medium',
    /** Verifica se fonte é grande */
    isLargeFont: accessibility.fontSize === 'large',
  };
};
