import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { Sidebar, Header } from '../components/layout';
import {
  AccountSettings,
  SecuritySettings,
  AccessibilitySettings,
  MonetizationSettings
} from '../components/settings';
import '../styles/SettingsPage.css';

/**
 * Página de configurações do usuário
 * Permite gerenciar conta, privacidade, acessibilidade e monetização
 *
 * @component
 */
const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { settings, updateSetting } = useSettings();
  const [activeSection, setActiveSection] = useState('account');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handler para exclusão de conta
   */
  const handleDeleteAccount = async () => {
    try {
      // TODO: Implementar exclusão de conta via API
      console.log('Excluindo conta do usuário...');
      await signOut();
      // Redirecionar para página inicial
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    }
  };

  /**
   * Handler para alterar senha
   */
  const handleChangePassword = () => {
    // TODO: Implementar modal de alteração de senha
    console.log('Abrir modal de alteração de senha');
  };

  /**
   * Handler para ativar 2FA
   */
  const handleEnable2FA = () => {
    // TODO: Implementar ativação de 2FA
    console.log('Abrir modal de ativação de 2FA');
  };

  /**
   * Handler para fazer upgrade
   */
  const handleUpgrade = () => {
    // TODO: Implementar upgrade para premium
    console.log('Redirecionar para página de upgrade');
  };

  const sections = [
    { id: 'account', label: 'Conta', icon: '👤' },
    { id: 'security', label: 'Segurança e Privacidade', icon: '🔒' },
    { id: 'accessibility', label: 'Acessibilidade', icon: '♿' },
    { id: 'monetization', label: 'Monetização', icon: '💰' },
  ];

  return (
    <div className="settings-page">
      <Sidebar />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />

        <div className="settings-container">
          <div className="settings-sidebar">
            <h2>Configurações</h2>
            <nav className="settings-nav">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span className="nav-label">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-content">
            {activeSection === 'account' && (
              <AccountSettings
                settings={settings}
                onSettingChange={updateSetting}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeSection === 'security' && (
              <SecuritySettings
                settings={settings}
                onSettingChange={updateSetting}
                onChangePassword={handleChangePassword}
                onEnable2FA={handleEnable2FA}
              />
            )}

            {activeSection === 'accessibility' && (
              <AccessibilitySettings
                settings={settings}
                onSettingChange={updateSetting}
              />
            )}

            {activeSection === 'monetization' && (
              <MonetizationSettings
                settings={settings}
                onSettingChange={updateSetting}
                onUpgrade={handleUpgrade}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
