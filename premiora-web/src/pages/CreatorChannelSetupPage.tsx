import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar, Header } from '../components/layout';
import MobileBottomBar from '../components/layout/MobileBottomBar';
import SubscriptionConfig from '../components/creator/SubscriptionConfig';
import SubscriptionConfigSkeleton from '../components/creator/SubscriptionConfigSkeleton';
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [connectedCommunityId, setConnectedCommunityId] = useState<string | null>(null);

  // State for unsaved changes tracking
  const [initialTiers, setInitialTiers] = useState<SubscriptionTier[]>([]);
  const [initialConnectedCommunityId, setInitialConnectedCommunityId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchChannelConfig = async () => {
      if (!userProfile?.id) return;
      
      try {
        setLoading(true);
        const config = await CreatorChannelService.getCreatorChannel(userProfile.id);
        
        if (config) {
          setTiers(config.subscriptionTiers || []);
          setConnectedCommunityId(config.connectedCommunityId || null);
          
          // Set initial state for change tracking
          setInitialTiers(config.subscriptionTiers || []);
          setInitialConnectedCommunityId(config.connectedCommunityId || null);
        }
      } catch (err) {
        console.error('Error fetching channel config:', err);
        setError('Falha ao carregar configurações do canal.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelConfig();
  }, [userProfile?.id]);

  // Check for unsaved changes
  useEffect(() => {
    const tiersChanged = JSON.stringify(tiers) !== JSON.stringify(initialTiers);
    const communityChanged = connectedCommunityId !== initialConnectedCommunityId;
    setHasUnsavedChanges(tiersChanged || communityChanged);
  }, [tiers, connectedCommunityId, initialTiers, initialConnectedCommunityId]);

  // Warn on browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    if (!userProfile?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const config: CreatorChannelConfig = {
        id: userProfile.id,
        userId: userProfile.id,
        subscriptionTiers: tiers,
        connectedCommunityId: connectedCommunityId || undefined,
        isSetupCompleted: true
      };

      await CreatorChannelService.saveCreatorChannel(userProfile.id, config);
      
      // Update initial state after successful save
      setInitialTiers(tiers);
      setInitialConnectedCommunityId(connectedCommunityId);
      setHasUnsavedChanges(false);
      
      setSuccessMessage('Configurações salvas com sucesso!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving channel config:', err);
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
                aria-label="Voltar para a página anterior"
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
              aria-label={saving ? "Salvando alterações" : "Salvar alterações"}
              aria-busy={saving}
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
              aria-selected={activeTab === 'subscriptions'}
              role="tab"
            >
              Assinaturas e Níveis
              {activeTab === 'subscriptions' && <div className="tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
              aria-selected={activeTab === 'community'}
              role="tab"
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
                {loading ? (
                  <SubscriptionConfigSkeleton />
                ) : (
                  <SubscriptionConfig 
                    tiers={tiers} 
                    onChange={setTiers} 
                  />
                )}
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
