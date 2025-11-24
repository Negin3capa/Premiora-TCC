import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import { CreatorChannelService } from '../../services/content/CreatorChannelService';
import { paymentService } from '../../services/payment/PaymentService';
import type { CreatorChannelConfig } from '../../types/creator';

const CreatorPayments: React.FC = () => {
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'withdraw' | 'documents'>('withdraw');
  const [channelConfig, setChannelConfig] = useState<CreatorChannelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (userProfile?.id) {
        try {
          const config = await CreatorChannelService.getCreatorChannel(userProfile.id);
          setChannelConfig(config);
        } catch (error) {
          console.error("Error fetching channel config:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchConfig();
  }, [userProfile?.id]);

  const handleSetupPayouts = async () => {
    try {
      setSetupLoading(true);
      const url = await paymentService.createConnectAccount();
      window.location.href = url;
    } catch (error) {
      console.error("Error setting up payouts:", error);
      alert("Erro ao iniciar configuração de pagamentos. Tente novamente.");
    } finally {
      setSetupLoading(false);
    }
  };

  const hasStripeConnect = !!channelConfig?.stripeConnectId;

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Carregando...</div>;
  }

  return (
    <div className="creator-payments">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
        Pagamentos e Ganhos
      </h2>

      {!hasStripeConnect ? (
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid var(--color-border-light)',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <DollarSign size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
            Configure seus pagamentos
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Para receber pagamentos de assinaturas e doações, você precisa conectar uma conta bancária através do Stripe. É seguro e rápido.
          </p>
          <button 
            onClick={handleSetupPayouts}
            disabled={setupLoading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: setupLoading ? 'not-allowed' : 'pointer',
              opacity: setupLoading ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {setupLoading ? 'Iniciando...' : 'Configurar Recebimentos'}
            {!setupLoading && <ExternalLink size={16} />}
          </button>
        </div>
      ) : (
        <>
          <div className="creator-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <button 
              onClick={() => setActiveTab('withdraw')}
              style={{ 
                padding: '0.75rem 1rem', 
                borderBottom: activeTab === 'withdraw' ? '2px solid var(--color-primary)' : '2px solid transparent', 
                color: activeTab === 'withdraw' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'withdraw' ? 600 : 400,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Sacar
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              style={{ 
                padding: '0.75rem 1rem', 
                borderBottom: activeTab === 'documents' ? '2px solid var(--color-primary)' : '2px solid transparent', 
                color: activeTab === 'documents' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'documents' ? 600 : 400,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Documentos
            </button>
          </div>

          {activeTab === 'withdraw' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                padding: '2rem', 
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Saldo disponível</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>R$ 1.250,00</div>
                </div>
                <button style={{ 
                  backgroundColor: 'var(--color-success)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.75rem 2rem', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <DollarSign size={20} />
                  Solicitar Saque
                </button>
              </div>

              <div style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Histórico de Saques</h3>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                  Nenhum saque realizado ainda.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ 
              backgroundColor: 'var(--color-bg-secondary)', 
              padding: '2rem', 
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)',
              textAlign: 'center'
            }}>
              <FileText size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Documentos Fiscais</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Seus informes de rendimentos estarão disponíveis aqui.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreatorPayments;
