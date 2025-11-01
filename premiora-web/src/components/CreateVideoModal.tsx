/**
 * Modal de criação de vídeos
 * Permite ao usuário publicar vídeos na plataforma
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props do componente CreateVideoModal
 */
interface CreateVideoModalProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Callback chamado ao fechar o modal */
  onClose: () => void;
  /** Callback chamado ao publicar o vídeo */
  onPublish?: (videoData: VideoFormData) => void;
}

/**
 * Dados do formulário de criação de vídeo
 */
interface VideoFormData {
  title: string;
  description: string;
  communityId?: string;
  video?: File | null;
  thumbnail?: File | null;
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
 * Modal para criação de vídeos
 * Inclui título, descrição, seleção de comunidade e upload de vídeo/ thumbnail
 */
const CreateVideoModal: React.FC<CreateVideoModalProps> = ({
  isOpen,
  onClose,
  onPublish
}) => {
  const { user } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    communityId: '',
    video: null,
    thumbnail: null
  });

  // Estados de interface
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Handler para mudanças nos inputs de texto
   */
  const handleInputChange = (field: keyof VideoFormData, value: string) => {
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
   * Handler para upload simulado de vídeo
   */
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulação de progresso de upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 200);

      setFormData(prev => ({ ...prev, video: file }));

      // Após conclusão, definir progresso como 100%
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
      }, 2000);
    }
  };

  /**
   * Handler para upload de thumbnail
   */
  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, thumbnail: file }));
  };

  /**
   * Handler para remoção do vídeo selecionado
   */
  const handleRemoveVideo = () => {
    setFormData(prev => ({ ...prev, video: null }));
    setUploadProgress(0);
    // Reset input file
    const input = document.getElementById('video-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  /**
   * Handler para remoção da thumbnail selecionada
   */
  const handleRemoveThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }));
    // Reset input file
    const input = document.getElementById('thumbnail-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  /**
   * Handler para cancelar criação
   */
  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      communityId: '',
      video: null,
      thumbnail: null
    });
    setUploadProgress(0);
    onClose();
  };

  /**
   * Handler para publicação do vídeo
   */
  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.video) {
      alert('Preencha todos os campos obrigatórios e selecione um vídeo');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onPublish) {
        onPublish(formData);
      }

      console.log('Vídeo criado:', {
        ...formData,
        authorId: user?.id,
        publishedAt: new Date()
      });

      // Limpar formulário e fechar modal
      handleCancel();

    } catch (error) {
      console.error('Erro ao publicar vídeo:', error);
      alert('Erro ao publicar vídeo. Tente novamente.');
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
          maxWidth: '650px',
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
            Publicar Vídeo
          </h2>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            margin: 0
          }}>
            Compartilhe seus vídeos com a comunidade
          </p>
        </div>

        {/* Formulário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Título */}
          <div>
            <label
              htmlFor="video-title"
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
              id="video-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título do seu vídeo..."
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

          {/* Descrição */}
          <div>
            <label
              htmlFor="video-description"
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
              id="video-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva seu vídeo..."
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
              maxLength={2000}
            />
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-1)',
              textAlign: 'right'
            }}>
              {formData.description.length}/2000
            </div>
          </div>

          {/* Upload de vídeo */}
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
              Vídeo *
            </label>
            {!formData.video ? (
              <label
                htmlFor="video-upload"
                style={{
                  display: 'block',
                  padding: 'var(--space-6)',
                  border: '2px dashed var(--color-border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-success)';
                  e.currentTarget.style.backgroundColor = '#46A75815';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                }}
              >
                <div style={{
                  fontSize: 'var(--font-size-4xl)',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  🎬
                </div>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Clique para selecionar um vídeo
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  MP4, AVI, MOV até 2GB
                </div>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}>
                  <div style={{
                    fontSize: 'var(--font-size-2xl)',
                    color: 'var(--color-success)'
                  }}>
                    🎥
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {formData.video.name}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {formatFileSize(formData.video.size)}
                    </div>
                    {isUploading && (
                      <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: 'var(--color-border-light)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-success)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width var(--transition-fast)'
                        }} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-lg)'
                    }}
                    title="Remover vídeo"
                  >
                    ✕
                  </button>
                </div>

                {isUploading && (
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-success)',
                    textAlign: 'center'
                  }}>
                    Processando vídeo... {Math.round(uploadProgress)}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload de thumbnail */}
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
              Thumbnail (opcional)
            </label>
            {!formData.thumbnail ? (
              <label
                htmlFor="thumbnail-upload"
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
                  Adicionar thumbnail
                </div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)'
                }}>
                  PNG, JPG até 5MB • 1280x720 recomendado
                </div>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
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
                  src={URL.createObjectURL(formData.thumbnail)}
                  alt="Thumbnail preview"
                  style={{
                    width: '80px',
                    height: '45px',
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
                    {formData.thumbnail.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {formatFileSize(formData.thumbnail.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-lg)'
                  }}
                  title="Remover thumbnail"
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
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.video || isUploading}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.video || isUploading
                ? 'var(--color-text-tertiary)'
                : 'linear-gradient(135deg, var(--color-success) 0%, #5BBF65 100%)',
              color: 'var(--color-text-white)',
              cursor: (isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.video || isUploading) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && formData.title.trim() && formData.description.trim() && formData.video && !isUploading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(70, 167, 88, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && formData.title.trim() && formData.description.trim() && formData.video && !isUploading) {
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
              'Publicar Vídeo'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateVideoModal;
