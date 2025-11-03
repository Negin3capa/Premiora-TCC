/**
 * Tipos relacionados às preferências de interface do usuário
 */

/**
 * Temas disponíveis na aplicação
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Idiomas suportados
 */
export type Language = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Preferências de layout da interface
 */
export interface LayoutPreferences {
  /** Se a sidebar está recolhida */
  sidebarCollapsed: boolean;
  /** Densidade dos componentes (compact, comfortable, spacious) */
  density: 'compact' | 'comfortable' | 'spacious';
  /** Mostrar ou ocultar tooltips */
  showTooltips: boolean;
}

/**
 * Preferências de acessibilidade
 */
export interface AccessibilityPreferences {
  /** Tamanho da fonte (small, medium, large) */
  fontSize: 'small' | 'medium' | 'large';
  /** Alto contraste */
  highContrast: boolean;
  /** Reduzir animações */
  reduceMotion: boolean;
}

/**
 * Estado global das preferências de UI
 */
export interface UIContextState {
  /** Tema atual */
  theme: Theme;
  /** Idioma atual */
  language: Language;
  /** Preferências de layout */
  layout: LayoutPreferences;
  /** Preferências de acessibilidade */
  accessibility: AccessibilityPreferences;
  /** Indica se as preferências estão sendo carregadas */
  isLoading: boolean;
}

/**
 * Ações disponíveis para gerenciamento de UI
 */
export interface UIActions {
  /** Define o tema */
  setTheme: (theme: Theme) => void;
  /** Define o idioma */
  setLanguage: (language: Language) => void;
  /** Atualiza preferências de layout */
  updateLayout: (preferences: Partial<LayoutPreferences>) => void;
  /** Atualiza preferências de acessibilidade */
  updateAccessibility: (preferences: Partial<AccessibilityPreferences>) => void;
  /** Alterna estado da sidebar */
  toggleSidebar: () => void;
  /** Reseta todas as preferências para padrão */
  resetPreferences: () => void;
  /** Carrega preferências do usuário */
  loadPreferences: () => Promise<void>;
  /** Salva preferências do usuário */
  savePreferences: () => Promise<void>;
}

/**
 * Interface completa do contexto de UI
 */
export interface UIContextType extends UIContextState, UIActions {}

/**
 * Preferências padrão da interface
 */
export const DEFAULT_UI_PREFERENCES: Omit<UIContextState, 'isLoading'> = {
  theme: 'system',
  language: 'pt-BR',
  layout: {
    sidebarCollapsed: false,
    density: 'comfortable',
    showTooltips: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
  },
} as const;

/**
 * Chaves para armazenamento local das preferências
 */
export const UI_STORAGE_KEYS = {
  THEME: 'premiora-ui-theme',
  LANGUAGE: 'premiora-ui-language',
  LAYOUT: 'premiora-ui-layout',
  ACCESSIBILITY: 'premiora-ui-accessibility',
} as const;
