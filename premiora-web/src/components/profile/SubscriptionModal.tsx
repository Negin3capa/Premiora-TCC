import React from 'react';
import { X, Check, Crown } from 'lucide-react';
import type { SubscriptionTier } from '../../types/creator';
import '../../styles/SubscriptionModal.css';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: SubscriptionTier[];
  creatorName: string;
  onSelectTier: (tierId: string) => void;
  isLoading?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  tiers,
  creatorName,
  onSelectTier,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const sortedTiers = [...tiers].sort((a, b) => a.price - b.price);

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div className="subscription-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="modal-crown">
            <Crown size={32} />
          </div>
          <h2 className="modal-title">Torne-se um Membro</h2>
          <p className="modal-subtitle">
            Apoie {creatorName} e tenha acesso a benefícios exclusivos
          </p>
        </div>

        <div className="tiers-container">
          {sortedTiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`tier-card ${index === sortedTiers.length - 1 ? 'featured' : ''}`}
              style={{
                borderColor: tier.color,
                '--tier-color': tier.color
              } as React.CSSProperties}
            >
              {index === sortedTiers.length - 1 && (
                <div className="featured-badge">Mais Popular</div>
              )}

              <div className="tier-header" style={{ backgroundColor: tier.color }}>
                <h3 className="tier-name">{tier.name}</h3>
                <div className="tier-price-container">
                  <span className="tier-currency">R$</span>
                  <span className="tier-price">{tier.price.toFixed(2)}</span>
                  <span className="tier-period">/mês</span>
                </div>
              </div>

              <div className="tier-body">
                <p className="tier-description">{tier.description}</p>

                <div className="tier-benefits-list">
                  <h4 className="benefits-title">Benefícios inclusos:</h4>
                  {tier.benefits.map((benefit) => (
                    <div key={benefit.id} className="benefit-item">
                      <Check size={18} className="benefit-check" />
                      <span className="benefit-text">{benefit.description}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="select-tier-btn"
                  onClick={() => onSelectTier(tier.id)}
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: tier.color, 
                    opacity: isLoading ? 0.7 : 1, 
                    cursor: isLoading ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {isLoading ? 'Processando...' : `Escolher ${tier.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            Cancele a qualquer momento • Renovação automática mensalmente
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
