import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar, Header } from '../components/layout';
import MobileBottomBar from '../components/layout/MobileBottomBar';
import SubscriptionConfig from '../components/creator/SubscriptionConfig';
import CommunityConnection from '../components/creator/CommunityConnection';
import type { SubscriptionTier, CreatorChannelConfig } from '../types/creator';
import { CreatorChannelService } from '../services/content/CreatorChannelService';
import '../styles/CreatorChannelSetupPage.css';

const CreatorChannelSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'community'>('subscriptions');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [connectedCommunityId, setConnectedCommunityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadChannelData = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);
        const channel = await CreatorChannelService.getCreatorChannel(userProfile.id);
        
        if (channel) {
          setTiers(channel.subscriptionTiers);
          setConnectedCommunityId(channel.connectedCommunityId || null);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do canal:', err);
        setError('Falha ao carregar configurações. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadChannelData();
  }, [userProfile?.id]);

  const handleSave = async () => {
    if (!userProfile?.id) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const config: CreatorChannelConfig = {
        id: userProfile.id,
        userId: userProfile.id,
        subscriptionTiers: tiers,
        connectedCommunityId: connectedCommunityId || undefined,
        isSetupCompleted: true
      };

      const success = await CreatorChannelService.saveCreatorChannel(userProfile.id, config);

      if (success) {
        setSuccessMessage('Alterações salvas com sucesso!');
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Erro ao salvar alterações. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Ocorreu um erro inesperado ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="creator-setup-loading">
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="creator-setup-page">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={`creator-setup-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="creator-setup-container">
          {/* Header Section */}
          <div className="setup-header">
            <div>
              <button 
                onClick={() => navigate(-1)}
                className="back-button"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <h1 className="page-title">
                <Sparkles className="text-primary" size={32} />
                Configuração do Canal
              </h1>
              <p className="page-description">
                Configure suas assinaturas e conecte sua comunidade para oferecer benefícios exclusivos e monetizar seu conteúdo.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="save-button"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Tabs */}
          <div className="setup-tabs">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
            >
              Assinaturas e Níveis
              {activeTab === 'subscriptions' && <div className="tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
            >
              Comunidade Conectada
              {activeTab === 'community' && <div className="tab-indicator" />}
            </button>
          </div>

          {/* Content */}
          <div className="setup-content">
            {activeTab === 'subscriptions' ? (
              <div className="animate-fadeIn">
                <div className="info-card">
                  <h3 className="info-title">Sobre as Assinaturas</h3>
                  <p className="info-text">
                    Crie diferentes níveis de assinatura para oferecer benefícios exclusivos aos seus apoiadores. 
                    Você pode definir preços, nomes e benefícios personalizados para cada nível, similar ao Patreon.
                  </p>
                </div>
                <SubscriptionConfig 
                  tiers={tiers} 
                  onChange={setTiers} 
                />
              </div>
            ) : (
              <div className="animate-fadeIn">
                <CommunityConnection 
                  selectedCommunityId={connectedCommunityId || undefined}
                  onCommunitySelect={setConnectedCommunityId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default CreatorChannelSetupPage;
