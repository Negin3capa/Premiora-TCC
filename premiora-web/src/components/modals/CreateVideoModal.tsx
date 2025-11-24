/**
 * Modal de criação de vídeos
 * Permite ao usuário publicar vídeos na plataforma (Upload ou YouTube)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { useModal } from '../../hooks/useModal';
import { VideoService } from '../../services/content/VideoService';
import type { VideoFormData } from '../../types/content';
import { UPLOAD_CONFIG } from '../../utils/constants';
import { FileUpload } from '../common';
import { Loader, Video, Link as LinkIcon, Youtube, Globe, Lock } from 'lucide-react';
import { CommunityFlairSelector } from '../common/CommunityFlairSelector';
import { CreatorChannelService } from '../../services/content/CreatorChannelService';
import type { SubscriptionTier } from '../../types/creator';
import '../../styles/modals.css';
import '../../styles/CreatePostModal.css'; // Reutilizando estilos
import type { Community } from '../../types/community';

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

type VideoSourceType = 'upload' | 'youtube';

/**
 * Modal para criação de vídeos
 * Inclui título, descrição, seleção de comunidade e upload de vídeo/ thumbnail ou link do YouTube
 */
const CreateVideoModal: React.FC<CreateVideoModalProps> = ({
  isOpen,
  onClose,
  onPublish
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { getModalData } = useModal();

  // Estado do formulário
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    communityId: '',
    video: null,
    youtubeUrl: '',
    thumbnail: null,
    visibility: 'public',
    requiredTierId: ''
  });

  const [sourceType, setSourceType] = useState<VideoSourceType>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubePreviewId, setYoutubePreviewId] = useState<string | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // Configurar comunidade pré-selecionada quando modal abre
  useEffect(() => {
    if (isOpen) {
      const modalData = getModalData('createVideo');
      if (modalData?.preselectedCommunity) {
        const preselectedCommunity = modalData.preselectedCommunity as Community;
        setFormData(prev => ({ ...prev, communityId: preselectedCommunity.id }));
      } else {
        setFormData(prev => ({ ...prev, communityId: '' }));
      }

      // Fetch creator tiers
      if (user?.id) {
        CreatorChannelService.getCreatorChannel(user.id).then(channel => {
          if (channel) {
            setTiers(channel.subscriptionTiers || []);
          }
        });
      }
    }
  }, [isOpen, getModalData, user?.id]);

  // Atualizar preview do YouTube quando URL mudar
  useEffect(() => {
    if (sourceType === 'youtube' && formData.youtubeUrl) {
      const id = VideoService.getYouTubeId(formData.youtubeUrl);
      setYoutubePreviewId(id);
    } else {
      setYoutubePreviewId(null);
    }
  }, [formData.youtubeUrl, sourceType]);

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
      youtubeUrl: '',
      thumbnail: null,
      visibility: 'public',
      requiredTierId: ''
    });
    setSourceType('upload');
    onClose();
  };

  /**
   * Handler para publicação do vídeo
   */
  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showError('Campos obrigatórios', 'Preencha título e descrição');
      return;
    }

    if (sourceType === 'upload' && !formData.video) {
      showError('Vídeo obrigatório', 'Selecione um arquivo de vídeo');
      return;
    }

    if (sourceType === 'youtube' && !formData.youtubeUrl) {
      showError('Link obrigatório', 'Cole um link do YouTube');
      return;
    }

    if (!user?.id) {
      showError('Erro de autenticação', 'Você precisa estar logado para publicar vídeos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Limpar campos não usados baseado no tipo
      const dataToSubmit = { ...formData };
      if (sourceType === 'upload') {
        dataToSubmit.youtubeUrl = undefined;
      } else {
        dataToSubmit.video = null;
      }

      // Criar vídeo usando o serviço
      const result = await VideoService.createVideo(dataToSubmit, user.id);

      // Notificar sucesso
      showSuccess(
        'Vídeo publicado!',
        `Seu vídeo "${result.title}" foi publicado com sucesso.`
      );

      // Chamar callback se fornecido
      if (onPublish) {
        onPublish(dataToSubmit);
      }

      // Limpar formulário e fechar modal
      handleCancel();

    } catch (error) {
      console.error('Erro ao publicar vídeo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showError('Erro ao publicar vídeo', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Não renderiza se o modal não estiver aberto
  if (!isOpen) return null;

  const selectedTier = tiers.find(t => t.id === formData.requiredTierId);

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal - Reutilizando classe create-post-modal para manter consistência visual */}
      <div className="modal create-post-modal">
        {/* Header */}
        <div className="modal-header">
           <button onClick={onClose} className="close-button">
             ×
           </button>
           <h3 style={{ marginLeft: '16px', fontWeight: 600 }}>Publicar Vídeo</h3>
        </div>

        <div className="modal-content">
          {/* Avatar Column */}
          <div className="avatar-column">
            <div className="avatar-placeholder">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="User" />
              ) : (
                <span>{user?.user_metadata?.name?.[0] || 'U'}</span>
              )}
            </div>
          </div>

          {/* Content Column */}
          <div className="content-column">
             {/* Community Selector */}
             <div style={{ marginBottom: '12px' }}>
               <CommunityFlairSelector 
                 selectedCommunityId={formData.communityId}
                 onCommunitySelect={handleCommunitySelect}
                 disabled={isSubmitting}
               />
             </div>

             {/* Title Input */}
             <input
               type="text"
               value={formData.title}
               onChange={(e) => handleInputChange('title', e.target.value)}
               placeholder="Título do vídeo"
               className="post-title-input"
               maxLength={200}
             />

             {/* Description Textarea */}
             <textarea
               value={formData.description}
               onChange={(e) => handleInputChange('description', e.target.value)}
               placeholder="Descreva seu vídeo..."
               className="post-content-textarea"
               rows={3}
               maxLength={2000}
               style={{ minHeight: '80px', fontSize: '1rem' }}
             />

             {/* Source Type Toggle */}
             <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
               <button
                 type="button"
                 onClick={() => setSourceType('upload')}
                 className={`btn ${sourceType === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                 style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
               >
                 <Video size={16} /> Upload
               </button>
               <button
                 type="button"
                 onClick={() => setSourceType('youtube')}
                 className={`btn ${sourceType === 'youtube' ? 'btn-primary' : 'btn-secondary'}`}
                 style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
               >
                 <Youtube size={16} /> YouTube
               </button>
             </div>

             {/* Upload Section */}
             {sourceType === 'upload' && (
               <div style={{ marginBottom: '16px' }}>
                 <FileUpload
                   file={formData.video ?? null}
                   fileType="video"
                   inputId="video-upload"
                   title="Selecionar vídeo"
                   subtitle={UPLOAD_CONFIG.VIDEO.DESCRIPTION}
                   onFileSelect={(file: File | null) => setFormData(prev => ({ ...prev, video: file }))}
                   disabled={isSubmitting}
                   maxSizeMB={UPLOAD_CONFIG.VIDEO.MAX_SIZE_MB}
                 />
               </div>
             )}

             {/* YouTube Section */}
             {sourceType === 'youtube' && (
               <div style={{ marginBottom: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0 12px', border: '1px solid var(--color-border-light)' }}>
                   <LinkIcon size={16} style={{ color: 'var(--color-text-secondary)', marginRight: '8px' }} />
                   <input
                     type="text"
                     value={formData.youtubeUrl || ''}
                     onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                     placeholder="Cole o link do YouTube aqui..."
                     style={{
                       width: '100%',
                       padding: '12px 0',
                       background: 'transparent',
                       border: 'none',
                       color: 'var(--color-text-primary)',
                       outline: 'none'
                     }}
                   />
                 </div>
                 
                 {/* YouTube Preview */}
                 {youtubePreviewId && (
                   <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                     <iframe
                       style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                       src={`https://www.youtube.com/embed/${youtubePreviewId}`}
                       title="YouTube video player"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                     />
                   </div>
                 )}
               </div>
             )}

             {/* Thumbnail Section (Optional) */}
             <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                  Thumbnail (opcional)
                  {sourceType === 'youtube' && youtubePreviewId && ' - Se não enviada, usaremos a do YouTube'}
                </p>
                <FileUpload
                  file={formData.thumbnail ?? null}
                  fileType="image"
                  inputId="thumbnail-upload"
                  title="Upload Thumbnail"
                  subtitle={UPLOAD_CONFIG.THUMBNAIL.DESCRIPTION}
                  onFileSelect={(file: File | null) => setFormData(prev => ({ ...prev, thumbnail: file }))}
                  disabled={isSubmitting}
                  maxSizeMB={UPLOAD_CONFIG.THUMBNAIL.MAX_SIZE_MB}
                />
             </div>

             {/* Visibility Setting */}
             <div className="visibility-section">
               <div style={{ position: 'relative' }}>
                 <button 
                   className="visibility-trigger"
                   onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                 >
                   {formData.visibility === 'public' ? <Globe size={16} /> : <Lock size={16} />}
                   {formData.visibility === 'public' 
                     ? 'Qualquer pessoa pode ver' 
                     : `Apenas assinantes${selectedTier ? ` ${selectedTier.name}` : ''}`}
                 </button>
                 
                 {showVisibilityMenu && (
                   <div className="visibility-menu">
                     <div className="visibility-menu-title">Quem pode ver?</div>
                     
                     <div 
                       onClick={() => {
                         setFormData(prev => ({ ...prev, visibility: 'public', requiredTierId: '' }));
                         setShowVisibilityMenu(false);
                       }}
                       className="visibility-menu-item"
                     >
                       <div style={{ background: 'var(--color-primary)', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                         <Globe size={16} color="white" />
                       </div>
                       <div>
                         <div style={{ fontWeight: 500 }}>Qualquer pessoa</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Público para todos</div>
                       </div>
                     </div>

                     {tiers.map(tier => (
                       <div 
                         key={tier.id}
                         onClick={() => {
                           setFormData(prev => ({ ...prev, visibility: 'tier', requiredTierId: tier.id }));
                           setShowVisibilityMenu(false);
                         }}
                         className="visibility-menu-item"
                       >
                         <div style={{ background: tier.color || 'var(--color-success)', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                           <Lock size={16} color="white" />
                         </div>
                         <div>
                           <div style={{ fontWeight: 500 }}>Assinantes {tier.name}</div>
                           <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Apenas membros deste nível</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>

             {/* Bottom Toolbar */}
             <div className="modal-toolbar">
                <div className="tools">
                  {/* Espaço para ferramentas futuras */}
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || (sourceType === 'upload' ? !formData.video : !formData.youtubeUrl)}
                  className="btn btn-primary post-button"
                >
                  {isSubmitting ? (
                    <Loader size={16} className="spinner" />
                  ) : (
                    'Publicar'
                  )}
                </button>
             </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateVideoModal;
