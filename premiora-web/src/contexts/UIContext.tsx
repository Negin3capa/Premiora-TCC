import React, { createContext, useCallback, useEffect, useState } from 'react';
import type {
  UIContextType,
  Theme,
  Language,
  LayoutPreferences,
  AccessibilityPreferences,
  UIContextState
} from '../types/ui';
import { DEFAULT_UI_PREFERENCES, UI_STORAGE_KEYS } from '../types/ui';

/**
 * Contexto para gerenciamento centralizado das preferências de interface do usuário
 * Gerencia tema, idioma, layout e configurações de acessibilidade
 */
export const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * Provider de UI que gerencia estado global das preferências da interface
 * Inclui persistência automática no localStorage e aplicação de temas
 *
 * @component
 */
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIContextState>({
    ...DEFAULT_UI_PREFERENCES,
    isLoading: true,
  });

  /**
   * Aplica o tema no documento HTML
   * @param theme - Tema a ser aplicado
   */
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;

    // Remove classes de tema anteriores
    root.classList.remove('theme-light', 'theme-dark', 'theme-system');

    // Aplica novo tema
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(`theme-${systemTheme}`);
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.classList.add(`theme-${theme}`);
      root.setAttribute('data-theme', theme);
    }
  }, []);

  /**
   * Aplica as configurações de acessibilidade
   * @param accessibility - Configurações de acessibilidade
   */
  const applyAccessibility = useCallback((accessibility: AccessibilityPreferences) => {
    const root = document.documentElement;

    // Aplica tamanho da fonte
    root.setAttribute('data-font-size', accessibility.fontSize);

    // Aplica alto contraste
    if (accessibility.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Aplica redução de movimento
    if (accessibility.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }
  }, []);

  /**
   * Carrega preferências do localStorage
   */
  const loadPreferences = useCallback(async () => {
    try {
      const storedTheme = localStorage.getItem(UI_STORAGE_KEYS.THEME) as Theme;
      const storedLanguage = localStorage.getItem(UI_STORAGE_KEYS.LANGUAGE) as Language;
      const storedLayout = localStorage.getItem(UI_STORAGE_KEYS.LAYOUT);
      const storedAccessibility = localStorage.getItem(UI_STORAGE_KEYS.ACCESSIBILITY);

      const preferences = {
        theme: storedTheme || DEFAULT_UI_PREFERENCES.theme,
        language: storedLanguage || DEFAULT_UI_PREFERENCES.language,
        layout: storedLayout ? JSON.parse(storedLayout) : DEFAULT_UI_PREFERENCES.layout,
        accessibility: storedAccessibility ? JSON.parse(storedAccessibility) : DEFAULT_UI_PREFERENCES.accessibility,
      };

      setState(prev => ({ ...prev, ...preferences, isLoading: false }));

      // Aplica as configurações carregadas
      applyTheme(preferences.theme);
      applyAccessibility(preferences.accessibility);

    } catch (error) {
      console.error('Erro ao carregar preferências de UI:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      applyTheme(DEFAULT_UI_PREFERENCES.theme);
      applyAccessibility(DEFAULT_UI_PREFERENCES.accessibility);
    }
  }, [applyTheme, applyAccessibility]);

  /**
   * Salva preferências no localStorage
   */
  const savePreferences = useCallback(async () => {
    try {
      localStorage.setItem(UI_STORAGE_KEYS.THEME, state.theme);
      localStorage.setItem(UI_STORAGE_KEYS.LANGUAGE, state.language);
      localStorage.setItem(UI_STORAGE_KEYS.LAYOUT, JSON.stringify(state.layout));
      localStorage.setItem(UI_STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(state.accessibility));
    } catch (error) {
      console.error('Erro ao salvar preferências de UI:', error);
    }
  }, [state]);

  /**
   * Define o tema e aplica as mudanças
   * @param theme - Novo tema
   */
  const setTheme = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
    applyTheme(theme);
  }, [applyTheme]);

  /**
   * Define o idioma
   * @param language - Novo idioma
   */
  const setLanguage = useCallback((language: Language) => {
    setState(prev => ({ ...prev, language }));
  }, []);

  /**
   * Atualiza preferências de layout
   * @param preferences - Novas preferências de layout
   */
  const updateLayout = useCallback((preferences: Partial<LayoutPreferences>) => {
    setState(prev => ({
      ...prev,
      layout: { ...prev.layout, ...preferences }
    }));
  }, []);

  /**
   * Atualiza preferências de acessibilidade e aplica as mudanças
   * @param preferences - Novas preferências de acessibilidade
   */
  const updateAccessibility = useCallback((preferences: Partial<AccessibilityPreferences>) => {
    setState(prev => {
      const newAccessibility = { ...prev.accessibility, ...preferences };
      applyAccessibility(newAccessibility);
      return { ...prev, accessibility: newAccessibility };
    });
  }, [applyAccessibility]);

  /**
   * Alterna o estado da sidebar
   */
  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      layout: { ...prev.layout, sidebarCollapsed: !prev.layout.sidebarCollapsed }
    }));
  }, []);

  /**
   * Reseta todas as preferências para os valores padrão
   */
  const resetPreferences = useCallback(() => {
    setState({
      ...DEFAULT_UI_PREFERENCES,
      isLoading: false
    });
    applyTheme(DEFAULT_UI_PREFERENCES.theme);
    applyAccessibility(DEFAULT_UI_PREFERENCES.accessibility);
  }, [applyTheme, applyAccessibility]);

  // Carrega preferências na inicialização
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Salva preferências automaticamente quando mudam
  useEffect(() => {
    if (!state.isLoading) {
      savePreferences();
    }
  }, [state, savePreferences]);

  // Escuta mudanças no tema do sistema quando está em modo 'system'
  useEffect(() => {
    if (state.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.theme, applyTheme]);

  const value: UIContextType = {
    ...state,
    setTheme,
    setLanguage,
    updateLayout,
    updateAccessibility,
    toggleSidebar,
    resetPreferences,
    loadPreferences,
    savePreferences,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
