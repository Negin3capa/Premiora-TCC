/**
 * Modal de criação de comunidades
 * Permite ao usuário criar uma nova comunidade na plataforma
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommunity, getCommunityByName } from '../../utils/communityUtils';

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
 * Dados do formulário de criação de comunidade
 */
interface CommunityFormData {
  name: string;
  displayName: string;
  description: string;
  banner?: File | null;
  avatar?: File | null;
  isPrivate: boolean;
  tags: string[];
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

  // Estado do formulário
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    displayName: '',
    description: '',
    banner: null,
    avatar: null,
    isPrivate: false,
    tags: []
  });

  // Estados de interface
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  /**
   * Handler para mudanças nos inputs de texto
   */
  const handleInputChange = (field: keyof CommunityFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Verificar disponibilidade do nome quando for alterado
    if (field === 'name' && typeof value === 'string') {
      checkNameAvailability(value);
    }
  };

  /**
   * Handler para seleção de tags
   */
  const handleTagSelect = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags.slice(0, 4), tag] // Máximo 5 tags
    }));
  };

  /**
   * Handler para upload de banner
   */
  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, banner: file }));
  };

  /**
   * Handler para upload de avatar
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, avatar: file }));
  };

  /**
   * Handler para remoção do banner
   */
  const handleRemoveBanner = () => {
    setFormData(prev => ({ ...prev, banner: null }));
    const input = document.getElementById('banner-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  /**
   * Handler para remoção do avatar
   */
  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  /**
   * Verifica se o nome da comunidade está disponível
   */
  const checkNameAvailability = async (name: string) => {
    if (name.length < 3) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      // Verificar se comunidade já existe
      const existingCommunity = await getCommunityByName(name);
      setNameAvailable(!existingCommunity);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do nome:', error);
      setNameAvailable(false); // Em caso de erro, assumir indisponível
    } finally {
      setCheckingName(false);
    }
  };

  /**
   * Handler para cancelar criação
   */
  const handleCancel = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      banner: null,
      avatar: null,
      isPrivate: false,
      tags: []
    });
    setNameAvailable(null);
    onClose();
  };

  /**
   * Handler para criação da comunidade
   */
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.displayName.trim() || !formData.description.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!nameAvailable) {
      alert('Nome da comunidade indisponível');
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

  /**
   * Formata tamanho do arquivo
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

          {/* Nome da comunidade */}
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
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: tecnologia, arte, gaming..."
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4) var(--space-3) 2.5rem',
                  border: `1px solid ${
                    nameAvailable === false ? 'var(--color-error)' :
                    nameAvailable === true ? 'var(--color-success)' :
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
                  if (nameAvailable !== false) {
                    e.target.style.borderColor = 'var(--color-primary)';
                  }
                }}
                onBlur={(e) => e.target.style.borderColor =
                  nameAvailable === false ? 'var(--color-error)' :
                  nameAvailable === true ? 'var(--color-success)' :
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
                  {checkingName && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                      ⏳
                    </span>
                  )}
                  {nameAvailable === true && (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                      ✓ Disponível
                    </span>
                  )}
                  {nameAvailable === false && (
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
          </div>

          {/* Nome de exibição */}
          <div>
            <label
              htmlFor="community-display-name"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Nome de Exibição *
            </label>
            <input
              id="community-display-name"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Nome completo da comunidade"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-size-base)',
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
              maxLength={100}
            />
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {formData.displayName.length}/100
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="community-description"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Descrição *
            </label>
            <textarea
              id="community-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o propósito da sua comunidade..."
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-size-base)',
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color var(--transition-fast)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
              maxLength={500}
            />
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {formData.description.length}/500
            </div>
          </div>

          {/* Seleção de tags */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Tags (até 5)
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: formData.tags.length ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--font-size-base)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                {formData.tags.length > 0
                  ? `${formData.tags.length} tag${formData.tags.length > 1 ? 's' : ''} selecionada${formData.tags.length > 1 ? 's' : ''}`
                  : 'Selecionar tags...'
                }
              </button>

              {showTagDropdown && (
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
                      const isSelected = formData.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          style={{
                            padding: 'var(--space-2) var(--space-3)',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-medium)'}`,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                            color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            fontSize: 'var(--font-size-sm)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            opacity: !isSelected && formData.tags.length >= 5 ? 0.5 : 1
                          }}
                          disabled={!isSelected && formData.tags.length >= 5}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {formData.tags.length > 0 && (
              <div style={{
                marginTop: 'var(--space-2)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-2)'
              }}>
                {formData.tags.map(tag => (
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
                      onClick={() => handleTagSelect(tag)}
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
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacidade */}
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
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
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
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Banner da Comunidade (opcional)
            </label>
            {!formData.banner ? (
              <label
                htmlFor="banner-upload"
                style={{
                  display: 'block',
                  padding: 'var(--space-4)',
                  border: '2px dashed var(--color-border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                }}
              >
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  🖼️
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Adicionar banner
                </div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)'
                }}>
                  PNG, JPG até 8MB • 1920x300 recomendado
                </div>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}>
                <img
                  src={URL.createObjectURL(formData.banner)}
                  alt="Banner preview"
                  style={{
                    width: '120px',
                    height: '30px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {formData.banner.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {formatFileSize(formData.banner.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-lg)'
                  }}
                  title="Remover banner"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Upload de avatar */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Avatar da Comunidade (opcional)
            </label>
            {!formData.avatar ? (
              <label
                htmlFor="avatar-upload"
                style={{
                  display: 'block',
                  padding: 'var(--space-4)',
                  border: '2px dashed var(--color-border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                }}
              >
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  👤
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Adicionar avatar
                </div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)'
                }}>
                  PNG, JPG até 2MB • 256x256 recomendado
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}>
                <img
                  src={URL.createObjectURL(formData.avatar)}
                  alt="Avatar preview"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {formData.avatar.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {formatFileSize(formData.avatar.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-lg)'
                  }}
                  title="Remover avatar"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
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
            disabled={isSubmitting || !formData.name.trim() || !formData.displayName.trim() || !formData.description.trim() || !nameAvailable}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: isSubmitting || !formData.name.trim() || !formData.displayName.trim() || !formData.description.trim() || !nameAvailable
                ? 'var(--color-text-tertiary)'
                : 'linear-gradient(135deg, var(--color-primary) 0%, #FF6B75 100%)',
              color: 'var(--color-text-white)',
              cursor: (isSubmitting || !formData.name.trim() || !formData.displayName.trim() || !formData.description.trim() || !nameAvailable) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && formData.name.trim() && formData.displayName.trim() && formData.description.trim() && nameAvailable) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 66, 77, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && formData.name.trim() && formData.displayName.trim() && formData.description.trim() && nameAvailable) {
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
