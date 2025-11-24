/**
 * Componente ContentCard
 * Card de conteúdo que exibe posts, vídeos e perfis com prefetching
 */
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pin, Lock } from 'lucide-react';
import '../../styles/ContentCard.css';
import { useAuth } from '../../hooks/useAuth';
import { usePostLike, usePostViews } from '../../hooks/usePostLike';
import { PostService } from '../../services/content/PostService';
import type { ContentItem } from '../../types/content';
import { PostCard, VideoCard, ProfileCard, CardActions } from './index';
import { isCommunityAdmin, togglePinPost } from '../../utils/communityUtils';

// Importa cache global compartilhado com PostViewPage
// Cache global para posts prefetched
const postCache = new Map<string, ContentItem & { _prefetchedAt?: number }>();
const prefetchTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Hook personalizado para prefetching de posts
 * Pré-carrega dados do post quando o usuário interage com o card
 */
const usePostPrefetch = () => {
  const { user } = useAuth();

  /**
   * Inicia prefetching do post após delay para evitar requests desnecessários
   */
  const prefetchPost = useCallback((postId: string, username: string) => {
    const cacheKey = `${username}-${postId}`;

    // Se já está no cache, não faz nada
    if (postCache.has(cacheKey)) {
      return;
    }

    // Cancela timeout anterior se existir
    if (prefetchTimeouts.has(cacheKey)) {
      clearTimeout(prefetchTimeouts.get(cacheKey)!);
    }

    // Inicia prefetching após 100ms de delay
    const timeoutId = setTimeout(async () => {
      try {
        const postData = await PostService.getPostById(postId, user?.id);

        // Validar se o username corresponde (usando foreign key direta)
        if (postData.username !== username) {
          return; // Username não corresponde, não cacheia
        }

        // Converter dados para ContentItem
        const contentItem: ContentItem = {
          id: postData.id,
          type: 'post',
          title: postData.title,
          author: postData.creator?.display_name || 'Usuário',
          authorAvatar: postData.creator?.profile_image_url || '',
          content: postData.content,
          thumbnail: postData.media_urls?.[0],
          mediaUrls: postData.media_urls || [],
          views: postData.views || 0,
          likes: postData.post_likes?.length || 0,
          timestamp: new Date(postData.created_at).toLocaleDateString('pt-BR'),
          accessLevel: postData.is_premium ? 'premium' : 'public',
          communityId: postData.community_id,
          communityName: postData.community?.name,
          communityAvatar: postData.community?.avatar_url,
          creatorId: postData.creator_id
        };

        // Armazenar no cache com timestamp
        postCache.set(cacheKey, {
          ...contentItem,
          _prefetchedAt: Date.now()
        });

        // Limpar cache após 5 minutos
        setTimeout(() => {
          postCache.delete(cacheKey);
        }, 5 * 60 * 1000);

      } catch (error) {
        // Silenciosamente ignora erros de prefetching
        console.debug('Prefetch failed:', error);
      }
    }, 100);

    prefetchTimeouts.set(cacheKey, timeoutId);
  }, [user?.id]);

  /**
   * Cancela prefetching se o usuário sair do card
   */
  const cancelPrefetch = useCallback((postId: string, username: string) => {
    const cacheKey = `${username}-${postId}`;
    const timeoutId = prefetchTimeouts.get(cacheKey);

    if (timeoutId) {
      clearTimeout(timeoutId);
      prefetchTimeouts.delete(cacheKey);
    }
  }, []);

  /**
   * Obtém post do cache se disponível
   */
  const getCachedPost = useCallback((postId: string, username: string): ContentItem | null => {
    const cacheKey = `${username}-${postId}`;
    const cached = postCache.get(cacheKey);

    if (cached && cached._prefetchedAt) {
      // Verifica se o cache não expirou (5 minutos)
      if (Date.now() - cached._prefetchedAt < 5 * 60 * 1000) {
        return cached;
      } else {
        // Remove cache expirado
        postCache.delete(cacheKey);
      }
    }

    return null;
  }, []);

  return { prefetchPost, cancelPrefetch, getCachedPost };
};

interface ContentCardProps {
  item: ContentItem;
}

/**
 * Componente para exibir conteúdo bloqueado (Premium)
 */
const LockedContent: React.FC<{ item: ContentItem }> = ({ item }) => (
  <div className="locked-content">
    <div className="locked-overlay">
      <Lock size={48} className="lock-icon-large" />
      <h3>Conteúdo Exclusivo</h3>
      <p>Este post é exclusivo para apoiadores do nível <strong>{item.requiredTier || 'Premium'}</strong>.</p>
      <button className="unlock-button" onClick={(e) => {
        e.stopPropagation();
        // Navegar para página de assinatura ou modal
        // TODO: Implementar navegação para assinatura
        console.log('Navigate to subscribe');
      }}>
        Assinar para Desbloquear
      </button>
    </div>
  </div>
);

/**
 * Card de conteúdo reutilizável para diferentes tipos de mídia
 * Suporta: posts, vídeos e perfis de criadores
 */
const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { prefetchPost, cancelPrefetch } = usePostPrefetch();
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Check if user is admin of the community
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (item.communityId && user?.id) {
        const admin = await isCommunityAdmin(item.communityId, user.id);
        setIsAdmin(admin);
      }
    };
    checkAdmin();
  }, [item.communityId, user?.id]);

  const handleTogglePin = async () => {
    if (item.id) {
      const success = await togglePinPost(item.id);
      if (success !== null) {
        // Close menu
        setShowMenu(false);
        // Reload to show changes (temporary solution until we have better state management)
        window.location.reload();
      }
    }
  };

  // Hooks para likes e visualizações
  const { liked, likeCount, isLoading: likeLoading, toggleLike } = usePostLike({
    postId: item.id,
    initialLiked: false,
    initialLikeCount: item.likes || 0,
    currentLikeCount: item.likes
  });

  const { incrementView } = usePostViews();

  // Criar item atualizado com os valores mais recentes
  const updatedItem = {
    ...item,
    likes: likeCount
  };

  /**
   * Handler para visualizar post detalhado - navega para página dedicada
   */
  const handleViewPost = () => {
    // Se estiver bloqueado, não navegar
    if (item.isLocked) {
      return;
    }

    if ((item.type === 'post' || item.type === 'video') && item.id) {
      // Incrementar visualização
      incrementView(item.id);

      // Usar authorUsername se disponível, senão tentar usar author como fallback
      const username = item.authorUsername || item.author?.toLowerCase().replace(/\s+/g, '') || 'usuario';

      // Se o post for de uma comunidade, usar URL específica de comunidade
      if (item.communityId && item.communityName) {
        navigate(`/r/${item.communityName}/u/${username}/status/${item.id}`);
      } else {
        navigate(`/u/${username}/status/${item.id}`);
      }
    }
  };

  /**
   * Handler para clique na imagem - navega com estado para abrir modal
   */
  const handleImageClick = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation();
    if (item.id) {
      incrementView(item.id);
      const username = item.authorUsername || item.author?.toLowerCase().replace(/\s+/g, '') || 'usuario';
      const path = item.communityId && item.communityName 
        ? `/r/${item.communityName}/u/${username}/status/${item.id}`
        : `/u/${username}/status/${item.id}`;
        
      navigate(path, { state: { openImage: true, imageIndex: index || 0 } });
    }
  };

  /**
   * Handler para curtir conteúdo
   */
  const handleLike = async () => {
    if (item.type === 'post' || item.type === 'video') {
      await toggleLike();
    }
  };

  /**
   * Handler para compartilhar conteúdo
   */
  const handleShare = () => {
    console.log(`Shared ${item.title}`);
    // TODO: Implementar lógica de compartilhamento
  };

  /**
   * Handler para abrir comentários
   */
  const handleComment = () => {
    console.log(`Opening comments for ${item.title}`);
    // TODO: Implementar modal de comentários
  };

  /**
   * Handler para navegar para o perfil do usuário
   */
  const handleProfileClick = () => {
    if (item.authorUsername) {
      navigate(`/u/${item.authorUsername}`);
    } else {
      // Fallback: tentar usar o nome do autor como username
      const fallbackUsername = item.author?.toLowerCase().replace(/\s+/g, '') || 'usuario';
      navigate(`/u/${fallbackUsername}`);
    }
  };

  /**
   * Handler para mouse enter - inicia prefetching
   */
  const handleMouseEnter = () => {
    if (item.type === 'post' && item.id && item.authorUsername) {
      // Usar apenas o username da tabela users
      prefetchPost(item.id, item.authorUsername);
    }
  };

  /**
   * Handler para mouse leave - cancela prefetching
   */
  const handleMouseLeave = () => {
    if (item.type === 'post' && item.id && item.authorUsername) {
      // Usar apenas o username da tabela users
      cancelPrefetch(item.id, item.authorUsername);
    }
  };

  /**
   * Renderiza o conteúdo específico baseado no tipo usando componentes especializados
   */
  const renderContentSpecific = () => {
    // Se o conteúdo estiver bloqueado, exibir overlay de bloqueio
    if (item.isLocked) {
      return <LockedContent item={item} />;
    }

    switch (item.type) {
      case 'profile':
        return <ProfileCard item={item} onFollow={() => console.log('Follow clicked')} />;

      case 'video':
        return <VideoCard item={item} />;

      case 'post':
        // PostCard onClick já é tratado pelo container pai, mas mantemos para garantir
        // onImageClick para navegação com foco
        return <PostCard item={item} onImageClick={handleImageClick} />;

      default:
        return null;
    }
  };

  return (
    <>
      <article
        className={`content-card ${item.type}-card`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleViewPost}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-header">
          <div className="author-info">
            {item.authorAvatar ? (
              <img
                src={item.authorAvatar}
                alt={item.author}
                className="author-avatar"
                loading="lazy"
              />
            ) : (
              <div className="author-avatar-placeholder">
                {item.author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="author-details">
              <div className="author-meta">
                <Link
                  to={item.authorUsername ? `/u/${item.authorUsername}` : `/u/${item.author?.toLowerCase().replace(/\s+/g, '') || 'usuario'}`}
                  className="author-name"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick();
                  }}
                >
                  {item.author}
                </Link>
                {item.isPinned && (
                  <span className="pinned-badge" title="Post fixado">
                    <Pin size={12} className="pinned-icon" />
                    <span className="pinned-text">Fixado</span>
                  </span>
                )}
                {item.communityId && (
                  <Link 
                    to={`/r/${item.communityName}`} 
                    className="community-flair"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.communityAvatar && (
                      <img
                        src={item.communityAvatar}
                        alt={item.communityDisplayName || item.communityName}
                        className="community-avatar-small"
                      />
                    )}
                    <span className="community-name-small">
                      <span className="community-prefix">r/</span>
                      {item.communityName}
                    </span>
                  </Link>
                )}
                {item.flair && (
                  <span 
                    className="post-flair-badge" 
                    style={{ 
                      color: item.flair.color, 
                      backgroundColor: item.flair.backgroundColor,
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    {item.flair.text}
                  </span>
                )}
              </div>
              <span className="content-type">{item.type}</span>
            </div>
          </div>

          <div className="card-menu-container" style={{ position: 'relative' }}>
            <button
              className="card-menu"
              aria-label="Mais opções"
              title="Mais opções"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ⋯
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                {isAdmin && (
                  <button 
                    className="menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin();
                    }}
                  >
                    <Pin size={14} />
                    {item.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
                  </button>
                )}
                <button className="menu-item">Denunciar</button>
              </div>
            )}
          </div>
        </div>

        <div className="card-content">
          {renderContentSpecific()}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
        <CardActions
            item={updatedItem}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            liked={liked}
            isLoading={likeLoading}
          />
        </div>
      </article>
    </>
  );
};

export default ContentCard;
