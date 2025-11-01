/**
 * Modal de criação de posts
 * Permite ao usuário criar posts na plataforma com opção de comunidade
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props do componente CreatePostModal
 */
interface CreatePostModalProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Callback chamado ao fechar o modal */
  onClose: () => void;
  /** Callback chamado ao publicar o post */
  onPublish?: (postData: PostFormData) => void;
}

/**
 * Dados do formulário de criação de post
 */
interface PostFormData {
  title: string;
  content: string;
  communityId?: string;
  image?: File | null;
}

/**
 * Comunidades disponíveis (dados mockados)
 * TODO: Buscar comunidades do usuário da API
 */
const mockCommunities = [
  { id: 'general', name: 'Geral', description: 'Discussões gerais' },
  { id: 'tech', name: 'Tecnologia', description: 'Tecnologia e inovação' },
  { id: 'art', name: 'Arte', description: 'Arte e criatividade' },
  { id: 'gaming', name: 'Gaming', description: 'Jogos e entretenimento' }
];

/**
 * Modal para criação de posts
 * Inclui título, conteúdo, seleção de comunidade e upload de imagem
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPublish
}) => {
  const { user } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    communityId: '',
    image: null
  });

  // Estados de interface
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  /**
   * Handler para mudanças nos inputs de texto
   */
  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handler para seleção de comunidade
   */
  const handleCommunitySelect = (communityId: string) => {
    setFormData(prev => ({ ...prev, communityId }));
    setShowCommunityDropdown(false);
  };

  /**
   * Handler para upload simulado de imagem
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  /**
   * Handler para remoção da imagem selecionada
   */
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    // Reset input file
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  /**
   * Handler para cancelar criação
   */
  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      communityId: '',
      image: null
    });
    onClose();
  };

  /**
   * Handler para publicação do post
   */
  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Preencha o título e conteúdo do post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onPublish) {
        onPublish(formData);
      }

      console.log('Post criado:', {
        ...formData,
        authorId: user?.id,
        publishedAt: new Date()
      });

      // Limpar formulário e fechar modal
      handleCancel();

    } catch (error) {
      console.error('Erro ao publicar post:', error);
      alert('Erro ao publicar post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Obtém nome da comunidade selecionada
   */
  const getSelectedCommunityName = () => {
    const community = mockCommunities.find(c => c.id === formData.communityId);
    return community ? community.name : 'Selecionar comunidade';
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
            Criar Novo Post
          </h2>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            margin: 0
          }}>
            Compartilhe suas ideias e pensamentos
          </p>
        </div>

        {/* Formulário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Título */}
          <div>
            <label
              htmlFor="post-title"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Título *
            </label>
            <input
              id="post-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título do seu post..."
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
              maxLength={200}
            />
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {formData.title.length}/200
            </div>
          </div>

          {/* Seleção de comunidade */}
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
              Comunidade (opcional)
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: formData.communityId ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--font-size-base)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <span>{getSelectedCommunityName()}</span>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  transition: 'transform var(--transition-fast)',
                  transform: showCommunityDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>

              {showCommunityDropdown && (
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
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div
                    onClick={() => handleCommunitySelect('')}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border-light)',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-sm)'
                    }}
                  >
                    Remover comunidade selecionada
                  </div>
                  {mockCommunities.map(community => (
                    <div
                      key={community.id}
                      onClick={() => handleCommunitySelect(community.id)}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        cursor: 'pointer',
                        borderBottom: community.id !== mockCommunities[mockCommunities.length - 1].id ? '1px solid var(--color-border-light)' : 'none',
                        backgroundColor: formData.communityId === community.id ? 'var(--color-bg-hover)' : 'var(--color-bg-primary)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {community.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {community.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <label
              htmlFor="post-content"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Conteúdo *
            </label>
            <textarea
              id="post-content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Conteúdo do seu post..."
              rows={6}
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
              maxLength={5000}
            />
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {formData.content.length}/5000
            </div>
          </div>

          {/* Upload de imagem */}
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
              Imagem (opcional)
            </label>
            {!formData.image ? (
              <label
                htmlFor="image-upload"
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
                  📸
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  Clique para adicionar uma imagem
                </div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)'
                }}>
                  PNG, JPG até 10MB
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {formData.image.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {(formData.image.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-lg)'
                  }}
                  title="Remover imagem"
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
            onClick={handlePublish}
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: isSubmitting || !formData.title.trim() || !formData.content.trim()
                ? 'var(--color-text-tertiary)'
                : 'linear-gradient(135deg, var(--color-primary) 0%, #FF6B75 100%)',
              color: 'var(--color-text-white)',
              cursor: (isSubmitting || !formData.title.trim() || !formData.content.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && formData.title.trim() && formData.content.trim()) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 66, 77, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && formData.title.trim() && formData.content.trim()) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Publicando...
              </>
            ) : (
              'Publicar Post'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;
