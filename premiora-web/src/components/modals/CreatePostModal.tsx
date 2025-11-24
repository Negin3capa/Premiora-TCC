/**
 * Modal de criação de posts
 * Permite ao usuário criar posts na plataforma com opção de comunidade
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ContentService } from '../../services/contentService';
import { CreatorChannelService } from '../../services/content/CreatorChannelService';
import { useFeed } from '../../hooks/useFeed';
import { useModal } from '../../hooks/useModal';
import '../../styles/modals.css';
import '../../styles/CreatePostModal.css';
import { MultiImageUpload } from '../common/MultiImageUpload';
import { CommunityFlairSelector } from '../common/CommunityFlairSelector';
import { Loader, Globe, Lock, Image as ImageIcon, Smile } from 'lucide-react';
import type { Community, CommunityFlair } from '../../types/community';
import type { SubscriptionTier } from '../../types/creator';
import { getCommunityFlairs } from '../../utils/communityUtils';
import type { PostFormData } from '../../types/content';

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
 * Modal para criação de posts
 * Inclui título, conteúdo, seleção de comunidade e upload de imagem
 */
const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPublish
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNewPost } = useFeed();
  const { getModalData } = useModal();

  // Estado do formulário
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    communityId: '',
    flairId: '',
    images: [],
    visibility: 'public',
    requiredTierId: ''
  });

  const [flairs, setFlairs] = useState<CommunityFlair[]>([]);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // Configurar comunidade pré-selecionada quando modal abre
  useEffect(() => {
    if (isOpen) {
      const modalData = getModalData('createPost');
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

  // Fetch flairs when community changes
  useEffect(() => {
    const loadFlairs = async () => {
      if (formData.communityId) {
        const communityFlairs = await getCommunityFlairs(formData.communityId, 'post');
        setFlairs(communityFlairs);
        setFormData(prev => ({ ...prev, flairId: '' }));
      } else {
        setFlairs([]);
        setFormData(prev => ({ ...prev, flairId: '' }));
      }
    };
    loadFlairs();
  }, [formData.communityId]);

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
  };

  /**
   * Handler para cancelar criação
   */
  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      communityId: '',
      flairId: '',
      images: [],
      visibility: 'public',
      requiredTierId: ''
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

    if (!user?.id) {
      alert('Você precisa estar logado para publicar');
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar post usando o ContentService
      const newPost = await ContentService.createPost(formData, user.id);

      // Adicionar ao feed
      addNewPost(newPost);

      // Callback opcional
      if (onPublish) {
        onPublish(formData);
      }

      // Limpar formulário e fechar modal
      handleCancel();

      // Redirecionar para a página de visualização do post
      navigate(`/u/${newPost.username}/status/${newPost.id}`);

    } catch (error) {
      console.error('Erro ao publicar post:', error);
      alert('Erro ao publicar post. Tente novamente.');
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

      {/* Modal */}
      <div className="modal create-post-modal">
        {/* Header with close button */}
        <div className="modal-header">
           <button onClick={onClose} className="close-button">
             ×
           </button>
           <div style={{ flex: 1 }} />
           <button className="drafts-button">
             Rascunhos
           </button>
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
               placeholder="Título do post"
               className="post-title-input"
               maxLength={30}
             />

             {/* Content Textarea */}
             <textarea
               value={formData.content}
               onChange={(e) => handleInputChange('content', e.target.value)}
               placeholder="O que está acontecendo?"
               className="post-content-textarea"
               rows={4}
               maxLength={5000}
             />

             {/* Image Upload Preview */}
             <MultiImageUpload
               images={formData.images || []}
               onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
               disabled={isSubmitting}
             />

             {/* Flair Selection (if community selected) */}
             {flairs.length > 0 && (
                <div className="flair-selection">
                  {flairs.map(flair => (
                    <button
                      key={flair.id}
                      type="button"
                      className={`flair-option ${formData.flairId === flair.id ? 'selected' : ''}`}
                      style={{
                        '--flair-color': flair.flairColor,
                        '--flair-bg': flair.flairBackgroundColor,
                        borderColor: formData.flairId === flair.id ? flair.flairColor : 'var(--color-border-light)',
                        backgroundColor: formData.flairId === flair.id ? flair.flairBackgroundColor : 'var(--color-bg-secondary)',
                        color: formData.flairId === flair.id ? flair.flairColor : 'var(--color-text-secondary)',
                      } as React.CSSProperties}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        flairId: prev.flairId === flair.id ? '' : flair.id 
                      }))}
                    >
                      {flair.flairText}
                    </button>
                  ))}
                </div>
              )}

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
                  <button title="Mídia" className="tool-button" onClick={() => document.querySelector<HTMLInputElement>('.multi-image-upload input')?.click()}>
                    <ImageIcon size={20} />
                  </button>
                  <button title="GIF" className="tool-button" onClick={() => document.querySelector<HTMLInputElement>('.multi-image-upload input')?.click()}>
                    <div style={{ border: '1.5px solid currentColor', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>GIF</div>
                  </button>
                  <button title="Emoji" className="tool-button">
                    <Smile size={20} />
                  </button>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isSubmitting || (!formData.title.trim() && !formData.content.trim() && (!formData.images || formData.images.length === 0))}
                  className="btn btn-primary post-button"
                >
                  {isSubmitting ? (
                    <Loader size={16} className="spinner" />
                  ) : (
                    'Postar'
                  )}
                </button>
             </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;
