/**
 * Modal de criação de vídeos
 * Permite ao usuário publicar vídeos na plataforma
 */
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { VideoFormData } from '../../types/content';
import { UPLOAD_CONFIG } from '../../utils/constants';
import { CommunityDropdown, FileUpload } from '../common';
import '../../styles/modals.css';

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
      thumbnail: null
    });
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



  // Não renderiza se o modal não estiver aberto
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Publicar Vídeo</h2>
          <p className="modal-subtitle">Compartilhe seus vídeos com a comunidade</p>
        </div>

        {/* Formulário */}
        <div className="modal-form">
          {/* Título */}
          <div className="form-group">
            <label htmlFor="video-title" className="form-label form-label-required">
              Título
            </label>
            <input
              id="video-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título do seu vídeo..."
              className="form-input"
              maxLength={200}
            />
            <div className="char-counter">
              {formData.title.length}/200
            </div>
          </div>

          {/* Seleção de comunidade */}
          <div className="form-group">
            <label className="form-label">Comunidade (opcional)</label>
            <CommunityDropdown
              selectedCommunityId={formData.communityId}
              onCommunitySelect={handleCommunitySelect}
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="video-description" className="form-label form-label-required">
              Descrição
            </label>
            <textarea
              id="video-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva seu vídeo..."
              className="form-textarea"
              rows={4}
              maxLength={2000}
            />
            <div className="char-counter">
              {formData.description.length}/2000
            </div>
          </div>

          {/* Upload de vídeo */}
          <div className="form-group">
            <label className="form-label form-label-required">Vídeo</label>
            <FileUpload
              file={formData.video ?? null}
              fileType="video"
              inputId="video-upload"
              title="Clique para selecionar um vídeo"
              subtitle={UPLOAD_CONFIG.VIDEO.DESCRIPTION}
              onFileSelect={(file: File | null) => setFormData(prev => ({ ...prev, video: file }))}
              disabled={isSubmitting}
              maxSizeMB={UPLOAD_CONFIG.VIDEO.MAX_SIZE_MB}
            />
          </div>

          {/* Upload de thumbnail */}
          <div className="form-group">
            <label className="form-label">Thumbnail (opcional)</label>
            <FileUpload
              file={formData.thumbnail ?? null}
              fileType="image"
              inputId="thumbnail-upload"
              title="Adicionar thumbnail"
              subtitle={UPLOAD_CONFIG.THUMBNAIL.DESCRIPTION}
              onFileSelect={(file: File | null) => setFormData(prev => ({ ...prev, thumbnail: file }))}
              disabled={isSubmitting}
              maxSizeMB={UPLOAD_CONFIG.THUMBNAIL.MAX_SIZE_MB}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancelar
          </button>

          <button
            onClick={handlePublish}
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.video}
            className="btn btn-success"
          >
            {isSubmitting ? (
              <>
                <span className="spinner">⏳</span>
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
