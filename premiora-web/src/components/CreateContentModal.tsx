/**
 * Modal de criação de conteúdo
 * Permite ao usuário escolher o tipo de conteúdo a ser criado
 */
import React from 'react';

/**
 * Tipos de conteúdo disponíveis para criação
 */
export type ContentType = 'post' | 'video' | 'community';

/**
 * Props do componente CreateContentModal
 */
interface CreateContentModalProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Callback chamado ao fechar o modal */
  onClose: () => void;
  /** Callback chamado ao selecionar um tipo de conteúdo */
  onSelectContentType: (type: ContentType) => void;
}

/**
 * Opções de criação de conteúdo disponíveis
 */
const contentOptions = [
  {
    type: 'post' as ContentType,
    title: 'Post',
    description: 'Compartilhe suas ideias e pensamentos',
    icon: '📝',
    color: 'var(--color-primary)'
  },
  {
    type: 'video' as ContentType,
    title: 'Vídeo',
    description: 'Publique conteúdo em vídeo',
    icon: '🎥',
    color: 'var(--color-success)'
  },
  {
    type: 'community' as ContentType,
    title: 'Comunidade',
    description: 'Crie uma nova comunidade',
    icon: '👥',
    color: 'var(--color-info)'
  }
];

/**
 * Modal principal para seleção do tipo de conteúdo a ser criado
 * Apresenta três opções: Post, Vídeo e Comunidade
 */
const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  onSelectContentType
}) => {
  /**
   * Handler para cancelar/fechar modal
   */
  const handleClose = () => {
    onClose();
  };

  /**
   * Handler para seleção de tipo de conteúdo
   */
  const handleSelectType = (type: ContentType) => {
    onSelectContentType(type);
    onClose();
  };

  // Não renderiza se o modal não estiver aberto
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 'var(--z-modal-backdrop)',
          animation: 'fadeIn var(--transition-fast)'
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 'var(--z-modal)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalSlideIn var(--transition-base)',
          border: '1px solid var(--color-border-light)'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            margin: 0,
            marginBottom: 'var(--space-2)'
          }}>
            Criar Novo Conteúdo
          </h2>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            margin: 0
          }}>
            Escolha o tipo de conteúdo que deseja criar
          </p>
        </div>

        {/* Opções de conteúdo */}
        <div style={{
          display: 'grid',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          {contentOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => handleSelectType(option.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-5)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                borderLeft: `4px solid ${option.color}`,
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.transform = 'translateX(2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{
                fontSize: 'var(--font-size-3xl)',
                width: '48px',
                textAlign: 'center'
              }}>
                {option.icon}
              </span>

              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  marginBottom: 'var(--space-1)'
                }}>
                  {option.title}
                </h3>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: 0
                }}>
                  {option.description}
                </p>
              </div>

              <span style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-tertiary)',
                transition: 'color var(--transition-fast)'
              }}>
                ›
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-3)'
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: '1px solid var(--color-border-medium)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              e.currentTarget.style.borderColor = 'var(--color-border-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              e.currentTarget.style.borderColor = 'var(--color-border-medium)';
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateContentModal;
