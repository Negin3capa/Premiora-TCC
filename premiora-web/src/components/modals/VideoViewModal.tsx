/**
 * Modal de visualização de vídeos
 * Player de vídeo completo com comentários, descrição e controles
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { ContentItem } from '../../types/content';

interface VideoViewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  userTier?: string; // Tier do usuário atual
}

/**
 * Interface para comentários
 */
interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

/**
 * Modal para visualização completa de vídeos
 * Inclui player, descrição, comentários e controles de engajamento
 */
const VideoViewModal: React.FC<VideoViewModalProps> = ({
  item,
  isOpen,
  onClose,
  userTier
}) => {
  const { userProfile } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Estados da interface
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments] = useState<Comment[]>([
    // Dados mockados para demonstração
    {
      id: '1',
      author: 'João Silva',
      authorAvatar: 'https://via.placeholder.com/40',
      content: 'Incrível vídeo! Muito bem explicado.',
      timestamp: '2 horas atrás',
      likes: 12
    },
    {
      id: '2',
      author: 'Maria Santos',
      authorAvatar: 'https://via.placeholder.com/40',
      content: 'Obrigada pelo conteúdo! Aprendi muito.',
      timestamp: '1 hora atrás',
      likes: 8
    }
  ]);

  // Estados de engajamento
  const [likes, setLikes] = useState(item?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (item) {
      setLikes(item.likes || 0);
    }
  }, [item]);

  if (!isOpen || !item || item.type !== 'video') {
    return null;
  }

  /**
   * Verifica se o usuário tem acesso ao vídeo completo
   */
  const hasFullAccess = () => {
    if (item.accessLevel === 'public') return true;
    if (!userTier) return false;

    // Lógica de acesso baseada no tier
    const tierHierarchy = { 'supporters': 1, 'premium': 2 };
    const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[item.requiredTier as keyof typeof tierHierarchy] || 0;

    return userTierLevel >= requiredTierLevel;
  };

  /**
   * Handlers do player de vídeo
   */
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Handlers de engajamento
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    navigator.share?.({
      title: item.title,
      text: item.content || '',
      url: window.location.href
    }).catch(() => {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    });
  };

  const handleComment = () => {
    if (newComment.trim()) {
      // TODO: Implementar API de comentários
      console.log('Novo comentário:', newComment);
      setNewComment('');
    }
  };

  const canAccess = hasFullAccess();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="author-info">
            <img
              src={item.authorAvatar}
              alt={item.author}
              className="author-avatar"
              loading="lazy"
            />
            <div className="author-details">
              <span className="author-name">{item.author}</span>
              <span className="video-timestamp">{item.timestamp}</span>
            </div>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="video-player-section">
            {canAccess ? (
              <div className="video-player-container">
                <video
                  ref={videoRef}
                  className="video-player"
                  poster={item.thumbnail}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  {/* TODO: Adicionar source do vídeo quando disponível */}
                  <source src="" type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>

                {/* Controles do player */}
                <div className="video-controls">
                  <div className="progress-bar">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="progress-input"
                    />
                  </div>

                  <div className="control-buttons">
                    <button onClick={handlePlayPause} className="play-pause-btn">
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>

                    <div className="volume-control">
                      <button onClick={handleMute} className="mute-btn">
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="volume-input"
                      />
                    </div>

                    <div className="time-display">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    <button onClick={handleFullscreen} className="fullscreen-btn">
                      {isFullscreen ? '🗗' : '🗖'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="video-preview-container">
                <div className="video-preview">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="preview-thumbnail"
                  />
                  <div className="preview-overlay">
                    <div className="lock-icon">🔒</div>
                    <p>Este vídeo é exclusivo para {item.requiredTier || 'assinantes'}</p>
                    <button className="upgrade-button">
                      Fazer Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Informações do vídeo */}
            <div className="video-info">
              <h1 className="video-title">{item.title}</h1>
              <div className="video-stats">
                <span className="views">{item.views?.toLocaleString('pt-BR')} visualizações</span>
                <span className="likes">{likes?.toLocaleString('pt-BR')} curtidas</span>
              </div>

              {/* Descrição */}
              <div className="video-description">
                <p>{item.content}</p>
              </div>
            </div>
          </div>

          {/* Ações do vídeo */}
          <div className="video-actions">
            <button
              className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
              {likes?.toLocaleString('pt-BR')}
            </button>
            <button
              className="action-btn comment-btn"
              onClick={() => setShowComments(!showComments)}
            >
              <span className="action-icon">💬</span>
              {comments.length}
            </button>
            <button
              className="action-btn share-btn"
              onClick={handleShare}
            >
              <span className="action-icon">📤</span>
              Compartilhar
            </button>
          </div>

          {/* Seção de comentários */}
          {showComments && (
            <div className="comments-section">
              <h3>Comentários ({comments.length})</h3>

              {/* Novo comentário */}
              {userProfile && (
                <div className="new-comment">
                  <img
                    src={userProfile.avatar_url || 'https://via.placeholder.com/40'}
                    alt={userProfile.name || 'Usuário'}
                    className="comment-avatar"
                  />
                  <div className="comment-input-container">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="comment-input"
                      rows={3}
                    />
                    <div className="comment-actions">
                      <button
                        onClick={() => setNewComment('')}
                        className="cancel-comment-btn"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                        className="submit-comment-btn"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de comentários */}
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.author}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-timestamp">{comment.timestamp}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-actions">
                        <button className="comment-like-btn">
                          👍 {comment.likes}
                        </button>
                        <button className="comment-reply-btn">
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoViewModal;
