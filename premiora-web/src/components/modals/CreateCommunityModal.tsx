/**
 * Modal de criação de comunidades
 * Permite ao usuário criar uma nova comunidade na plataforma
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommunity } from '../../utils/communityUtils';
import { useCommunityForm } from '../../hooks/useCommunityForm';
import type { CommunityFormData } from '../../hooks/useCommunityForm';
import { FormField, TagSelector, FileUpload } from '../forms';

/**
 * Props do componente CreateCommunityModal
 */
interface CreateCommunityModalProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Callback chamado ao fechar o modal */
  onClose: () => void;
  /** Callback chamado ao criar a comunidade */
  onCreate?: (communityData: CommunityFormData) => void;
}

/**
 * Tags disponíveis para comunidades
 */
const availableTags = [
  'Tecnologia', 'Arte', 'Gaming', 'Música', 'Esporte', 'Culinária',
  'Fotografia', 'Ciência', 'Educação', 'Saúde', 'Anime', 'Filmes',
  'Livros', 'Viagens', 'Negócios', 'Política', 'Religião', 'Outros'
];

/**
 * Modal para criação de comunidades
 * Inclui nome, descrição, banner, avatar e configurações
 */
const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook personalizado para gerenciar o formulário
  const {
    formData,
    validation,
    updateField,
    toggleTag,
    removeBanner,
    removeAvatar,
    resetForm
  } = useCommunityForm();

  /**
   * Handler para cancelar criação
   */
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  /**
   * Handler para criação da comunidade
   */
  const handleCreate = async () => {
    if (!validation.isValid) {
      alert('Preencha todos os campos obrigatórios corretamente');
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar comunidade usando a API real
      const community = await createCommunity({
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        bannerFile: formData.banner,
        avatarFile: formData.avatar,
        isPrivate: formData.isPrivate
      });

      if (community) {
        // Chamar callback se fornecido
        if (onCreate) {
          onCreate(formData);
        }

        // Limpar formulário e fechar modal
        handleCancel();

        // Redirecionar para a página da comunidade recém-criada
        navigate(`/r/${community.name}`);
      } else {
        throw new Error('Falha ao criar comunidade');
      }

    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      alert('Erro ao criar comunidade. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
        onClick={onClose}
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
          padding: 'var(--space-6)',
          maxWidth: '600px',
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
            Criar Comunidade
          </h2>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            margin: 0
          }}>
            Dê vida a uma nova comunidade
          </p>
        </div>

        {/* Formulário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Campo personalizado para nome da comunidade com validação de disponibilidade */}
          <div>
            <label
              htmlFor="community-name"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Nome da Comunidade *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="community-name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ex: tecnologia, arte, gaming..."
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4) var(--space-3) 2.5rem',
                  border: `1px solid ${
                    validation.nameAvailable === false ? 'var(--color-error)' :
                    validation.nameAvailable === true ? 'var(--color-success)' :
                    'var(--color-border-medium)'
                  }`,
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-base)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => {
                  if (validation.nameAvailable !== false) {
                    e.target.style.borderColor = 'var(--color-primary)';
                  }
                }}
                onBlur={(e) => e.target.style.borderColor =
                  validation.nameAvailable === false ? 'var(--color-error)' :
                  validation.nameAvailable === true ? 'var(--color-success)' :
                  'var(--color-border-medium)'
                }
                maxLength={50}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                r/
              </div>
              {formData.name && (
                <div style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}>
                  {validation.checkingName && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                      ⏳
                    </span>
                  )}
                  {validation.nameAvailable === true && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                      ✓ Disponível
                    </span>
                  )}
                  {validation.nameAvailable === false && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>
                      ✗ Indisponível
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {formData.name.length}/50
            </div>
            {validation.errors.name && (
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-error)',
                marginTop: 'var(--space-1)'
              }}>
                {validation.errors.name}
              </div>
            )}
          </div>

          {/* Campo de nome de exibição */}
          <FormField
            id="community-display-name"
            label="Nome de Exibição"
            type="text"
            value={formData.displayName}
            onChange={(value) => updateField('displayName', value)}
            placeholder="Nome completo da comunidade"
            maxLength={100}
            error={validation.errors.displayName}
            required
          />

          {/* Campo de descrição */}
          <FormField
            id="community-description"
            label="Descrição"
            type="textarea"
            value={formData.description}
            onChange={(value) => updateField('description', value)}
            placeholder="Descreva o propósito da sua comunidade..."
            maxLength={500}
            error={validation.errors.description}
            required
          />

          {/* Seletor de tags */}
          <TagSelector
            availableTags={availableTags}
            selectedTags={formData.tags}
            onChange={(tags) => {
              // Comparar tags atuais com novas para determinar qual foi alterada
              const addedTag = tags.find(tag => !formData.tags.includes(tag));
              const removedTag = formData.tags.find(tag => !tags.includes(tag));

              if (addedTag) {
                toggleTag(addedTag);
              } else if (removedTag) {
                toggleTag(removedTag);
              }
            }}
            maxTags={5}
          />

          {/* Checkbox de privacidade */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => updateField('isPrivate', e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-primary)'
                }}
              />
              Comunidade privada
            </label>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: 'var(--space-1) 0 0 0',
              marginLeft: '1.75rem'
            }}>
              Apenas membros aprovados podem participar e visualizar conteúdo
            </p>
          </div>

          {/* Upload de banner */}
          <FileUpload
            id="banner-upload"
            label="Banner da Comunidade (opcional)"
            file={formData.banner || null}
            accept="image/*"
            maxSize={8 * 1024 * 1024} // 8MB
            recommendedDimensions="1920x300 recomendado"
            onChange={(file) => updateField('banner', file)}
            onRemove={removeBanner}
          />

          {/* Upload de avatar */}
          <FileUpload
            id="avatar-upload"
            label="Avatar da Comunidade (opcional)"
            file={formData.avatar || null}
            accept="image/*"
            maxSize={2 * 1024 * 1024} // 2MB
            recommendedDimensions="256x256 recomendado"
            onChange={(file) => updateField('avatar', file)}
            onRemove={removeAvatar}
          />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-light)'
        }}>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: '1px solid var(--color-border-medium)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              opacity: isSubmitting ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.borderColor = 'var(--color-border-dark)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                e.currentTarget.style.borderColor = 'var(--color-border-medium)';
              }
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleCreate}
            disabled={isSubmitting || !validation.isValid}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: isSubmitting || !validation.isValid
                ? 'var(--color-text-tertiary)'
                : 'linear-gradient(135deg, var(--color-primary) 0%, #FF6B75 100%)',
              color: 'var(--color-text-white)',
              cursor: (isSubmitting || !validation.isValid) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && validation.isValid) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 66, 77, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && validation.isValid) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Criando...
              </>
            ) : (
              'Criar Comunidade'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateCommunityModal;
