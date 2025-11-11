/**
 * Componente do banner do perfil em modo de edição
 * Permite edição interativa de avatar, banner, nome e descrição
 */
import React, { useState, useRef } from 'react';
import { Camera, RotateCcw, Trash2 } from 'lucide-react';
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
  /** Callback para remover avatar */
  onRemoveAvatar?: () => void;
  /** Callback para remover banner */
  onRemoveBanner?: () => void;

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
  onRemoveAvatar,
  onRemoveBanner,
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

  const nameRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
        aspect: 3, // Aspect ratio 3:1 para banner (mais apropriado para banners horizontais)
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
        {/* Controles do banner */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 2
        }}>
          {/* Botão para alterar/adicionar banner */}
          <div
            onClick={handleBannerClick}
            style={{
              width: '50px',
              height: '50px',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: profile?.bannerImage ? 0.8 : 1,
              transition: 'all 0.2s ease',
              cursor: isUploading ? 'not-allowed' : 'pointer',
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
            <Camera size={18} color="white" />
          </div>

          {/* Botão para remover banner (só aparece se há banner) */}
          {profile?.bannerImage && (
            <div
              onClick={() => onRemoveBanner?.()}
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(220, 53, 69, 0.8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                pointerEvents: 'auto',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.8)';
                }
              }}
              title="Remover banner"
            >
              <Trash2 size={18} color="white" />
            </div>
          )}
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
            <div style={{
              position: 'relative',
              display: 'inline-block',
              minWidth: '200px'
            }}>
              {!editingField || editingField !== 'name' ? (
                <h1
                  ref={nameRef}
                  onClick={() => {
                    setEditingField('name');
                    setTempValues(prev => ({ ...prev, name: profile?.name || '' }));
                  }}
                  className={styles.creatorName}
                  style={{
                    cursor: 'pointer',
                    opacity: profile?.name ? 1 : 0.6
                  }}
                  title="Clique para editar o nome"
                >
                  {profile.name || 'Nome do perfil'}
                </h1>
              ) : (
                <input
                  type="text"
                  value={tempValues.name}
                  onChange={(e) => {
                    setTempValues(prev => ({ ...prev, name: e.target.value }));
                  }}
                  onBlur={() => {
                    onUpdateName(tempValues.name);
                    setEditingField(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateName(tempValues.name);
                      setEditingField(null);
                    } else if (e.key === 'Escape') {
                      setEditingField(null);
                    }
                  }}
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0',
                    minWidth: '200px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  autoFocus
                />
              )}
            </div>

            <p className={styles.postCount}>{profile.totalPosts} posts</p>

            {/* Description com edição inline */}
            <div style={{
              position: 'relative',
              display: 'inline-block',
              minWidth: '200px'
            }}>
              {!editingField || editingField !== 'description' ? (
                <p
                  ref={descriptionRef}
                  onClick={() => {
                    setEditingField('description');
                    setTempValues(prev => ({ ...prev, description: profile?.description || '' }));
                  }}
                  className={styles.description}
                  style={{
                    cursor: 'pointer',
                    opacity: profile?.description ? 1 : 0.6
                  }}
                  title="Clique para editar a descrição"
                >
                  {profile.description || 'Descrição do perfil'}
                </p>
              ) : (
                <textarea
                  value={tempValues.description}
                  onChange={(e) => {
                    setTempValues(prev => ({ ...prev, description: e.target.value }));
                  }}
                  onBlur={() => {
                    onUpdateDescription(tempValues.description);
                    setEditingField(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      onUpdateDescription(tempValues.description);
                      setEditingField(null);
                    } else if (e.key === 'Escape') {
                      setEditingField(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    minWidth: '200px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    minHeight: '20px'
                  }}
                  placeholder="Descrição do perfil"
                  autoFocus
                  rows={1}
                />
              )}
            </div>

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
            {/* Controles do avatar */}
            {profile.avatar_url && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '5px',
                zIndex: 3
              }}>
                {/* Botão para remover avatar */}
                <div
                  onClick={() => onRemoveAvatar?.()}
                  style={{
                    width: '30px',
                    height: '30px',
                    background: 'rgba(220, 53, 69, 0.8)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    pointerEvents: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'rgba(220, 53, 69, 0.8)';
                    }
                  }}
                  title="Remover avatar"
                >
                  <Trash2 size={14} color="white" />
                </div>
              </div>
            )}

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
