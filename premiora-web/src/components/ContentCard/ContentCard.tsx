/**
 * Componente ContentCard
 * Card de conteúdo que exibe posts, vídeos e perfis com prefetching
 */
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/ContentCard.css';
import { useAuth } from '../../hooks/useAuth';
import { PostService } from '../../services/content/PostService';
import type { ContentItem } from '../../types/content';
import { VideoViewModal } from '../modals';
import { PostCard, VideoCard, ProfileCard, CardActions } from './index';

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
 * Card de conteúdo reutilizável para diferentes tipos de mídia
 * Suporta: posts, vídeos e perfis de criadores
 */
const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { prefetchPost, cancelPrefetch } = usePostPrefetch();

  /**
   * Handler para visualizar post detalhado - navega para página dedicada
   */
  const handleViewPost = () => {
    if (item.type === 'post' && item.id) {
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
   * Handler para reproduzir vídeo - redireciona para página de visualização
   */
  const handlePlay = () => {
    if (item.type === 'video' && item.id && item.authorUsername) {
      // Redirecionar para página de visualização do vídeo
      navigate(`/u/${item.authorUsername}/status/${item.id}`);
    }
  };

  /**
   * Handler para fechar modal do vídeo
   */
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  /**
   * Handler para curtir conteúdo
   */
  const handleLike = () => {
    console.log(`Liked ${item.title}`);
    // TODO: Implementar lógica de like com API
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
    switch (item.type) {
      case 'profile':
        return <ProfileCard item={item} onFollow={() => console.log('Follow clicked')} />;

      case 'video':
        return <VideoCard item={item} onPlay={handlePlay} />;

      case 'post':
        return <PostCard item={item} onClick={handleViewPost} />;

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
                {item.communityId && (
                  <Link to={`/r/${item.communityName}`} className="community-flair">
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
              </div>
              <span className="content-type">{item.type}</span>
            </div>
          </div>

          <button
            className="card-menu"
            aria-label="Mais opções"
            title="Mais opções"
          >
            ⋯
          </button>
        </div>

        <div className="card-content">
          {renderContentSpecific()}
        </div>

        <CardActions
          item={item}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      </article>

      <VideoViewModal
        item={isVideoModalOpen ? item : null}
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        userTier={userProfile?.tier}
      />
    </>
  );
};

export default ContentCard;
