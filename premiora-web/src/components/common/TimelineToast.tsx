/**
 * Componente TimelineToast
 * Exibe notificações de novos posts quando o usuário não está no topo do feed
 * Inclui acessibilidade completa com navegação por teclado e leitores de tela
 */
import React, { useEffect, useRef } from 'react';
import { X, ChevronUp } from 'lucide-react';
import '../../styles/TimelineToast.css';

export interface TimelineToastProps {
  /** Número de posts pendentes */
  count: number;
  /** Callback quando usuário clica em "View" */
  onView: () => void;
  /** Callback quando usuário clica em "Dismiss" */
  onDismiss: () => void;
  /** Se deve mostrar preview dos posts */
  showPreview?: boolean;
  /** Posts para preview (opcional) */
  previewPosts?: Array<{
    id: string;
    title?: string;
    author: string;
    timestamp: string;
  }>;
}

/**
 * Toast de notificação para novos posts na timeline
 * Posicionado no topo da tela com acessibilidade completa
 */
export const TimelineToast: React.FC<TimelineToastProps> = ({
  count,
  onView,
  onDismiss,
  showPreview = false,
  previewPosts = []
}) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const viewButtonRef = useRef<HTMLButtonElement>(null);

  // Focar no botão View quando o toast aparece
  useEffect(() => {
    if (viewButtonRef.current) {
      viewButtonRef.current.focus();
    }
  }, []);

  // Handlers de teclado
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onView();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onDismiss();
    }
  };

  // Texto dinâmico baseado na quantidade
  const getCountText = () => {
    if (count === 1) return '1 new post';
    if (count > 50) return '50+ new posts';
    return `${count} new posts`;
  };

  // Formatar timestamp relativo
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <>
      {/* Backdrop para foco */}
      <div
        className="timeline-toast-backdrop"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Toast principal */}
      <div
        ref={toastRef}
        role="status"
        aria-live="polite"
        aria-label={`${getCountText()} available. Press Enter to view or Escape to dismiss.`}
        className="timeline-toast"
        onKeyDown={handleKeyDown}
        tabIndex={-1} // Foco gerenciado pelos botões internos
      >
        <div className="timeline-toast-content">
          {/* Ícone e contador */}
          <div className="timeline-toast-main">
            <ChevronUp size={16} className="timeline-toast-icon" aria-hidden="true" />
            <span className="timeline-toast-text">
              {getCountText()}
            </span>
          </div>

          {/* Botões de ação */}
          <div className="timeline-toast-actions">
            <button
              ref={viewButtonRef}
              onClick={onView}
              className="timeline-toast-btn timeline-toast-btn-primary"
              aria-label={`View ${count} new posts`}
            >
              View
            </button>

            <button
              onClick={onDismiss}
              className="timeline-toast-btn timeline-toast-btn-secondary"
              aria-label="Dismiss new posts notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Preview de posts (opcional) */}
        {showPreview && previewPosts.length > 0 && (
          <div className="timeline-toast-preview">
            <div className="timeline-toast-preview-title">
              Latest posts:
            </div>
            <ul className="timeline-toast-preview-list">
              {previewPosts.slice(0, 2).map((post) => (
                <li key={post.id} className="timeline-toast-preview-item">
                  <div className="timeline-toast-preview-content">
                    {post.title && (
                      <div className="timeline-toast-preview-post-title">
                        {post.title}
                      </div>
                    )}
                    <div className="timeline-toast-preview-post-meta">
                      {post.author} • {formatTimestamp(post.timestamp)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default TimelineToast;
