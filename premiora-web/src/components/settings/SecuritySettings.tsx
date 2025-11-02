/**
 * Componente para configurações de segurança e privacidade
 * Gerencia privacidade do perfil e configurações de segurança
 */
import React from 'react';
import { SettingItem } from './SettingItem';
import type { UserSettings, SettingKey } from '../../hooks/useSettings';

/**
 * Props do componente SecuritySettings
 */
interface SecuritySettingsProps {
  /** Configurações atuais */
  settings: UserSettings;
  /** Handler para atualização de configurações */
  onSettingChange: (key: SettingKey, value: any) => void;
  /** Handler para alterar senha */
  onChangePassword?: () => void;
  /** Handler para ativar 2FA */
  onEnable2FA?: () => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente SecuritySettings - Configurações de segurança e privacidade
 */
export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onSettingChange,
  onChangePassword,
  onEnable2FA,
  className = ''
}) => {
  const profileVisibilityOptions = [
    { value: 'public', label: 'Público' },
    { value: 'private', label: 'Privado' }
  ];

  return (
    <div className={`settings-section ${className}`}>
      <h3>Segurança e Privacidade</h3>

      <div className="setting-group">
        <h4>Privacidade do Perfil</h4>

        <SettingItem
          label="Visibilidade do perfil"
          description="Controla quem pode ver seu perfil e posts"
          type="select"
          value={settings.profileVisibility}
          options={profileVisibilityOptions}
          onChange={(value) => onSettingChange('profileVisibility', value)}
        />

        <SettingItem
          label="Mostrar status online"
          description="Permite que outros usuários vejam quando você está online"
          type="checkbox"
          checked={settings.showOnlineStatus}
          onChange={(value) => onSettingChange('showOnlineStatus', value)}
        />

        <SettingItem
          label="Permitir mensagens diretas"
          description="Permite que outros usuários enviem mensagens diretas para você"
          type="checkbox"
          checked={settings.allowMessages}
          onChange={(value) => onSettingChange('allowMessages', value)}
        />
      </div>

      <div className="setting-group">
        <h4>Segurança da Conta</h4>

        <SettingItem
          label="Alterar Senha"
          description="Atualize sua senha para manter sua conta segura"
          type="button"
          buttonText="Alterar Senha"
          onButtonClick={onChangePassword}
        />

        <SettingItem
          label="Ativar Autenticação de Dois Fatores"
          description="Adicione uma camada extra de segurança à sua conta"
          type="button"
          buttonText="Ativar 2FA"
          onButtonClick={onEnable2FA}
        />
      </div>
    </div>
  );
};
