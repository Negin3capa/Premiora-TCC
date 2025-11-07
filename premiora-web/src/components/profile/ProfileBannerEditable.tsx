/**
 * Componente do banner do perfil em modo de edição
 * Permite edição interativa de avatar, banner, nome e descrição
 */
import React, { useState, useRef } from 'react';
import { Camera, Edit3, X, Save, RotateCcw } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';
import type { CreatorProfile } from '../../types/profile';
import styles from './ProfileBanner.module.css';

/**
 * Props do componente ProfileBannerEditable
 */
interface ProfileBannerEditableProps {
  /** Dados do perfil sendo editados */
  profile: CreatorProfile | null;
  /** Indica se está fazendo upload */
  isUploading: boolean;
  /** Callback para atualizar nome */
  onUpdateName: (name: string) => void;
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
 * Componente interativo para edição do banner do perfil
 */
export const ProfileBannerEditable: React.FC<ProfileBannerEditableProps> = ({
  profile,
  isUploading,
  onUpdateName,
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

  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null);
  const [tempValues, setTempValues] = useState<{ name: string; description: string }>({
    name: '',
    description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handler para iniciar edição de campo de texto
   */
  const handleStartEditing = (field: 'name' | 'description') => {
    setEditingField(field);
    setTempValues({
      name: profile?.name || '',
      description: profile?.description || ''
    });
  };

  /**
   * Handler para confirmar edição de campo de texto
   */
  const handleConfirmEdit = () => {
    if (editingField === 'name') {
      onUpdateName(tempValues.name);
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
  const handleTempValueChange = (field: 'name' | 'description', value: string) => {
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
   * Handler para seleção de arquivo (sempre para avatar)
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;

      setCropModal({
        isOpen: true,
        image: imageDataUrl,
        aspect: 1, // Sempre 1:1 para avatar
        title: 'Editar Avatar',
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

    // Validar tamanho (máximo 10MB para banner)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;

      setCropModal({
        isOpen: true,
        image: imageDataUrl,
        aspect: 16/9, // Aspect ratio 16:9 para banner
        title: 'Editar Banner',
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

  if (!profile) {
    return (
      <div style={{
        backgroundColor: '#0D0D0D',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#DADADA'
      }}>
        Carregando perfil...
      </div>
    );
  }

  return (
    <>
      <div
        className={styles.banner}
        style={{
          backgroundImage: profile?.bannerImage ? `url(${profile.bannerImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Área clicável para banner - posicionada estrategicamente */}
        <div
          onClick={handleBannerClick}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: profile?.bannerImage ? 0.8 : 1,
            transition: 'all 0.2s ease',
            cursor: isUploading ? 'not-allowed' : 'pointer',
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
          title={profile?.bannerImage ? 'Alterar banner' : 'Adicionar banner'}
        >
          <Camera size={20} color="white" />
        </div>

        {/* Overlay sutil para toda área quando não há banner */}
        {!profile?.bannerImage && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <Camera size={32} />
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                Adicionar Banner
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Clique no ícone da câmera para começar
              </span>
            </div>
          </div>
        )}

        <div className={styles.bannerContent}>
          <div className={styles.creatorInfo}>

            {/* Name com edição inline */}
            {editingField === 'name' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <input
                  type="text"
                  value={tempValues.name}
                  onChange={(e) => handleTempValueChange('name', e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    padding: '0.75rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Nome de exibição"
                  autoFocus
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
                      border: '1px solid rgba(255, 255, 255, 0.2)',
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
                className={styles.creatorName}
                onClick={() => handleStartEditing('name')}
                style={{ cursor: 'pointer' }}
              >
                {profile.name}
                <Edit3 size={16} style={{ marginLeft: '8px', opacity: 0.6 }} />
              </h1>
            )}

            <p className={styles.postCount}>{profile.totalPosts} posts</p>

            {/* Description com edição inline */}
            {editingField === 'description' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <textarea
                  value={tempValues.description}
                  onChange={(e) => handleTempValueChange('description', e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    padding: '0.75rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  placeholder="Descrição do perfil"
                  rows={3}
                  autoFocus
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
                      border: '1px solid rgba(255, 255, 255, 0.2)',
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
                className={styles.description}
                onClick={() => handleStartEditing('description')}
                style={{ cursor: 'pointer' }}
              >
                {profile.description || 'Clique para adicionar descrição'}
                <Edit3 size={14} style={{ marginLeft: '8px', opacity: 0.6 }} />
              </p>
            )}

            {/* Botão de ação - Salvar/Cancelar em vez de "Editar Perfil" */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                type="button"
                onClick={onSave}
                disabled={!hasChanges || isSaving}
                className={styles.ctaButton}
                style={{
                  opacity: (!hasChanges || isSaving) ? 0.6 : 1,
                  cursor: (!hasChanges || isSaving) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={!hasChanges || isSaving}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#DADADA',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  cursor: (!hasChanges || isSaving) ? 'not-allowed' : 'pointer',
                  opacity: (!hasChanges || isSaving) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '140px'
                }}
              >
                <RotateCcw size={16} style={{ marginRight: '8px' }} />
                Cancelar
              </button>
            </div>
          </div>
          <div className={styles.illustration}>
            {/* Avatar do usuário */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`Avatar de ${profile.name}`}
                className={styles.avatar}
                onError={(e) => {
                  // Fallback para avatar padrão se a imagem falhar
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                style={{
                  cursor: isUploading ? 'not-allowed' : 'pointer'
                }}
                onClick={handleAvatarClick}
              />
            ) : null}
            {/* Fallback para quando não há avatar */}
            <div
              className={styles.placeholderIllustration}
              style={{
                display: profile.avatar_url ? 'none' : 'flex',
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleAvatarClick}
            >
              <svg viewBox="0 0 200 200" className={styles.svgIllustration}>
                <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" />
                <circle cx="100" cy="80" r="20" fill="rgba(255,255,255,0.2)" />
                <rect x="85" y="110" width="30" height="40" rx="15" fill="rgba(255,255,255,0.2)" />
              </svg>
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
