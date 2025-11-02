import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar, Header } from '../components/layout';
import '../styles/SettingsPage.css';

/**
 * Página de configurações do usuário
 * Permite gerenciar conta, privacidade, acessibilidade e monetização
 *
 * @component
 */
const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para configurações
  const [settings, setSettings] = useState({
    // Conta
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,

    // Privacidade
    profileVisibility: 'public' as 'public' | 'private',
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
   * Handler para atualização de configurações
   */
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Handler para exclusão de conta
   */
  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

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
              <div className="settings-section">
                <h3>Configurações da Conta</h3>

                <div className="setting-group">
                  <h4>Notificações</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <span>Notificações por email</span>
                    </label>
                    <p className="setting-description">
                      Receba atualizações sobre sua conta e atividades importantes
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <span>Notificações push</span>
                    </label>
                    <p className="setting-description">
                      Receba notificações no navegador sobre novas atividades
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                      />
                      <span>Emails de marketing</span>
                    </label>
                    <p className="setting-description">
                      Receba ofertas especiais e novidades da Premiora
                    </p>
                  </div>
                </div>

                <div className="setting-group danger-zone">
                  <h4>Zona de Perigo</h4>
                  <div className="setting-item">
                    <div className="delete-account-section">
                      <h5>Excluir Conta</h5>
                      <p className="setting-description">
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          className="btn-danger"
                          onClick={handleDeleteAccount}
                        >
                          Excluir Conta
                        </button>
                      ) : (
                        <div className="delete-confirm">
                          <p>Tem certeza de que deseja excluir sua conta?</p>
                          <div className="confirm-buttons">
                            <button
                              className="btn-secondary"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              Cancelar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={handleDeleteAccount}
                            >
                              Confirmar Exclusão
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="settings-section">
                <h3>Segurança e Privacidade</h3>

                <div className="setting-group">
                  <h4>Privacidade do Perfil</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Visibilidade do perfil</span>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value as 'public' | 'private')}
                      >
                        <option value="public">Público</option>
                        <option value="private">Privado</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Controla quem pode ver seu perfil e posts
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.showOnlineStatus}
                        onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                      />
                      <span>Mostrar status online</span>
                    </label>
                    <p className="setting-description">
                      Permite que outros usuários vejam quando você está online
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.allowMessages}
                        onChange={(e) => handleSettingChange('allowMessages', e.target.checked)}
                      />
                      <span>Permitir mensagens diretas</span>
                    </label>
                    <p className="setting-description">
                      Permite que outros usuários enviem mensagens diretas para você
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Segurança da Conta</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      Alterar Senha
                    </button>
                    <p className="setting-description">
                      Atualize sua senha para manter sua conta segura
                    </p>
                  </div>

                  <div className="setting-item">
                    <button className="btn-secondary">
                      Ativar Autenticação de Dois Fatores
                    </button>
                    <p className="setting-description">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'accessibility' && (
              <div className="settings-section">
                <h3>Acessibilidade</h3>

                <div className="setting-group">
                  <h4>Visual</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                      />
                      <span>Alto contraste</span>
                    </label>
                    <p className="setting-description">
                      Aumenta o contraste entre texto e fundo para melhor legibilidade
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.largeText}
                        onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                      />
                      <span>Texto grande</span>
                    </label>
                    <p className="setting-description">
                      Aumenta o tamanho do texto em toda a aplicação
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.reduceMotion}
                        onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)}
                      />
                      <span>Reduzir animações</span>
                    </label>
                    <p className="setting-description">
                      Minimiza animações e transições para reduzir movimento na tela
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'monetization' && (
              <div className="settings-section">
                <h3>Monetização</h3>

                <div className="setting-group">
                  <h4>Receitas e Anúncios</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.allowAds}
                        onChange={(e) => handleSettingChange('allowAds', e.target.checked)}
                      />
                      <span>Permitir anúncios personalizados</span>
                    </label>
                    <p className="setting-description">
                      Permite que anúncios sejam exibidos com base nos seus interesses
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.creatorMode}
                        onChange={(e) => handleSettingChange('creatorMode', e.target.checked)}
                      />
                      <span>Modo criador</span>
                    </label>
                    <p className="setting-description">
                      Ative ferramentas especiais para criadores de conteúdo
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.premiumFeatures}
                        onChange={(e) => handleSettingChange('premiumFeatures', e.target.checked)}
                      />
                      <span>Recursos premium</span>
                    </label>
                    <p className="setting-description">
                      Acesso a recursos exclusivos com assinatura premium
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Assinatura</h4>
                  <div className="subscription-info">
                    <p>Plano atual: <strong>Gratuito</strong></p>
                    <button className="btn-primary">
                      Fazer Upgrade para Premium
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
