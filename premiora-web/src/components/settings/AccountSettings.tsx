/**
 * Componente para configurações da conta
 * Gerencia notificações e outras configurações da conta
 */
import React from 'react';
import { SettingItem } from './SettingItem';
import { DeleteAccountSection } from './DeleteAccountSection';
import type { UserSettings, SettingKey } from '../../hooks/useSettings';

/**
 * Props do componente AccountSettings
 */
interface AccountSettingsProps {
  /** Configurações atuais */
  settings: UserSettings;
  /** Handler para atualização de configurações */
  onSettingChange: (key: SettingKey, value: any) => void;
  /** Handler para exclusão de conta */
  onDeleteAccount: () => Promise<void>;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente AccountSettings - Configurações da conta
 */
export const AccountSettings: React.FC<AccountSettingsProps> = ({
  settings,
  onSettingChange,
  onDeleteAccount,
  className = ''
}) => {
  return (
    <div className={`settings-section ${className}`}>
      <h3>Configurações da Conta</h3>

      <div className="setting-group">
        <h4>Notificações</h4>

        <SettingItem
          label="Notificações por email"
          description="Receba atualizações sobre sua conta e atividades importantes"
          type="checkbox"
          checked={settings.emailNotifications}
          onChange={(value) => onSettingChange('emailNotifications', value)}
        />

        <SettingItem
          label="Notificações push"
          description="Receba notificações no navegador sobre novas atividades"
          type="checkbox"
          checked={settings.pushNotifications}
          onChange={(value) => onSettingChange('pushNotifications', value)}
        />

        <SettingItem
          label="Emails de marketing"
          description="Receba ofertas especiais e novidades da Premiora"
          type="checkbox"
          checked={settings.marketingEmails}
          onChange={(value) => onSettingChange('marketingEmails', value)}
        />
      </div>

      <DeleteAccountSection onDeleteAccount={onDeleteAccount} />
    </div>
  );
};
