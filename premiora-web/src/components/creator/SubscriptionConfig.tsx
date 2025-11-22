
import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Edit2, Sparkles } from 'lucide-react';
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

  const [error, setError] = useState<string | null>(null);

  const handleSaveTier = () => {
    if (!editingTier) return;
    setError(null);

    if (!editingTier.name.trim()) {
      setError('O nome do nível é obrigatório');
      return;
    }

    if (editingTier.price < 0) {
      setError('O preço não pode ser negativo');
      return;
    }

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
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
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
                aria-label="Adicionar novo benefício"
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
                    aria-label="Remover benefício"
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
      {tiers.length === 0 ? (
        <div className="empty-tiers-state">
          <div className="empty-icon-wrapper">
            <Sparkles size={48} className="text-yellow-500" />
          </div>
          <h3>Comece a Monetizar</h3>
          <p>Crie níveis de assinatura para oferecer benefícios exclusivos aos seus seguidores.</p>
          <button onClick={handleAddTier} className="btn-primary-large" aria-label="Criar primeiro nível de assinatura">
            <Plus size={20} />
            Criar Primeiro Nível
          </button>
        </div>
      ) : (
        <div className="subscription-grid">
          {tiers.map(tier => (
            <div key={tier.id} className="tier-card" style={{ borderColor: tier.color }}>
              <div className="tier-header" style={{ backgroundColor: tier.color }}>
                <h4 className="tier-name">{tier.name}</h4>
                <div className="tier-price">
                  <span className="currency">R$</span>
                  <span className="amount">{tier.price.toFixed(2)}</span>
                  <span className="period">/mês</span>
                </div>
              </div>
              
              <div className="tier-body">
                <p className="tier-description">{tier.description || 'Sem descrição'}</p>
                
                <div className="tier-benefits">
                  <h5>Benefícios:</h5>
                  {tier.benefits.length > 0 ? (
                    <ul>
                      {tier.benefits.map(benefit => (
                        <li key={benefit.id}>
                          <Check size={14} />
                          <span>{benefit.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-benefits">Nenhum benefício adicionado</p>
                  )}
                </div>
                
                <div className="tier-actions">
                  <button onClick={() => setEditingTier(tier)} className="btn-edit" aria-label={`Editar nível ${tier.name}`}>
                    <Edit2 size={16} /> Editar
                  </button>
                  <button onClick={() => handleDeleteTier(tier.id)} className="btn-delete" aria-label={`Excluir nível ${tier.name}`}>
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={handleAddTier} className="add-tier-card" aria-label="Adicionar novo nível de assinatura">
            <div className="add-icon-wrapper">
              <Plus size={24} />
            </div>
            <span className="add-text">Adicionar Nível</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionConfig;
