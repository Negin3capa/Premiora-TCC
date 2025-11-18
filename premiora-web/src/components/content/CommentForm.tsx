/**
 * Componente de formulário para criação e edição de comentários
 * Suporta tanto comentários novos quanto respostas e edições
 */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { CreateCommentData } from '../../types/content';

interface CommentFormProps {
  /** Modo do formulário: 'create', 'reply', 'edit' */
  mode: 'create' | 'reply' | 'edit';
  /** ID do post (obrigatório para create e reply) */
  postId?: string;
  /** ID do comentário pai (obrigatório para reply) */
  parentCommentId?: string;
  /** Conteúdo inicial (obrigatório para edit) */
  initialContent?: string;
  /** Placeholder do textarea */
  placeholder?: string;
  /** Se está sendo processado */
  isSubmitting?: boolean;
  /** Callback para quando o comentário é enviado */
  onSubmit: (data: Partial<CreateCommentData> & { content: string }) => Promise<void>;
  /** Callback para cancelar operação */
  onCancel?: () => void;
  /** Callback para mudanças no conteúdo (para validação em tempo real) */
  onContentChange?: (content: string) => void;
  /** Texto do botão de submit */
  submitButtonText?: string;
  /** Focar automaticamente no textarea quando montado */
  autoFocus?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de formulário para comentários
 */
export const CommentForm: React.FC<CommentFormProps> = ({
  mode,
  postId,
  parentCommentId,
  initialContent = '',
  placeholder = 'Digite seu comentário...',
  isSubmitting = false,
  onSubmit,
  onCancel,
  onContentChange,
  submitButtonText,
  autoFocus = false,
  className = ''
}) => {
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus no textarea quando solicitado
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Atualizar conteúdo interno quando initialContent mudar (para edição)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Calcular texto do botão baseado no modo
  const getButtonText = () => {
    if (submitButtonText) return submitButtonText;
    switch (mode) {
      case 'reply':
        return 'Responder';
      case 'edit':
        return 'Salvar';
      case 'create':
      default:
        return 'Comentar';
    }
  };

  /**
   * Handler para mudanças no conteúdo do textarea
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Limpar erro quando usuário começa a digitar
    if (error && newContent.trim()) {
      setError(null);
    }

    // Callback opcional para validação em tempo real
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  /**
   * Handler para submissão do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se usuário está autenticado
    if (!user) {
      setError('Você precisa estar logado para comentar');
      return;
    }

    // Validar conteúdo
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Por favor, digite um comentário');
      return;
    }

    if (trimmedContent.length < 2) {
      setError('Comentário deve ter pelo menos 2 caracteres');
      return;
    }

    // Validar postId dependendo do modo
    if (mode !== 'edit' && !postId) {
      setError('ID do post é obrigatório');
      return;
    }

    // Validar parentCommentId para modo reply
    if (mode === 'reply' && !parentCommentId) {
      setError('ID do comentário pai é obrigatório para respostas');
      return;
    }

    try {
      setError(null);

      const submitData = {
        ...(postId && { postId }),
        content: trimmedContent,
        ...(parentCommentId && { parentCommentId })
      };

      await onSubmit(submitData);

      // Limpar formulário apenas para criação
      if (mode === 'create') {
        setContent('');
      }
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar comentário');
    }
  };

  /**
   * Handler para cancelar edição
   */
  const handleCancel = () => {
    setContent(initialContent);
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Handler para ajuste automático da altura do textarea
   */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e);

    // Ajustar altura automaticamente
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Verificar se pode enviar
  const canSubmit = content.trim().length >= 2 && !isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className={`comment-form ${mode} ${className}`}
    >
      <div className="comment-form-container">
        {/* Avatar do usuário */}
        <img
          src={userProfile?.avatar_url || '/default-avatar.png'}
          alt={userProfile?.name || userProfile?.username || 'Usuário'}
          className="comment-form-avatar"
          loading="lazy"
        />

        {/* Campo de texto principal */}
        <div className="comment-form-content">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            className={`comment-form-textarea ${error ? 'error' : ''}`}
            disabled={isSubmitting}
            rows={2}
            maxLength={1000}
            aria-label="Escreva seu comentário"
            aria-describedby={error ? 'comment-error' : undefined}
          />

          {/* Contador de caracteres */}
          <div className="comment-form-meta">
            <span className={`char-count ${content.length > 500 ? 'warning' : ''}`}>
              {content.length}/1000
            </span>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div id="comment-error" className="comment-form-error" role="alert">
              {error}
            </div>
          )}

          {/* Botões de ação */}
          <div className="comment-form-actions">
            {/* Botão Cancelar (para edição e resposta) */}
            {(mode === 'edit' || mode === 'reply') && onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="comment-form-cancel"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            )}

            {/* Botão Enviar */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`comment-form-submit ${canSubmit ? '' : 'disabled'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{getButtonText()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
