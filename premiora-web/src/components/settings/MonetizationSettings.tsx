/**
 * Componente para configurações de monetização
 * Gerencia anúncios, modo criador e assinatura premium
 */
import React from 'react';
import { SettingItem } from './SettingItem';
import type { UserSettings, SettingKey } from '../../hooks/useSettings';

/**
 * Props do componente MonetizationSettings
 */
interface MonetizationSettingsProps {
  /** Configurações atuais */
  settings: UserSettings;
  /** Handler para atualização de configurações */
  onSettingChange: (key: SettingKey, value: any) => void;
  /** Handler para fazer upgrade */
  onUpgrade?: () => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente MonetizationSettings - Configurações de monetização
 */
export const MonetizationSettings: React.FC<MonetizationSettingsProps> = ({
  settings,
  onSettingChange,
  onUpgrade,
  className = ''
}) => {
  return (
    <div className={`settings-section ${className}`}>
      <h3>Monetização</h3>

      <div className="setting-group">
        <h4>Receitas e Anúncios</h4>

        <SettingItem
          label="Permitir anúncios personalizados"
          description="Permite que anúncios sejam exibidos com base nos seus interesses"
          type="checkbox"
          checked={settings.allowAds}
          onChange={(value) => onSettingChange('allowAds', value)}
        />

        <SettingItem
          label="Modo criador"
          description="Ative ferramentas especiais para criadores de conteúdo"
          type="checkbox"
          checked={settings.creatorMode}
          onChange={(value) => onSettingChange('creatorMode', value)}
        />

        <SettingItem
          label="Recursos premium"
          description="Acesso a recursos exclusivos com assinatura premium"
          type="checkbox"
          checked={settings.premiumFeatures}
          onChange={(value) => onSettingChange('premiumFeatures', value)}
        />
      </div>

      <div className="setting-group">
        <h4>Assinatura</h4>
        <div className="subscription-info">
          <p>Plano atual: <strong>Gratuito</strong></p>
          <button className="btn-primary" onClick={onUpgrade}>
            Fazer Upgrade para Premium
          </button>
        </div>
      </div>
    </div>
  );
};
