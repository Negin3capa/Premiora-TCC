/**
 * Componente do banner da comunidade em modo de edição
 * Permite edição interativa de avatar, banner, nome e descrição da comunidade
 */
import React, { useState, useRef } from 'react';
import { Camera, Edit3, X, Save } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';

/**
 * Props do componente CommunityBannerEditable
 */
interface CommunityBannerEditableProps {
  /** Dados da comunidade sendo editados */
  community: {
    name: string;
    displayName: string;
    description: string;
    bannerUrl?: string;
    avatarUrl?: string;
  };
  /** Indica se está fazendo upload */
  isUploading: boolean;
  /** Callback para atualizar nome */
  onUpdateName: (name: string) => void;
  /** Callback para atualizar nome de exibição */
  onUpdateDisplayName: (displayName: string) => void;
  /** Callback para atualizar descrição */
  onUpdateDescription: (description: string) => void;
  /** Callback para atualizar avatar */
  onUpdateAvatar: (file: File) => void;
  /** Callback para atualizar banner */
  onUpdateBanner: (file: File) => void;

  /** Callback para salvar mudanças */
  onSave: () => void;
  /** Callback para cancelar mudanças */
  onCancel: () => void;
  /** Indica se há mudanças pendentes */
  hasChanges: boolean;
  /** Indica se está salvando */
  isSaving: boolean;
}

/**
 * Componente interativo para edição do banner da comunidade
 */
export const CommunityBannerEditable: React.FC<CommunityBannerEditableProps> = ({
  community,
  isUploading,
  onUpdateName,
  onUpdateDisplayName,
  onUpdateDescription,
  onUpdateAvatar,
  onUpdateBanner,
  onSave,
  onCancel,
  hasChanges,
  isSaving
}) => {
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean;
    image: string | null;
    aspect: number;
    title: string;
    onComplete: (croppedImage: string) => void;
  }>({
    isOpen: false,
    image: null,
    aspect: 1,
    title: '',
    onComplete: () => {}
  });

  const [editingField, setEditingField] = useState<'name' | 'displayName' | 'description' | null>(null);
  const [tempValues, setTempValues] = useState<{
    name: string;
    displayName: string;
    description: string;
  }>({
    name: '',
    displayName: '',
    description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handler para iniciar edição de campo de texto
   */
  const handleStartEditing = (field: 'name' | 'displayName' | 'description') => {
    setEditingField(field);
    setTempValues({
      name: community.name,
      displayName: community.displayName,
      description: community.description
    });
  };

  /**
   * Handler para confirmar edição de campo de texto
   */
  const handleConfirmEdit = () => {
    if (editingField === 'name') {
      onUpdateName(tempValues.name);
    } else if (editingField === 'displayName') {
      onUpdateDisplayName(tempValues.displayName);
    } else if (editingField === 'description') {
      onUpdateDescription(tempValues.description);
    }
    setEditingField(null);
  };

  /**
   * Handler para cancelar edição de campo de texto
   */
  const handleCancelEdit = () => {
    setEditingField(null);
  };

  /**
   * Handler para mudança de valor temporário
   */
  const handleTempValueChange = (field: 'name' | 'displayName' | 'description', value: string) => {
    setTempValues(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handler para abrir modal de crop do avatar
   */
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  /**
   * Handler para clique no banner
   */
  const handleBannerClick = () => {
    if (bannerInputRef.current) {
      bannerInputRef.current.accept = 'image/*';
      bannerInputRef.current.click();
    }
  };

  /**
   * Handler para seleção de arquivo do avatar
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Validar tamanho (máximo 2MB para avatar)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;

      setCropModal({
        isOpen: true,
        image: imageDataUrl,
        aspect: 1, // Sempre 1:1 para avatar
        title: 'Editar Avatar da Comunidade',
        onComplete: (croppedImage: string) => {
          // Converter base64 para File
          fetch(croppedImage)
            .then(res => res.blob())
            .then(blob => {
              const croppedFile = new File([blob], file.name, { type: file.type });
              onUpdateAvatar(croppedFile);
            });
        }
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  /**
   * Handler para fechar modal de crop
   */
  const handleCloseCropModal = () => {
    setCropModal(prev => ({ ...prev, isOpen: false }));
  };

  /**
   * Handler para seleção de arquivo do banner
   */
  const handleBannerFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Validar tamanho (máximo 8MB para banner)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;

      setCropModal({
        isOpen: true,
        image: imageDataUrl,
        aspect: 16/9, // Aspect ratio 16:9 para banner
        title: 'Editar Banner da Comunidade',
        onComplete: (croppedImage: string) => {
          // Converter base64 para File
          fetch(croppedImage)
            .then(res => res.blob())
            .then(blob => {
              const croppedFile = new File([blob], file.name, { type: file.type });
              onUpdateBanner(croppedFile);
            });
        }
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          backgroundImage: community.bannerUrl ? `url(${community.bannerUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        {/* Área clicável para banner - idêntica ao perfil */}
        <div
          title="Alterar banner"
          style={{
            position: 'fixed',
            top: '74px', /* Header height (64px) + 10px from banner top */
            right: '20px',
            width: '60px',
            height: '60px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            zIndex: 2,
            pointerEvents: 'auto',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploading) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            }
          }}
          onClick={handleBannerClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-camera"
            aria-hidden="true"
          >
            <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"></path>
            <circle cx="12" cy="13" r="3"></circle>
          </svg>
        </div>



        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          zIndex: 1,
          maxWidth: '1200px',
          width: '100%',
          padding: '0 2rem'
        }}>
          {/* Avatar da comunidade */}
          <div style={{ position: 'relative' }}>
            {community.avatarUrl ? (
              <img
                src={community.avatarUrl}
                alt={`Avatar de r/${community.name}`}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '4px solid white',
                  objectFit: 'cover',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onClick={handleAvatarClick}
              />
            ) : (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '4px solid white',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold'
                }}
                onClick={handleAvatarClick}
              >
                r/
              </div>
            )}

            {/* Ícone de câmera sobreposto ao avatar */}
            <div
              onClick={handleAvatarClick}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                border: '2px solid white',
                zIndex: 3
              }}
            >
              <Camera size={14} color="white" />
            </div>
          </div>

          {/* Informações da comunidade */}
          <div style={{ flex: 1, color: 'white' }}>
            {/* Nome de exibição com edição inline */}
            {editingField === 'displayName' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '0.5rem'
              }}>
                <input
                  type="text"
                  value={tempValues.displayName}
                  onChange={(e) => handleTempValueChange('displayName', e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '1.5rem',
                    padding: '0.75rem',
                    fontFamily: 'inherit',
                    fontWeight: 'bold'
                  }}
                  placeholder="Nome de exibição da comunidade"
                  autoFocus
                  maxLength={100}
                />
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={handleConfirmEdit}
                    style={{
                      background: 'none',
                      border: '1px solid #FF424D',
                      color: '#FF424D',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#DADADA',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  margin: '0 0 0.5rem 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => handleStartEditing('displayName')}
              >
                {community.displayName}
                <Edit3 size={20} style={{ opacity: 0.7 }} />
              </h1>
            )}

            {/* Nome da comunidade */}
            {editingField === 'name' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: 500 }}>r/</span>
                  <input
                    type="text"
                    value={tempValues.name}
                    onChange={(e) => handleTempValueChange('name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '1.2rem',
                      padding: '0.5rem',
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      flex: 1
                    }}
                    placeholder="nome-da-comunidade"
                    autoFocus
                    maxLength={21}
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
                    style={{
                      background: 'none',
                      border: '1px solid #FF424D',
                      color: '#FF424D',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#DADADA',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontSize: '1.2rem',
                  opacity: 0.9,
                  margin: '0 0 1rem 0',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => handleStartEditing('name')}
              >
                r/{community.name}
                <Edit3 size={16} style={{ opacity: 0.7 }} />
              </p>
            )}



            {/* Botões de ação */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                type="button"
                onClick={onSave}
                disabled={!hasChanges || isSaving}
                style={{
                  background: 'linear-gradient(135deg, #FF424D 0%, #FF6B75 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  cursor: (!hasChanges || isSaving) ? 'not-allowed' : 'pointer',
                  opacity: (!hasChanges || isSaving) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '140px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (hasChanges && !isSaving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 66, 77, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasChanges && !isSaving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isSaving ? 'Criando...' : 'Criar Comunidade'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#DADADA',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '140px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <X size={16} style={{ marginRight: '8px' }} />
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isUploading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 30,
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #FF424D',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Fazendo upload...</span>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        ref={bannerInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleBannerFileSelect}
      />

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        image={cropModal.image}
        aspect={cropModal.aspect}
        title={cropModal.title}
        onCropComplete={cropModal.onComplete}
        onClose={handleCloseCropModal}
      />
    </>
  );
};
