/**
 * Componente de regras da comunidade em modo de edição
 * Permite edição interativa das regras da comunidade
 */
import React, { useState } from 'react';
import { Edit3, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Interface para uma regra da comunidade
 */
interface CommunityRule {
  id: string;
  title: string;
  description: string;
  order: number;
}

/**
 * Props do componente CommunityRulesEditable
 */
interface CommunityRulesEditableProps {
  /** Regras da comunidade */
  rules: CommunityRule[];
  /** Callback para atualizar regras */
  onUpdateRules: (rules: CommunityRule[]) => void;
  /** Indica se está salvando */
  isSaving?: boolean;
}

/**
 * Componente para edição das regras da comunidade
 */
export const CommunityRulesEditable: React.FC<CommunityRulesEditableProps> = ({
  rules,
  onUpdateRules,
  isSaving = false
}) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [tempRule, setTempRule] = useState<{ title: string; description: string }>({
    title: '',
    description: ''
  });
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  /**
   * Handler para iniciar edição de uma regra
   */
  const handleStartEditing = (rule: CommunityRule) => {
    setEditingRuleId(rule.id);
    setTempRule({
      title: rule.title,
      description: rule.description
    });
  };

  /**
   * Handler para confirmar edição de uma regra
   */
  const handleConfirmEdit = () => {
    if (!editingRuleId) return;

    const updatedRules = rules.map(rule =>
      rule.id === editingRuleId
        ? { ...rule, ...tempRule }
        : rule
    );

    onUpdateRules(updatedRules);
    setEditingRuleId(null);
    setTempRule({ title: '', description: '' });
  };

  /**
   * Handler para cancelar edição de uma regra
   */
  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setTempRule({ title: '', description: '' });
  };

  /**
   * Handler para adicionar uma nova regra
   */
  const handleAddRule = () => {
    const newRule: CommunityRule = {
      id: `rule-${Date.now()}`,
      title: 'Nova regra',
      description: 'Descrição da nova regra',
      order: rules.length + 1
    };

    const updatedRules = [...rules, newRule];
    onUpdateRules(updatedRules);
    handleStartEditing(newRule);
  };

  /**
   * Handler para remover uma regra
   */
  const handleRemoveRule = (ruleId: string) => {
    const updatedRules = rules
      .filter(rule => rule.id !== ruleId)
      .map((rule, index) => ({ ...rule, order: index + 1 }));

    onUpdateRules(updatedRules);
  };

  /**
   * Handler para mover uma regra para cima
   */
  const handleMoveRuleUp = (ruleId: string) => {
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex <= 0) return;

    const updatedRules = [...rules];
    [updatedRules[ruleIndex], updatedRules[ruleIndex - 1]] =
      [updatedRules[ruleIndex - 1], updatedRules[ruleIndex]];

    // Reordenar
    updatedRules.forEach((rule, index) => {
      rule.order = index + 1;
    });

    onUpdateRules(updatedRules);
  };

  /**
   * Handler para mover uma regra para baixo
   */
  const handleMoveRuleDown = (ruleId: string) => {
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex >= rules.length - 1) return;

    const updatedRules = [...rules];
    [updatedRules[ruleIndex], updatedRules[ruleIndex + 1]] =
      [updatedRules[ruleIndex + 1], updatedRules[ruleIndex]];

    // Reordenar
    updatedRules.forEach((rule, index) => {
      rule.order = index + 1;
    });

    onUpdateRules(updatedRules);
  };

  /**
   * Handler para alternar expansão de uma regra
   */
  const handleToggleExpanded = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  /**
   * Regras padrão para quando não há regras definidas
   */
  const defaultRules: CommunityRule[] = [
    {
      id: 'default-1',
      title: 'Seja respeitoso',
      description: 'Trate todos os membros com respeito. Não toleramos assédio, discriminação ou conteúdo ofensivo.',
      order: 1
    },
    {
      id: 'default-2',
      title: 'Conteúdo relevante',
      description: 'Mantenha as discussões relevantes ao tema da comunidade. Posts off-topic podem ser removidos.',
      order: 2
    },
    {
      id: 'default-3',
      title: 'Sem spam',
      description: 'Evite postar repetidamente ou promover conteúdo comercial sem relevância.',
      order: 3
    }
  ];

  // Usar regras padrão se não houver regras definidas
  const displayRules = rules.length > 0 ? rules : defaultRules;
  const hasCustomRules = rules.length > 0;

  return (
    <div className="sidebar-section rules-section">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <h4 className="sidebar-subtitle">Regras da comunidade</h4>
        {!isSaving && (
          <button
            type="button"
            onClick={handleAddRule}
            style={{
              background: 'none',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            title="Adicionar regra"
          >
            <Plus size={12} />
            Adicionar
          </button>
        )}
      </div>

      {!hasCustomRules && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)'
        }}>
          <em>Estas são as regras padrão. Clique em "Adicionar" para personalizar as regras da sua comunidade.</em>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {displayRules.map((rule) => (
          <div key={rule.id} className="rule-item">
            {editingRuleId === rule.id ? (
              /* Modo de edição */
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    Título da regra
                  </label>
                  <input
                    type="text"
                    value={tempRule.title}
                    onChange={(e) => setTempRule(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.9rem'
                    }}
                    placeholder="Título da regra"
                    maxLength={100}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    Descrição da regra
                  </label>
                  <textarea
                    value={tempRule.description}
                    onChange={(e) => setTempRule(prev => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    placeholder="Descrição detalhada da regra"
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={handleConfirmEdit}
                    disabled={isSaving}
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Save size={14} />
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--color-text-secondary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Modo de visualização */
              <div>
                <div
                  className="rule-header"
                  onClick={() => handleToggleExpanded(rule.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="rule-number">{rule.order}</span>
                  <span className="rule-title">{rule.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!isSaving && hasCustomRules && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMoveRuleUp(rule.id)}
                          disabled={rule.order === 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-tertiary)',
                            cursor: rule.order === 1 ? 'not-allowed' : 'pointer',
                            padding: '0.25rem',
                            opacity: rule.order === 1 ? 0.3 : 1
                          }}
                          title="Mover para cima"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRuleDown(rule.id)}
                          disabled={rule.order === displayRules.length}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-tertiary)',
                            cursor: rule.order === displayRules.length ? 'not-allowed' : 'pointer',
                            padding: '0.25rem',
                            opacity: rule.order === displayRules.length ? 0.3 : 1
                          }}
                          title="Mover para baixo"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditing(rule)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-tertiary)',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          title="Editar regra"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(rule.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-error)',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          title="Remover regra"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                    {expandedRules.has(rule.id) ? (
                      <ChevronUp size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <ChevronDown size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    )}
                  </div>
                </div>

                {expandedRules.has(rule.id) && (
                  <div className="rule-content">
                    {rule.description}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {displayRules.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--color-text-tertiary)',
          fontStyle: 'italic'
        }}>
          Nenhuma regra definida ainda.
        </div>
      )}
    </div>
  );
};
