/**
 * Página de visualização de posts individuais
 * Implementa routing tipo Twitter/Reddit: /u/:username/status/post_id
 */
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, Flag, MoreHorizontal, X, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePostLike, usePostViews } from '../hooks/usePostLike';
import { PostService } from '../services/content/PostService';
import { VideoService } from '../services/content/VideoService';
import { Sidebar, MobileBottomBar } from '../components/layout';
import RightSidebar from '../components/dashboard/RightSidebar';
import { CommentList } from '../components/content/CommentList';
import type { ContentItem, ContentType } from '../types/content';
import { LikeParticles } from '../components/ContentCard/CardActions';
import '../styles/HomePage.css';
import '../styles/PostViewPage.css';
import '../styles/Comments.css';

// Lazy loading dos componentes para otimização
const Header = React.lazy(() => import('../components/layout/Header'));

/**
 * Componente de loading para componentes em lazy loading
 * Exibe um indicador visual durante o carregamento
 */
const ComponentLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontSize: '14px',
    color: 'var(--color-text-secondary)'
  }}>
    Carregando...
  </div>
);

// Cache global para posts prefetched (compartilhado com ContentCard)
const postCache = new Map<string, ContentItem & { _prefetchedAt?: number }>();

/**
 * Hook personalizado para buscar dados de um post específico
 * @param postId - ID do post
 * @param username - Username do autor (para validação)
 * @returns Estado do post e funções de manipulação
 */
const usePost = (postId: string, username: string) => {
  const [post, setPost] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Primeiro, verifica se o post está no cache de prefetching
        const cacheKey = `${username}-${postId}`;
        const cachedPost = postCache.get(cacheKey);

        if (cachedPost && cachedPost._prefetchedAt &&
            Date.now() - cachedPost._prefetchedAt < 5 * 60 * 1000) {
          // Post encontrado no cache e ainda válido
          setPost(cachedPost);
          setLoading(false);
          // Remove do cache após usar (já foi consumido)
          postCache.delete(cacheKey);
          return;
        }

        const postData = await PostService.getPostById(postId, user?.id);

        // Validar se o username corresponde ao autor do post (usando foreign key direta)
        if (postData.username !== username) {
          throw new Error('Post não encontrado ou username incorreto');
        }

        // Determinar tipo de conteúdo baseado no content_type
        const contentType: ContentType = postData.content_type === 'video' ? 'video' : 'post';

        // Extrair URLs de mídia baseado no tipo
        let mediaUrls: any = {};
        if (postData.media_urls && postData.media_urls.length > 0) {
          if (contentType === 'video') {
            // Para vídeos, extrair video e thumbnail separadamente
            const mediaData = postData.media_urls[0];
            mediaUrls = {
              videoUrl: mediaData.video?.url,
              thumbnail: mediaData.thumbnail?.url || mediaData.video?.url,
              duration: mediaData.video?.metadata?.duration,
              resolution: mediaData.video?.metadata ? `${mediaData.video.metadata.width}x${mediaData.video.metadata.height}` : undefined,
              fileSize: mediaData.video?.metadata?.fileSize
            };
          } else {
            // Para posts
            mediaUrls = {
              thumbnail: postData.media_urls[0],
              mediaUrls: postData.media_urls || []
            };
          }
        }

        // Converter dados do banco para formato ContentItem
        const contentItem: ContentItem = {
          id: postData.id,
          type: contentType,
          title: postData.title,
          author: postData.creator?.display_name || 'Usuário',
          authorAvatar: postData.creator?.profile_image_url || '',
          content: postData.content,
          ...mediaUrls,
          views: postData.views || 0,
          likes: postData.post_likes?.length || 0,
          timestamp: new Date(postData.created_at).toLocaleDateString('pt-BR'),
          accessLevel: postData.is_premium ? 'premium' : 'public',
          communityId: postData.community_id,
          communityName: postData.community?.name,
          communityDisplayName: postData.community?.name,
          communityAvatar: postData.community?.avatar_url,
          creatorId: postData.creator_id
        };

        // Verificar se o usuário atual curtiu o post será feito no useEffect

        setPost(contentItem);
      } catch (err) {
        console.error('Erro ao buscar post:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar post');
      } finally {
        setLoading(false);
      }
    };

    if (postId && username) {
      fetchPost();
    }
  }, [postId, username, user?.id]);

  return { post, loading, error };
};

/**
 * Componente para exibir conteúdo bloqueado (Premium)
 */
const LockedPostContent: React.FC<{ requiredTier?: string }> = ({ requiredTier }) => (
  <div className="locked-content" style={{ 
    padding: '60px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--color-border-medium)',
    margin: '20px 0'
  }}>
    <Lock size={64} className="lock-icon-large" style={{ marginBottom: '20px', color: 'var(--color-text-secondary)' }} />
    <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Conteúdo Exclusivo</h2>
    <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)', maxWidth: '500px' }}>
      Este post é exclusivo para apoiadores do nível <strong>{requiredTier || 'Premium'}</strong>. 
      Assine para ter acesso a este e outros conteúdos exclusivos.
    </p>
    <button 
      className="unlock-button"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '9999px',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }}
      onClick={() => console.log('Navigate to subscribe')}
    >
      Assinar para Desbloquear
    </button>
  </div>
);

/**
 * Componente VideoPlayer
 * Player de vídeo customizado com controles
 */
interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const youtubeId = VideoService.getYouTubeId(src);

  if (youtubeId) {
    return (
      <div className="post-video-container" style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        <iframe
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="post-video-container">
      <video
        className="post-video"
        src={src}
        poster={poster}
        controls={true}
        preload="metadata"
      />
    </div>
  );
};

/**
 * Componente principal da página de visualização de posts
 * Implementa layout responsivo com navegação e engajamento
 */
const PostViewPage: React.FC = () => {
  const { username, postId } = useParams<{ username: string; postId: string; communityName?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { post, loading, error } = usePost(postId!, username!);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalMenuOpen, setIsModalMenuOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showModalParticles, setShowModalParticles] = useState(false);

  // Hooks para likes e visualizações
  const { liked, likeCount, isLoading: likeLoading, toggleLike } = usePostLike({
    postId: postId || '',
    initialLiked: false,
    initialLikeCount: post?.likes || 0,
    currentLikeCount: post?.likes
  });

  const { viewCount, incrementView } = usePostViews({
    initialViews: post?.views || 0,
    currentViews: post?.views
  });

  const [isBookmarked, setIsBookmarked] = useState(false);

  // Incrementar visualização quando o post é carregado (apenas na primeira vez)
  useEffect(() => {
    if (post && postId && !loading) {
      incrementView(postId);
    }
  }, [post, postId, incrementView, loading]);

  // Verificar se deve abrir o modal de imagem automaticamente
  useEffect(() => {
    if (location.state && (location.state as any).openImage && post?.thumbnail) {
      setIsImageModalOpen(true);
      setSelectedImageIndex(0);
      // Limpar o state para não reabrir ao navegar
      window.history.replaceState({}, document.title);
    }
  }, [location.state, post?.thumbnail]);

  /**
   * Handler para voltar à página anterior
   */
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  /**
   * Handler personalizado para like que inclui efeito de partículas
   */
  const handleLike = (isModal = false) => {
    const wasLiked = liked;

    // Disparar efeito de particulas apenas quando está dando like (não removendo)
    if (!wasLiked && !likeLoading) {
      if (isModal) {
        setShowModalParticles(true);
      } else {
        setShowParticles(true);
      }
    }

    // Chamar handler original
    toggleLike();
  };

  /**
   * Handler para compartilhar o post
   */
  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: `Confira este post: ${post?.title}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      // TODO: Mostrar toast de confirmação
    }
  };

  /**
   * Handler para salvar/remover dos favoritos
   */
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implementar API de bookmarks
  };

  /**
   * Handler para denunciar post
   */
  const handleReport = () => {
    // TODO: Implementar modal de denúncia
    console.log('Reportar post:', postId);
  };

  /**
   * Handler para editar post
   */
  const handleEdit = () => {
    // TODO: Implementar navegação para página de edição
    console.log('Editar post:', postId);
  };

  /**
   * Handler para excluir post
   */
  const handleDelete = () => {
    // TODO: Implementar modal de confirmação e API de exclusão
    console.log('Excluir post:', postId);
  };

  /**
   * Handler para clique no menu
   */
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Handler para fechar menu quando clicar fora
   */
  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Verificar se o usuário atual é o autor do post
  const isAuthor = user?.id === post?.creatorId;

  /**
   * Renderiza estado de loading
   */
  if (loading) {
    return (
      <div className="post-view-page">
        <div className="post-view-page-container">
          <div className="post-view-loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando post...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de erro
   */
  if (error) {
    return (
      <div className="post-view-page">
        <div className="post-view-page-container">
          <div className="post-view-error-state">
            <h2>Post não encontrado</h2>
            <p>{error}</p>
            <button onClick={handleBack} className="post-view-back-button">
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado quando post não existe
   */
  if (!post) {
    return (
      <div className="post-view-page">
        <div className="post-view-page-container">
          <div className="post-view-error-state">
            <h2>Post não encontrado</h2>
            <p>O post que você está procurando não existe ou foi removido.</p>
            <button onClick={handleBack} className="post-view-back-button">
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page post-view-page">
      <div className="dashboard-sidebar">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="dashboard-main-content">
        <Suspense fallback={<ComponentLoader />}>
          <Header
            className="dashboard-header"
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </Suspense>
        
        <div className="dashboard-layout">
          {/* Conteúdo principal do post */}
          <div className="dashboard-feed-container">
            <div className="post-view-main">
              <div className="post-view-page-container">
                {/* Header com navegação */}
                <header className="post-view-header">
                  <div className="breadcrumb">
                    <ArrowLeft size={16} className="breadcrumb-arrow" onClick={handleBack} />
                    <Link to="/dashboard" className="breadcrumb-link" onClick={handleBack}>Início</Link>
                    <span className="breadcrumb-separator">›</span>
                    {post.communityId && (
                      <>
                        <Link to={`/r/${post.communityName}`} className="breadcrumb-link">
                          r/{post.communityDisplayName || post.communityName}
                        </Link>
                        <span className="breadcrumb-separator">›</span>
                      </>
                    )}
                    <Link to={`/u/${username}`} className="breadcrumb-link">
                      u/{username}
                    </Link>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">Post</span>
                  </div>
                </header>

                {/* Conteúdo principal do post */}
                <main className="post-view-content">
                  <article className="post-article">
                    {/* Header do post */}
                    <header className="post-header">
                      <div className="author-info">
                        <img
                          src={post.authorAvatar || '/default-avatar.png'}
                          alt={post.author}
                          className="author-avatar"
                          loading="lazy"
                        />
                        <div className="author-details">
                          <Link to={`/u/${username}`} className="author-name">
                            {post.author}
                          </Link>
                          <span className="post-timestamp">{post.timestamp}</span>
                        </div>
                      </div>

                      {/* Menu de opções */}
                      <div className="post-menu">
                        <div className="post-menu-container">
                          <button
                            className="post-view-menu-button"
                            onClick={handleMenuClick}
                            aria-label="Mais opções"
                            aria-expanded={isMenuOpen}
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="post-menu-dropdown">
                              <button
                                className="post-menu-item"
                                onClick={() => {
                                  handleShare();
                                  handleMenuClose();
                                }}
                              >
                                <Share size={16} />
                                <span>Compartilhar</span>
                              </button>

                              <button
                                className="post-menu-item"
                                onClick={() => {
                                  handleBookmark();
                                  handleMenuClose();
                                }}
                              >
                                <Bookmark size={16} />
                                <span>{isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}</span>
                              </button>

                              {isAuthor && (
                                <>
                                  <button
                                    className="post-menu-item"
                                    onClick={() => {
                                      handleEdit();
                                      handleMenuClose();
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    className="post-menu-item delete-item"
                                    onClick={() => {
                                      handleDelete();
                                      handleMenuClose();
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 6h18"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                      <line x1="10" y1="11" x2="10" y2="17"/>
                                      <line x1="14" y1="11" x2="14" y2="17"/>
                                    </svg>
                                    <span>Excluir</span>
                                  </button>
                                </>
                              )}

                              <button
                                className="post-menu-item report-item"
                                onClick={() => {
                                  handleReport();
                                  handleMenuClose();
                                }}
                              >
                                <Flag size={16} />
                                <span>Denunciar</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Overlay para fechar menu ao clicar fora */}
                        {isMenuOpen && (
                          <div
                            className="post-menu-overlay"
                            onClick={handleMenuClose}
                          />
                        )}
                      </div>
                    </header>

                    {/* Título e conteúdo */}
                    <div className="post-view-body">
                      {post.isLocked ? (
                        <>
                          <h1 className="post-title">{post.title}</h1>
                          <LockedPostContent requiredTier={post.requiredTier} />
                        </>
                      ) : post.type === 'video' && post.videoUrl ? (
                        <>
                          <VideoPlayer
                            src={post.videoUrl}
                            poster={post.thumbnail}
                          />

                          <div className="video-info-section">
                            <h1 className="post-title">{post.title}</h1>

                            {post.content && (
                              <div className="post-text">
                                {post.content.split('\n').map((paragraph, index) => (
                                  <p key={index}>{paragraph}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        /* Para posts não-vídeos: manter estrutura original */
                        <>
                          <h1 className="post-title">{post.title}</h1>

                          {post.content && (
                            <div className="post-text">
                              {post.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                              ))}
                            </div>
                          )}

                          {/* Mídia do post - imagens */}
                          {(post.mediaUrls && post.mediaUrls.length > 0) ? (
                            <div className="post-images-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {post.mediaUrls.map((url, index) => (
                                <div key={index} className="post-image-container">
                                  <img
                                    src={url}
                                    alt={`${post.title} - ${index + 1}`}
                                    className="post-image clickable-image"
                                    loading="lazy"
                                    onClick={() => {
                                      setSelectedImageIndex(index);
                                      setIsImageModalOpen(true);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : post.thumbnail ? (
                            <div className="post-image-container">
                              <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="post-image clickable-image"
                                loading="lazy"
                                onClick={() => {
                                  setSelectedImageIndex(0);
                                  setIsImageModalOpen(true);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>

                    {/* Informações da comunidade - agora inline com o autor */}
                    {post.communityId && (
                      <div className="post-view-community-info">
                        <Link to={`/r/${post.communityName}`} className="community-link">
                          {post.communityAvatar && (
                            <img
                              src={post.communityAvatar}
                              alt={post.communityDisplayName || post.communityName}
                              className="community-avatar"
                            />
                          )}
                          <span>r/{post.communityDisplayName || post.communityName}</span>
                        </Link>
                      </div>
                    )}

                    {/* Ações do post */}
                    <footer className="post-actions">
                      <div className="action-buttons">
                        <div className="like-btn-container-post-view">
                          <LikeParticles show={showParticles} />
                          <button
                            onClick={() => handleLike(false)}
                            className={`post-view-action-button like-button ${liked ? 'liked' : ''} ${likeLoading ? 'loading' : ''}`}
                            disabled={likeLoading}
                            aria-label={liked ? 'Descurtir' : 'Curtir'}
                          >
                            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                            <span className="action-count">{likeCount}</span>
                          </button>
                        </div>

                        <button className="post-view-action-button comment-button" aria-label="Comentar">
                          <MessageCircle size={18} />
                          <span className="action-count">0</span>
                        </button>

                        <button
                          onClick={handleShare}
                          className="post-view-action-button share-button"
                          aria-label="Compartilhar"
                        >
                          <Share size={18} />
                        </button>

                        <button
                          onClick={handleBookmark}
                          className={`post-view-action-button bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                          aria-label={isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                        >
                          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          onClick={handleReport}
                          className="post-view-action-button report-button"
                          aria-label="Denunciar"
                        >
                          <Flag size={18} />
                        </button>
                      </div>

                      {/* Estatísticas */}
                      <div className="post-stats">
                        <span className="views-count">{viewCount?.toLocaleString('pt-BR')} visualizações</span>
                      </div>
                    </footer>
                  </article>

                  {/* Seção de comentários */}
                  <CommentList postId={postId!} />
                </main>
              </div>
            </div>
          </div>

          <div className="dashboard-right-sidebar-container">
            <RightSidebar communityName={post.communityName} />
          </div>
        </div>
      </div>

      <MobileBottomBar />

      {/* Modal de imagem ampliada - Layout Focado (Twitter-like) */}
      {isImageModalOpen && (post.mediaUrls?.length || post.thumbnail) && (
        <div className="image-modal-overlay">
          <div className="image-modal-container">
            {/* Painel Esquerdo: Mídia */}
            <div 
              className="image-modal-media"
              onClick={() => setIsImageModalOpen(false)}
              style={{ position: 'relative' }}
            >
              <button
                className="image-modal-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageModalOpen(false);
                }}
                aria-label="Fechar visualização"
              >
                <X size={24} />
              </button>
              
              {/* Navigation Arrows */}
              {post.mediaUrls && post.mediaUrls.length > 1 && (
                <>
                  <button
                    className="image-nav-prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : post.mediaUrls!.length - 1));
                    }}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    ‹
                  </button>
                  <button
                    className="image-nav-next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev < post.mediaUrls!.length - 1 ? prev + 1 : 0));
                    }}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              <img
                src={post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[selectedImageIndex] : post.thumbnail}
                alt={`${post.title} - ${selectedImageIndex + 1}`}
                className="image-modal-image"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Painel Direito: Sidebar de Conteúdo */}
            <div className="image-modal-sidebar">
              <div className="image-modal-sidebar-content">
                {/* Header do Post na Sidebar */}
                <header className="post-header">
                  <div className="author-info">
                    <img
                      src={post.authorAvatar || '/default-avatar.png'}
                      alt={post.author}
                      className="author-avatar"
                    />
                    <div className="author-details">
                      <div className="author-meta">
                        <Link to={`/u/${username}`} className="author-name">
                          {post.author}
                        </Link>
                        {post.communityId && (
                          <Link to={`/r/${post.communityName}`} className="community-flair">
                            {post.communityAvatar && (
                              <img 
                                src={post.communityAvatar} 
                                alt="" 
                                className="community-avatar-small"
                              />
                            )}
                            <span className="community-prefix">r/</span>
                            <span className="community-name-small">{post.communityDisplayName || post.communityName}</span>
                          </Link>
                        )}
                      </div>
                      <span className="post-timestamp">{post.timestamp}</span>
                    </div>
                  </div>

                  {/* Menu na Sidebar */}
                  <div className="post-menu">
                    <div className="post-menu-container">
                      <button
                        className="post-view-menu-button"
                        onClick={() => setIsModalMenuOpen(!isModalMenuOpen)}
                        aria-label="Mais opções"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {isModalMenuOpen && (
                        <>
                          <div className="post-menu-dropdown">
                            <button className="post-menu-item" onClick={() => { handleShare(); setIsModalMenuOpen(false); }}>
                              <Share size={16} />
                              <span>Compartilhar</span>
                            </button>
                            <button className="post-menu-item" onClick={() => { handleBookmark(); setIsModalMenuOpen(false); }}>
                              <Bookmark size={16} />
                              <span>{isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}</span>
                            </button>
                            {isAuthor && (
                              <button className="post-menu-item delete-item" onClick={() => { handleDelete(); setIsModalMenuOpen(false); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                <span>Excluir</span>
                              </button>
                            )}
                            <button className="post-menu-item report-item" onClick={() => { handleReport(); setIsModalMenuOpen(false); }}>
                              <Flag size={16} />
                              <span>Denunciar</span>
                            </button>
                          </div>
                          <div className="post-menu-overlay" onClick={() => setIsModalMenuOpen(false)} />
                        </>
                      )}
                    </div>
                  </div>
                </header>

                {/* Conteúdo do Post na Sidebar */}
                <div className="post-view-body">
                  <h1 className="post-title">{post.title}</h1>
                  {post.content && (
                    <div className="post-text">
                      {post.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ações na Sidebar */}
                <div className="post-actions">
                  <div className="action-buttons">
                    <div className="like-btn-container-post-view">
                      <LikeParticles show={showModalParticles} />
                      <button
                        onClick={() => handleLike(true)}
                        className={`post-view-action-button like-button ${liked ? 'liked' : ''} ${likeLoading ? 'loading' : ''}`}
                        disabled={likeLoading}
                      >
                        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                        <span className="action-count">{likeCount}</span>
                      </button>
                    </div>

                    <button className="post-view-action-button comment-button">
                      <MessageCircle size={18} />
                      <span className="action-count">0</span>
                    </button>

                    <button onClick={handleShare} className="post-view-action-button share-button">
                      <Share size={18} />
                    </button>

                    <button 
                      onClick={handleBookmark} 
                      className={`post-view-action-button bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                    >
                      <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  
                  <div className="post-stats">
                    <span className="views-count">{viewCount?.toLocaleString('pt-BR')} visualizações</span>
                  </div>
                </div>

                {/* Comentários na Sidebar */}
                <div className="comments-section">
                  <CommentList postId={postId!} className="modal-comments" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostViewPage;
