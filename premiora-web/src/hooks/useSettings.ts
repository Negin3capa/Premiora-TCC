/**
 * Hook personalizado para gerenciar configurações do usuário
 * Centraliza estado e lógica de todas as configurações da aplicação
 */
import { useState } from 'react';

/**
 * Tipos de configurações disponíveis
 */
export type SettingKey =
  | 'emailNotifications'
  | 'pushNotifications'
  | 'marketingEmails'
  | 'profileVisibility'
  | 'showOnlineStatus'
  | 'allowMessages'
  | 'highContrast'
  | 'largeText'
  | 'reduceMotion'
  | 'allowAds'
  | 'creatorMode'
  | 'premiumFeatures';

/**
 * Estado das configurações do usuário
 */
export interface UserSettings {
  // Conta
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;

  // Privacidade
  profileVisibility: 'public' | 'private';
  showOnlineStatus: boolean;
  allowMessages: boolean;

  // Acessibilidade
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;

  // Monetização
  allowAds: boolean;
  creatorMode: boolean;
  premiumFeatures: boolean;
}

/**
 * Hook para gerenciar configurações do usuário
 */
export const useSettings = () => {
  // Estado das configurações
  const [settings, setSettings] = useState<UserSettings>({
    // Conta
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,

    // Privacidade
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: true,

    // Acessibilidade
    highContrast: false,
    largeText: false,
    reduceMotion: false,

    // Monetização
    allowAds: true,
    creatorMode: false,
    premiumFeatures: false,
  });

  /**
   * Atualiza uma configuração específica
   */
  const updateSetting = (key: SettingKey, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Atualiza múltiplas configurações de uma vez
   */
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

  /**
   * Reseta todas as configurações para os valores padrão
   */
  const resetSettings = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: true,
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      allowAds: true,
      creatorMode: false,
      premiumFeatures: false,
    });
  };

  /**
   * Obtém o valor de uma configuração específica
   */
  const getSetting = (key: SettingKey) => {
    return settings[key];
  };

  return {
    // Estado
    settings,

    // Ações
    updateSetting,
    updateSettings,
    resetSettings,
    getSetting,
  };
};
