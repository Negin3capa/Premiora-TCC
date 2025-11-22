import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import type { SubscriptionTier, SubscriptionBenefit } from '../../types/creator';
import '../../styles/SubscriptionConfig.css';

interface SubscriptionConfigProps {
  tiers: SubscriptionTier[];
  onChange: (tiers: SubscriptionTier[]) => void;
}

const SubscriptionConfig: React.FC<SubscriptionConfigProps> = ({ tiers, onChange }) => {
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTier = () => {
    const newTier: SubscriptionTier = {
      id: `temp-${crypto.randomUUID()}`, // Use temp prefix to identify new tiers
      name: '',
      price: 0,
      currency: 'BRL',
      description: '',
      benefits: [],
      color: '#3b82f6'
    };
    setEditingTier(newTier);
    setIsAdding(true);
  };

  const handleSaveTier = () => {
    if (!editingTier) return;

    if (isAdding) {
      onChange([...tiers, editingTier]);
    } else {
      onChange(tiers.map(t => t.id === editingTier.id ? editingTier : t));
    }
    setEditingTier(null);
    setIsAdding(false);
  };

  const handleDeleteTier = (id: string) => {
    onChange(tiers.filter(t => t.id !== id));
  };

  const handleAddBenefit = () => {
    if (!editingTier) return;
    const newBenefit: SubscriptionBenefit = {
      id: `temp-${crypto.randomUUID()}`,
      description: ''
    };
    setEditingTier({
      ...editingTier,
      benefits: [...editingTier.benefits, newBenefit]
    });
  };

  const handleUpdateBenefit = (id: string, description: string) => {
    if (!editingTier) return;
    setEditingTier({
      ...editingTier,
      benefits: editingTier.benefits.map(b => b.id === id ? { ...b, description } : b)
    });
  };

  const handleRemoveBenefit = (id: string) => {
    if (!editingTier) return;
    setEditingTier({
      ...editingTier,
      benefits: editingTier.benefits.filter(b => b.id !== id)
    });
  };

  if (editingTier) {
    return (
      <div className="edit-form-container">
        <h3 className="form-title">
          {isAdding ? 'Novo Nível de Assinatura' : 'Editar Nível'}
        </h3>
        
        <div className="form-content">
          <div className="form-group">
            <label className="form-label">Nome do Nível</label>
            <input
              type="text"
              value={editingTier.name}
              onChange={e => setEditingTier({ ...editingTier, name: e.target.value })}
              className="form-input"
              placeholder="Ex: Fã Bronze"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 form-group">
            <div>
              <label className="form-label">Preço Mensal</label>
              <input
                type="number"
                value={editingTier.price}
                onChange={e => setEditingTier({ ...editingTier, price: Number(e.target.value) })}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="form-label">Cor do Card</label>
              <input
                type="color"
                value={editingTier.color}
                onChange={e => setEditingTier({ ...editingTier, color: e.target.value })}
                className="color-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              value={editingTier.description}
              onChange={e => setEditingTier({ ...editingTier, description: e.target.value })}
              className="form-textarea"
              placeholder="Descreva o que este nível oferece..."
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Benefícios</label>
              <button
                onClick={handleAddBenefit}
                className="add-benefit-btn"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="benefits-section">
              {editingTier.benefits.map(benefit => (
                <div key={benefit.id} className="benefit-row">
                  <input
                    type="text"
                    value={benefit.description}
                    onChange={e => handleUpdateBenefit(benefit.id, e.target.value)}
                    className="form-input"
                    placeholder="Descrição do benefício"
                  />
                  <button
                    onClick={() => handleRemoveBenefit(benefit.id)}
                    className="remove-benefit-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={() => { setEditingTier(null); setIsAdding(false); }}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveTier}
              disabled={!editingTier.name || editingTier.price <= 0}
              className="btn-save"
            >
              <Check size={18} /> Salvar Nível
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-config">
      <div className="subscription-grid">
        {tiers.map(tier => (
          <div 
            key={tier.id} 
            className="tier-card"
            style={{ borderColor: tier.color }}
          >
            <div className="tier-color-strip" style={{ backgroundColor: tier.color }} />
            
            <div className="tier-actions">
              <button
                onClick={() => setEditingTier(tier)}
                className="action-btn edit"
                title="Editar"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDeleteTier(tier.id)}
                className="action-btn delete"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <h4 className="tier-name">{tier.name}</h4>
            <div className="tier-price">
              R$ {tier.price.toFixed(2)}<span className="tier-period">/mês</span>
            </div>
            <p className="tier-description">{tier.description}</p>
            
            <div className="tier-benefits">
              {tier.benefits.slice(0, 3).map(benefit => (
                <div key={benefit.id} className="benefit-item">
                  <Check size={14} className="benefit-icon" />
                  <span className="truncate">{benefit.description}</span>
                </div>
              ))}
              {tier.benefits.length > 3 && (
                <div className="more-benefits">
                  + {tier.benefits.length - 3} benefícios
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={handleAddTier}
          className="add-tier-card"
        >
          <div className="add-icon-wrapper">
            <Plus size={24} />
          </div>
          <span className="add-text">Adicionar Nível</span>
        </button>
      </div>
    </div>
  );
};

export default SubscriptionConfig;
