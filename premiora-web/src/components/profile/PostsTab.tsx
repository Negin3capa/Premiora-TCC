import React, { useState, useEffect, useCallback } from 'react';
import { FeedService } from '../../services/content/FeedService';
import { extractThumbnailUrl } from '../../utils/mediaUtils';
import type { ContentItem } from '../../types/content';
import type { CreatorProfile } from '../../types/profile';
import { Filter, Lock, Unlock } from 'lucide-react';
import '../../styles/PostsTab.css';

/**
 * Props do componente PostsTab
 */
interface PostsTabProps {
  /** Perfil do criador */
  creatorProfile: CreatorProfile;
  /** ID do usuário atual (para controle de acesso) */
  currentUserId?: string;
}

/**
 * Tipos de filtro para posts
 */
type PostFilter = 'all' | 'free' | 'premium';

/**
 * Componente PostsTab - Aba de posts do perfil
 * Exibe posts do criador com filtros por tipo (todos, gratuitos, premium)
 */
const PostsTab: React.FC<PostsTabProps> = ({ creatorProfile, currentUserId }) => {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostFilter>('all');

  /**
   * Busca posts do criador com filtro aplicado
   */
  const fetchPosts = useCallback(async (cursor: string | null = null, filter: PostFilter = 'all') => {
    if (!creatorProfile?.user?.id) return;

    try {
      setLoading(true);

      // Buscar posts do criador
      const result = await FeedService.getCreatorPosts(
        creatorProfile.user.id,
        1,
        20,
        currentUserId
      );

      if (result.posts && result.posts.length > 0) {
        // Converter posts para formato ContentItem
        const formattedPosts: ContentItem[] = result.posts.map((post: any) => {
          // Extrair informações de mídia
          const mediaUrls = post.media_urls || [];
          const firstMedia = mediaUrls[0];
          const thumbnailUrl = firstMedia ? extractThumbnailUrl(firstMedia) || 'placeholder' : 'placeholder';

          return {
            id: post.id,
            type: 'post' as const,
            title: post.title,
            content: post.content,
            thumbnail: thumbnailUrl,
            author: creatorProfile.user?.name || creatorProfile.user?.username || 'Usuário',
            authorUsername: creatorProfile.user?.username,
            authorAvatar: creatorProfile.avatar_url || creatorProfile.user?.avatar_url || '',
            views: post.views || 0,
            likes: post.post_likes?.length || 0,
            timestamp: post.published_at,
            isLocked: post.is_premium,
            creatorId: creatorProfile.user?.id
          };
        });

        // Aplicar filtro
        const filteredPosts = applyFilter(formattedPosts, filter);

        if (cursor) {
          // Adicionar aos posts existentes
          setPosts(prev => [...prev, ...filteredPosts]);
        } else {
          // Substituir posts
          setPosts(filteredPosts);
        }

        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor || null);
      } else {
        setPosts([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [creatorProfile, currentUserId]);

  /**
   * Aplica filtro aos posts
   */
  const applyFilter = (posts: ContentItem[], filter: PostFilter): ContentItem[] => {
    switch (filter) {
      case 'free':
        return posts.filter(post => !post.isLocked);
      case 'premium':
        return posts.filter(post => post.isLocked);
      case 'all':
      default:
        return posts;
    }
  };

  /**
   * Handler para mudança de filtro
   */
  const handleFilterChange = (filter: PostFilter) => {
    setActiveFilter(filter);
    fetchPosts(null, filter);
  };

  /**
   * Carrega mais posts
   */
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return;
    await fetchPosts(nextCursor, activeFilter);
  }, [loading, hasMore, nextCursor, activeFilter, fetchPosts]);

  // Buscar posts iniciais
  useEffect(() => {
    fetchPosts(null, activeFilter);
  }, [creatorProfile.user?.id]); // Só recarregar quando o creator mudar

  // Recarregar quando filtro mudar
  useEffect(() => {
    if (posts.length > 0) { // Só filtrar se já temos posts carregados
      const filteredPosts = applyFilter(posts, activeFilter);
      setPosts(filteredPosts);
    }
  }, [activeFilter]);

  return (
    <div className="posts-tab">
      {/* Filtros */}
      <div className="posts-filters">
        <div className="filter-buttons">
          <button
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <Filter size={16} />
            Todos ({posts.length})
          </button>
          <button
            className={`filter-button ${activeFilter === 'free' ? 'active' : ''}`}
            onClick={() => handleFilterChange('free')}
          >
            <Unlock size={16} />
            Gratuitos ({posts.filter(p => !p.isLocked).length})
          </button>
          <button
            className={`filter-button ${activeFilter === 'premium' ? 'active' : ''}`}
            onClick={() => handleFilterChange('premium')}
          >
            <Lock size={16} />
            Premium ({posts.filter(p => p.isLocked).length})
          </button>
        </div>
      </div>

      {/* Lista de posts */}
      <div className="posts-list">
        {posts.length === 0 && !loading ? (
          <div className="empty-posts">
            <p>Nenhum post encontrado</p>
            <p>Este criador ainda não publicou conteúdo.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="post-item">
                <div className="post-thumbnail">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                  {post.isLocked && (
                    <div className="post-locked-overlay">
                      <Lock size={20} />
                    </div>
                  )}
                </div>
                <div className="post-info">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-description">
                    {post.content?.substring(0, 100)}...
                  </p>
                  <div className="post-stats">
                    <span>{post.views || 0} visualizações</span>
                    <span>{post.likes || 0} curtidas</span>
                  </div>
                  <div className="post-date">
                    {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="loading-posts">
                <p>Carregando posts...</p>
              </div>
            )}

            {/* Load more button */}
            {hasMore && !loading && (
              <div className="load-more-container">
                <button
                  className="load-more-button"
                  onClick={loadMorePosts}
                >
                  Carregar mais posts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostsTab;
