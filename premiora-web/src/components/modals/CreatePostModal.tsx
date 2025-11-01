/**
 * Modal de criação de posts
 * Permite ao usuário criar posts na plataforma com opção de comunidade
 */
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/modals.css';
import { CommunityDropdown, FileUpload } from '../common';

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
          <h2 className="modal-title">Criar Novo Post</h2>
          <p className="modal-subtitle">Compartilhe suas ideias e pensamentos</p>
        </div>

        {/* Formulário */}
        <div className="modal-form">
          {/* Título */}
          <div className="form-group">
            <label htmlFor="post-title" className="form-label form-label-required">
              Título
            </label>
            <input
              id="post-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título do seu post..."
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

          {/* Conteúdo */}
          <div className="form-group">
            <label htmlFor="post-content" className="form-label form-label-required">
              Conteúdo
            </label>
            <textarea
              id="post-content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Conteúdo do seu post..."
              className="form-textarea"
              rows={6}
              maxLength={5000}
            />
            <div className="char-counter">
              {formData.content.length}/5000
            </div>
          </div>

          {/* Upload de imagem */}
          <div className="form-group">
            <label className="form-label">Imagem (opcional)</label>
            <FileUpload
              file={formData.image || null}
              fileType="image"
              inputId="image-upload"
              title="Clique para adicionar uma imagem"
              subtitle="PNG, JPG até 10MB"
              onFileSelect={(file) => setFormData(prev => ({ ...prev, image: file }))}
              disabled={isSubmitting}
              maxSizeMB={10}
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
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <span className="spinner">⏳</span>
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
