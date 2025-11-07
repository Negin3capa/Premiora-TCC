/**
 * Página de visualização de posts individuais
 * Implementa routing tipo Twitter/Reddit: /u/:username/status/post_id
 */
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, Flag, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PostService } from '../services/content/PostService';
import { Sidebar, MobileBottomBar, FeedSidebar } from '../components/layout';
import type { ContentItem } from '../types/content';
import '../styles/PostViewPage.css';

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

        // Validar se o username corresponde ao autor do post
        const actualUsername = postData.creator?.users?.username;
        const displayNameSlug = postData.creator?.display_name?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').substring(0, 20);

        if (actualUsername !== username && displayNameSlug !== username) {
          throw new Error('Post não encontrado ou username incorreto');
        }

        // Converter dados do banco para formato ContentItem
        const contentItem: ContentItem = {
          id: postData.id,
          type: 'post',
          title: postData.title,
          author: postData.creator?.display_name || 'Usuário',
          authorAvatar: postData.creator?.profile_image_url || '',
          content: postData.content,
          thumbnail: postData.media_urls?.[0],
          views: postData.views || 0,
          likes: postData.post_likes?.length || 0,
          timestamp: new Date(postData.created_at).toLocaleDateString('pt-BR'),
          accessLevel: postData.is_premium ? 'premium' : 'public',
          communityId: postData.community_id,
          communityName: postData.community?.name,
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
 * Componente principal da página de visualização de posts
 * Implementa layout responsivo com navegação e engajamento
 */
const PostViewPage: React.FC = () => {
  const { username, postId } = useParams<{ username: string; postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, loading, error } = usePost(postId!, username!);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Atualizar estado local quando o post for carregado
  useEffect(() => {
    if (post) {
      // Verificar se o usuário atual curtiu o post baseado nos dados retornados
      const userLiked = (post.likes || 0) > 0; // Simplificação - em produção, verificar na API
      setIsLiked(userLiked);
      setLikesCount(post.likes || 0);
    }
  }, [post]);

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
   * Handler para curtir/descurtir o post
   */
  const handleLike = async () => {
    if (!user || !post) return;

    try {
      // TODO: Implementar API de like
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      // Atualizar contador de likes
      setLikesCount(prev => prev + (newLikedState ? 1 : -1));
    } catch (err) {
      console.error('Erro ao curtir post:', err);
    }
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
   * Renderiza estado de loading
   */
  if (loading) {
    return (
      <div className="post-view-page">
        <div className="post-view-container">
          <div className="loading-state">
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
        <div className="post-view-container">
          <div className="error-state">
            <h2>Post não encontrado</h2>
            <p>{error}</p>
            <button onClick={handleBack} className="back-button">
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
        <div className="post-view-container">
          <div className="error-state">
            <h2>Post não encontrado</h2>
            <p>O post que você está procurando não existe ou foi removido.</p>
            <button onClick={handleBack} className="back-button">
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Suspense fallback={<ComponentLoader />}>
          <Header />
        </Suspense>
        <div className="post-view-page">
          <div className="post-view-container">
            {/* Header com navegação */}
            <header className="post-view-header">
              <div className="breadcrumb">
                <ArrowLeft size={16} className="breadcrumb-arrow" />
                <Link to="/dashboard" className="breadcrumb-link" onClick={handleBack}>Início</Link>
                <span className="breadcrumb-separator">›</span>
                {post.communityId && (
                  <>
                    <Link to={`/r/${post.communityName}`} className="breadcrumb-link">
                      r/{post.communityName}
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
            <main className="post-content">
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
                    <button className="menu-button" aria-label="Mais opções">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </header>

                {/* Título e conteúdo */}
                <div className="post-body">
                  <h1 className="post-title">{post.title}</h1>

                  {post.content && (
                    <div className="post-text">
                      {post.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {/* Imagem do post */}
                  {post.thumbnail && (
                    <div className="post-image-container">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="post-image"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Informações da comunidade */}
                {post.communityId && (
                  <div className="community-info">
                    <Link to={`/r/${post.communityName}`} className="community-link">
                      {post.communityAvatar && (
                        <img
                          src={post.communityAvatar}
                          alt={post.communityName}
                          className="community-avatar"
                        />
                      )}
                      <span>r/{post.communityName}</span>
                    </Link>
                  </div>
                )}

                {/* Ações do post */}
                <footer className="post-actions">
                  <div className="action-buttons">
                    <button
                      onClick={handleLike}
                      className={`action-button like-button ${isLiked ? 'liked' : ''}`}
                      aria-label={isLiked ? 'Descurtir' : 'Curtir'}
                    >
                      <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                      <span className="action-count">{likesCount}</span>
                    </button>

                    <button className="action-button comment-button" aria-label="Comentar">
                      <MessageCircle size={18} />
                      <span className="action-count">0</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="action-button share-button"
                      aria-label="Compartilhar"
                    >
                      <Share size={18} />
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`action-button bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                      aria-label={isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    >
                      <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      onClick={handleReport}
                      className="action-button report-button"
                      aria-label="Denunciar"
                    >
                      <Flag size={18} />
                    </button>
                  </div>

                  {/* Estatísticas */}
                  <div className="post-stats">
                    <span className="views-count">{post.views?.toLocaleString('pt-BR')} visualizações</span>
                  </div>
                </footer>
              </article>

              {/* Seção de comentários (placeholder) */}
              <section className="comments-section">
                <h3>Comentários</h3>
                <div className="comments-placeholder">
                  <p>Comentários serão implementados em breve.</p>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
      <FeedSidebar />
      <MobileBottomBar />
    </div>
  );
};

export default PostViewPage;
