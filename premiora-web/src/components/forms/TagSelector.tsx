/**
 * Componente para seleção de tags
 * Permite selecionar múltiplas tags de uma lista predefinida
 */
import React, { useState } from 'react';

/**
 * Props do componente TagSelector
 */
interface TagSelectorProps {
  /** Tags disponíveis para seleção */
  availableTags: string[];
  /** Tags atualmente selecionadas */
  selectedTags: string[];
  /** Máximo de tags permitidas */
  maxTags?: number;
  /** Handler para mudança de seleção */
  onChange: (tags: string[]) => void;
  /** Rótulo do campo */
  label?: string;
  /** Texto de ajuda */
  helpText?: string;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente TagSelector - Seletor de tags reutilizável
 */
export const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  maxTags = 5,
  onChange,
  label = 'Tags',
  helpText,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * Handler para alternar seleção de tag
   */
  const handleTagToggle = (tag: string) => {
    let newSelectedTags: string[];

    if (selectedTags.includes(tag)) {
      // Remover tag
      newSelectedTags = selectedTags.filter(t => t !== tag);
    } else {
      // Adicionar tag (respeitando limite)
      if (selectedTags.length >= maxTags) {
        return; // Não adicionar se já atingiu o limite
      }
      newSelectedTags = [...selectedTags, tag];
    }

    onChange(newSelectedTags);
  };

  /**
   * Handler para remover tag
   */
  const handleTagRemove = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(newSelectedTags);
  };

  return (
    <div className={className} style={{ marginBottom: 'var(--space-4)' }}>
      <label
        style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)'
        }}
      >
        {label} (até {maxTags})
      </label>

      {/* Dropdown trigger */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            color: selectedTags.length ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-base)',
            textAlign: 'left',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-medium)';
          }}
        >
          <span>
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selecionada${selectedTags.length > 1 ? 's' : ''}`
              : 'Selecionar tags...'
            }
          </span>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)'
          }}>
            ▼
          </span>
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop para fechar dropdown */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999
              }}
              onClick={() => setIsDropdownOpen(false)}
            />

            <div style={{
              position: 'absolute',
              top: 'calc(100% + var(--space-1))',
              left: 0,
              right: 0,
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              maxHeight: '250px',
              overflowY: 'auto',
              padding: 'var(--space-2)'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-2)'
              }}>
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  const isDisabled = !isSelected && selectedTags.length >= maxTags;

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      disabled={isDisabled}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-medium)'}`,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all var(--transition-fast)',
                        opacity: isDisabled ? 0.5 : 1
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tags selecionadas */}
      {selectedTags.length > 0 && (
        <div style={{
          marginTop: 'var(--space-2)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)'
        }}>
          {selectedTags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  padding: 0,
                  width: '12px',
                  height: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Remover tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Texto de ajuda */}
      {helpText && (
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--space-1)'
        }}>
          {helpText}
        </div>
      )}
    </div>
  );
};
