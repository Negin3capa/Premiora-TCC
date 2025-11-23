import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import {
  Palette,
  User,
  Bell,
  Lock,
  Accessibility,
  Database,
  DollarSign,
  Sun,
  Moon,
  Monitor,
  Download,
  Settings as SettingsIcon,
  Upload,
  BarChart3,
  Trash2,
  Ban,
  CreditCard,
  Users,
  LayoutDashboard
} from 'lucide-react';
import '../styles/SettingsPage.css';

/**
 * Página de configurações do usuário
 * Permite gerenciar conta, privacidade, acessibilidade e monetização
 *
 * @component
 */
const SettingsPage: React.FC = () => {
  const { signOut } = useAuth();
  const {
    theme,
    language,
    layout,
    accessibility,
    setTheme,
    setLanguage,
    updateLayout,
    updateAccessibility,
    resetPreferences
  } = useUI();
  const [activeSection, setActiveSection] = useState('appearance');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados para configurações com valores padrão
  const defaultSettings = {
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
  };

  const [settings, setSettings] = useState(defaultSettings);

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('premiora-user-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do usuário:', error);
    }
  }, []);

  // Salvar configurações no localStorage quando mudam
  useEffect(() => {
    try {
      localStorage.setItem('premiora-user-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações do usuário:', error);
    }
  }, [settings]);

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
    { id: 'appearance', label: 'Aparência', icon: <Palette size={20} /> },
    { id: 'account', label: 'Conta', icon: <User size={20} /> },
    { id: 'notifications', label: 'Notificações', icon: <Bell size={20} /> },
    { id: 'privacy', label: 'Privacidade', icon: <Lock size={20} /> },
    { id: 'accessibility', label: 'Acessibilidade', icon: <Accessibility size={20} /> },
    { id: 'data', label: 'Dados e Privacidade', icon: <Database size={20} /> },
    { id: 'creator-tools', label: 'Ferramentas de Criador', icon: <LayoutDashboard size={20} /> },
    { id: 'monetization', label: 'Monetização', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="settings-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="settings-main-content">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h3>Aparência</h3>

                <div className="setting-group">
                  <h4>Tema</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Tema da aplicação</span>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                      >
                        <option value="light"><Sun size={16} /> Claro</option>
                        <option value="dark"><Moon size={16} /> Escuro</option>
                        <option value="system"><Monitor size={16} /> Sistema</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Escolha o tema da aplicação ou siga as preferências do seu sistema
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Idioma</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Idioma da aplicação</span>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'pt-BR' | 'en-US' | 'es-ES')}
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Selecione o idioma para a interface da aplicação
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Layout</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Densidade da interface</span>
                      <select
                        value={layout.density}
                        onChange={(e) => updateLayout({ density: e.target.value as 'compact' | 'comfortable' | 'spacious' })}
                      >
                        <option value="compact">Compacto</option>
                        <option value="comfortable">Confortável</option>
                        <option value="spacious">Espaçoso</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Controla o espaçamento e tamanho dos elementos da interface
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={layout.sidebarCollapsed}
                        onChange={(e) => updateLayout({ sidebarCollapsed: e.target.checked })}
                      />
                      <span>Barra lateral recolhida por padrão</span>
                    </label>
                    <p className="setting-description">
                      Mantém a barra lateral sempre recolhida ao abrir a aplicação
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={layout.showTooltips}
                        onChange={(e) => updateLayout({ showTooltips: e.target.checked })}
                      />
                      <span>Mostrar dicas de ferramentas</span>
                    </label>
                    <p className="setting-description">
                      Exibe dicas informativas ao passar o mouse sobre elementos
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Redefinir Preferências</h4>
                  <div className="setting-item">
                    <button
                      className="btn-secondary"
                      onClick={resetPreferences}
                    >
                      Restaurar Padrões
                    </button>
                    <p className="setting-description">
                      Restaura todas as configurações de aparência para os valores padrão
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3>Notificações</h3>

                <div className="setting-group">
                  <h4>Notificações por Email</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <span>Atividades da conta</span>
                    </label>
                    <p className="setting-description">
                      Receba emails sobre alterações na sua conta e segurança
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                      />
                      <span>Novidades e ofertas</span>
                    </label>
                    <p className="setting-description">
                      Receba informações sobre novos recursos e ofertas especiais
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Notificações Push</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <span>Notificações no navegador</span>
                    </label>
                    <p className="setting-description">
                      Receba notificações push sobre atividades importantes
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Frequência de Notificações</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Frequência de resumos</span>
                      <select defaultValue="daily">
                        <option value="realtime">Tempo real</option>
                        <option value="hourly">A cada hora</option>
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="never">Nunca</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Com que frequência você deseja receber resumos de atividades
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Testar Notificações</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      Enviar Notificação de Teste
                    </button>
                    <p className="setting-description">
                      Envie uma notificação de teste para verificar se tudo está funcionando
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h3>Privacidade</h3>

                <div className="setting-group">
                  <h4>Visibilidade do Perfil</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Quem pode ver meu perfil</span>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value as 'public' | 'private')}
                      >
                        <option value="public">Todos os usuários</option>
                        <option value="private">Apenas eu</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Controla quem pode acessar e visualizar seu perfil
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Interações</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.showOnlineStatus}
                        onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                      />
                      <span>Mostrar quando estou online</span>
                    </label>
                    <p className="setting-description">
                      Permite que outros usuários vejam seu status online
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
                      Permite que outros usuários enviem mensagens privadas para você
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Controle de Dados</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      Baixar Meus Dados
                    </button>
                    <p className="setting-description">
                      Baixe uma cópia de todos os seus dados pessoais
                    </p>
                  </div>

                  <div className="setting-item">
                    <button className="btn-secondary">
                      Solicitar Exclusão de Dados
                    </button>
                    <p className="setting-description">
                      Solicite a exclusão permanente de todos os seus dados
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'accessibility' && (
              <div className="settings-section">
                <h3>Acessibilidade</h3>

                <div className="setting-group">
                  <h4>Tamanho da Fonte</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <span>Tamanho do texto</span>
                      <select
                        value={accessibility.fontSize}
                        onChange={(e) => updateAccessibility({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                      >
                        <option value="small">Pequeno</option>
                        <option value="medium">Médio</option>
                        <option value="large">Grande</option>
                      </select>
                    </label>
                    <p className="setting-description">
                      Ajusta o tamanho do texto em toda a aplicação
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Visual</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={accessibility.highContrast}
                        onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
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
                        checked={accessibility.reduceMotion}
                        onChange={(e) => updateAccessibility({ reduceMotion: e.target.checked })}
                      />
                      <span>Reduzir animações</span>
                    </label>
                    <p className="setting-description">
                      Minimiza animações e transições para reduzir movimento na tela
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Preferências de Acessibilidade</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      Verificar Compatibilidade
                    </button>
                    <p className="setting-description">
                      Execute testes de acessibilidade na aplicação
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="settings-section">
                <h3>Dados e Privacidade</h3>

                <div className="setting-group">
                  <h4>Exportar Dados</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      <Download size={16} /> Baixar Meus Dados
                    </button>
                    <p className="setting-description">
                      Baixe uma cópia completa de todos os seus dados pessoais em formato JSON
                    </p>
                  </div>

                  <div className="setting-item">
                    <button className="btn-secondary">
                      <SettingsIcon size={16} /> Exportar Configurações
                    </button>
                    <p className="setting-description">
                      Exporte todas as suas configurações e preferências
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Importar Dados</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      <Upload size={16} /> Importar Configurações
                    </button>
                    <p className="setting-description">
                      Importe configurações de um arquivo previamente exportado
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Histórico de Atividades</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      <BarChart3 size={16} /> Ver Histórico
                    </button>
                    <p className="setting-description">
                      Visualize seu histórico de atividades na plataforma
                    </p>
                  </div>
                </div>

                <div className="setting-group danger-zone">
                  <h4>Exclusão de Dados</h4>
                  <div className="setting-item">
                    <button className="btn-danger">
                      <Trash2 size={16} /> Solicitar Exclusão de Dados
                    </button>
                    <p className="setting-description">
                      Solicite a exclusão permanente de todos os seus dados (conforme LGPD)
                    </p>
                  </div>

                  <div className="setting-item">
                    <button className="btn-danger">
                      <Ban size={16} /> Anonimizar Dados
                    </button>
                    <p className="setting-description">
                      Torne seus dados anônimos mantendo apenas estatísticas agregadas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'creator-tools' && (
              <div className="settings-section">
                <h3>Ferramentas de Criador</h3>
                
                <div className="setting-group">
                  <h4>Analytics</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      <BarChart3 size={16} /> Ver Painel de Analytics
                    </button>
                    <p className="setting-description">
                      Visualize estatísticas detalhadas sobre seu conteúdo e audiência
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Gestão de Comunidade</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      <Users size={16} /> Gerenciar Membros
                    </button>
                    <p className="setting-description">
                      Gerencie membros, moderadores e permissões da sua comunidade
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'monetization' && (
              <div className="settings-section">
                <h3>Monetização</h3>

                <div className="setting-group">
                  <h4>Status da Conta</h4>
                  <div className="monetization-status-card">
                    <div className="status-header">
                      <span className="status-label">Nível de Criador</span>
                      <span className="status-value">Iniciante</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '30%' }}></div>
                    </div>
                    <p className="status-description">
                      Complete mais 2 metas para desbloquear o nível Intermediário
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Configurações de Pagamento</h4>
                  <div className="setting-item">
                    <button className="btn-secondary">
                      <CreditCard size={16} /> Configurar Payouts
                    </button>
                    <p className="setting-description">
                      Conecte sua conta bancária ou Stripe para receber pagamentos
                    </p>
                  </div>
                </div>

                <div className="setting-group">
                  <h4>Receitas e Anúncios</h4>
                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.allowAds}
                        onChange={(e) => handleSettingChange('allowAds', e.target.checked)}
                      />
                      <span>Permitir anúncios em meu conteúdo</span>
                    </label>
                    <p className="setting-description">
                      Ganhe receita exibindo anúncios em seus vídeos e posts
                    </p>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={settings.premiumFeatures}
                        onChange={(e) => handleSettingChange('premiumFeatures', e.target.checked)}
                      />
                      <span>Habilitar Assinaturas de Fãs</span>
                    </label>
                    <p className="setting-description">
                      Permita que fãs assinem seu conteúdo exclusivo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default SettingsPage;
