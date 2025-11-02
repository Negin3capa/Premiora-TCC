/**
 * Componente para configurações de acessibilidade
 * Gerencia configurações visuais e de acessibilidade
 */
import React from 'react';
import { SettingItem } from './SettingItem';
import type { UserSettings, SettingKey } from '../../hooks/useSettings';

/**
 * Props do componente AccessibilitySettings
 */
interface AccessibilitySettingsProps {
  /** Configurações atuais */
  settings: UserSettings;
  /** Handler para atualização de configurações */
  onSettingChange: (key: SettingKey, value: any) => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente AccessibilitySettings - Configurações de acessibilidade
 */
export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  settings,
  onSettingChange,
  className = ''
}) => {
  return (
    <div className={`settings-section ${className}`}>
      <h3>Acessibilidade</h3>

      <div className="setting-group">
        <h4>Visual</h4>

        <SettingItem
          label="Alto contraste"
          description="Aumenta o contraste entre texto e fundo para melhor legibilidade"
          type="checkbox"
          checked={settings.highContrast}
          onChange={(value) => onSettingChange('highContrast', value)}
        />

        <SettingItem
          label="Texto grande"
          description="Aumenta o tamanho do texto em toda a aplicação"
          type="checkbox"
          checked={settings.largeText}
          onChange={(value) => onSettingChange('largeText', value)}
        />

        <SettingItem
          label="Reduzir animações"
          description="Minimiza animações e transições para reduzir movimento na tela"
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={(value) => onSettingChange('reduceMotion', value)}
        />
      </div>
    </div>
  );
};
