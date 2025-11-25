import React, { useState, useEffect, useCallback } from 'react';
import { FeedService } from '../../services/content/FeedService';
import { PopularContentService, type PopularProduct, type PopularPost } from '../../services/content/PopularContentService';
import { extractThumbnailUrl } from '../../utils/mediaUtils';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { ContentItem } from '../../types/content';
import type { CreatorProfile } from '../../types/profile';
import { Filter, Search, Lock, Heart, MessageCircle, Share2, Gift, TrendingUp } from 'lucide-react';
import '../../styles/PostsTabEnhanced.css';

/**
 * Props do componente PostsTabEnhanced
 */
interface PostsTabEnhancedProps {
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
 * Componente PostsTabEnhanced - Versão aprimorada da aba de posts
 * Layout inspirado no Patreon com sidebar e funcionalidades extras
 */
const PostsTabEnhanced: React.FC<PostsTabEnhancedProps> = ({ creatorProfile, currentUserId }) => {
  const [allPosts, setAllPosts] = useState<ContentItem[]>([]);
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  /**
   * Formata número de visualizações
   */
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M visualizações`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K visualizações`;
    } else {
      return `${views} visualizações`;
    }
  };

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
          const mediaUrls = post.media_urls || [];
          const firstMedia = mediaUrls[0];
          const thumbnailUrl = firstMedia ? extractThumbnailUrl(firstMedia) || 'https://placehold.co/400x250/1F2937/FFFFFF?text=POST' : 'https://placehold.co/400x250/1F2937/FFFFFF?text=POST';

          return {
            id: post.id,
            type: 'post' as const,
            title: post.title,
            content: post.content,
            thumbnail: thumbnailUrl,
            author: post.creator?.display_name || post.creator?.name || 'Usuário',
            authorUsername: post.creator?.username,
            authorAvatar: post.creator?.profile_image_url || '',
            views: post.views || 0,
            likes: post.post_likes?.length || 0,
            comments: post.comments?.length || 0,
            timestamp: post.published_at,
            isLocked: !post.hasAccess,
            creatorId: post.creator_id
          };
        });

        // Atualizar posts originais
        if (cursor) {
          setAllPosts(prev => [...prev, ...formattedPosts]);
          setPosts(prev => [...prev, ...applyFilter(formattedPosts, filter, searchQuery)]);
        } else {
          setAllPosts(formattedPosts);
          setPosts(applyFilter(formattedPosts, filter, searchQuery));
        }

        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor || null);
      } else {
        // Posts mockados para demonstração
        const mockPosts: ContentItem[] = [
          {
            id: '1',
            type: 'post',
            title: 'NEW VIDEO: You\'re More Stressed Than Ever - Let\'s Change That',
            content: 'Stress is a biological superpower that helped your ancestors outrun predators, fight off enemies, and survive extreme situations. In the past, it helped us survive, but today, it\'s quietly damaging our bodies and lives. What exactly is stress, how did it evolve, and is it even possible to use it in a healthy way?',
            thumbnail: 'https://placehold.co/400x250/FF424D/FFFFFF?text=STRESS',
            author: creatorProfile.user?.name || 'Creator',
            authorUsername: creatorProfile.user?.username || 'creator',
            authorAvatar: creatorProfile.avatar_url || creatorProfile.user?.avatar_url || 'https://placehold.co/40x40/6B46C1/FFFFFF?text=C',
            views: 15420,
            likes: 35,
            comments: 12,
            timestamp: new Date().toISOString(),
            isLocked: false,
            creatorId: creatorProfile.user?.id || '1'
          },
          {
            id: '2',
            type: 'post',
            title: 'EXCLUSIVE PREVIEW: Our Next Video',
            content: 'Pledge the Producer tier or above to get an exclusive preview of our next video before everyone else.',
            thumbnail: 'https://placehold.co/400x250/6B46C1/FFFFFF?text=PREVIEW',
            author: creatorProfile.user?.name || 'Creator',
            authorUsername: creatorProfile.user?.username || 'creator',
            authorAvatar: creatorProfile.avatar_url || creatorProfile.user?.avatar_url || 'https://placehold.co/40x40/6B46C1/FFFFFF?text=C',
            views: 8930,
            likes: 9,
            comments: 5,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            isLocked: true,
            creatorId: creatorProfile.user?.id || '1'
          }
        ];

        setAllPosts(mockPosts);
        setPosts(applyFilter(mockPosts, filter, searchQuery));
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
  const applyFilter = (posts: ContentItem[], filter: PostFilter, searchQueryParam?: string): ContentItem[] => {
    let filtered = posts;
    const query = searchQueryParam !== undefined ? searchQueryParam : searchQuery;

    // Filtro por tipo
    switch (filter) {
      case 'free':
        filtered = filtered.filter(post => !post.isLocked);
        break;
      case 'premium':
        filtered = filtered.filter(post => post.isLocked);
        break;
      case 'all':
      default:
        break;
    }

    // Filtro por busca
    if (query.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content?.toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered;
  };

  /**
   * Handler para mudança de filtro
   */
  const handleFilterChange = (filter: PostFilter) => {
    setActiveFilter(filter);
    // Aplicar filtro aos posts originais com a query atual
    const filteredPosts = applyFilter(allPosts, filter, searchQuery);
    setPosts(filteredPosts);
  };

  /**
   * Handler para busca
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Aplicar filtro aos posts originais com a nova query
    const filteredPosts = applyFilter(allPosts, activeFilter, query);
    setPosts(filteredPosts);
  };

  /**
   * Carrega mais posts
   */
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return;
    await fetchPosts(nextCursor, activeFilter);
  }, [loading, hasMore, nextCursor, activeFilter, fetchPosts]);

  /**
   * Carrega dados da sidebar (produtos e posts populares)
   */
  const loadSidebarData = useCallback(async () => {
    try {
      setSidebarLoading(true);
      const [products, posts] = await Promise.all([
        PopularContentService.getPopularProducts(5, creatorProfile.user?.id),
        PopularContentService.getPopularPosts(5, currentUserId)
      ]);

      setPopularProducts(products);
      setPopularPosts(posts);
    } catch (error) {
      console.error('Erro ao carregar dados da sidebar:', error);
      // Em caso de erro, manter dados vazios ou fallback
      setPopularProducts([]);
      setPopularPosts([]);
    } finally {
      setSidebarLoading(false);
    }
  }, [creatorProfile.user?.id, currentUserId]);

  // Hook de scroll infinito
  const { sentinelRef, showLoadingRow, setShowLoadingRow } = useInfiniteScroll(
    hasMore,
    loading,
    loadMorePosts
  );

  // Reset loading row quando loading termina
  React.useEffect(() => {
    if (!loading && showLoadingRow) {
      setShowLoadingRow(false);
    }
  }, [loading, showLoadingRow, setShowLoadingRow]);

  // Buscar posts iniciais
  useEffect(() => {
    fetchPosts(null, activeFilter);
  }, [creatorProfile.user?.id]);

  // Carregar dados da sidebar
  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  return (
    <div className="posts-tab-enhanced">
      {/* Header com filtros e busca */}
      <div className="posts-header">
        <h2 className="posts-title">Posts recentes</h2>
        <div className="posts-controls">
          <div className="posts-search-container">
            <Search size={16} className="posts-search-icon" />
            <input
              type="text"
              placeholder="Buscar posts"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="posts-search-input"
            />
          </div>
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="expanded-filters">
          <div className="filter-buttons">
            <button
              className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todos ({allPosts.length})
            </button>
            <button
              className={`filter-button ${activeFilter === 'free' ? 'active' : ''}`}
              onClick={() => handleFilterChange('free')}
            >
              Gratuitos ({allPosts.filter(p => !p.isLocked).length})
            </button>
            <button
              className={`filter-button ${activeFilter === 'premium' ? 'active' : ''}`}
              onClick={() => handleFilterChange('premium')}
            >
              Premium ({allPosts.filter(p => p.isLocked).length})
            </button>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="posts-layout">
        {/* Conteúdo principal */}
        <div className="posts-main">
          <div className="posts-list">
            {posts.length === 0 && !loading ? (
              <div className="empty-posts">
                <p>Nenhum post encontrado</p>
                <p>Este criador ainda não publicou conteúdo.</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <article key={post.id} className="enhanced-post-card">
                    <div className="post-image-container">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="posts-tab-image"
                        style={{
                          width: '100%',
                          height: '400px',
                          objectFit: 'cover',
                          display: 'block',
                          maxWidth: 'none'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x250/1F2937/FFFFFF?text=POST';
                        }}
                      />
                      {post.isLocked && (
                        <div className="post-locked-overlay">
                          <Lock size={24} />
                          <span>Bloqueado</span>
                        </div>
                      )}
                    </div>

                    <div className="enhanced-post-content">
                      <h3 className="post-title">{post.title}</h3>
                      <div className="post-meta">
                        <span className="post-author">{post.author}</span>
                        <span className="post-date">
                          {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="post-description">
                        {post.content && post.content.length > 200
                          ? `${post.content.substring(0, 200)}...`
                          : post.content || 'Sem descrição disponível'}
                      </p>

                      <div className="post-actions">
                        <button className="action-btn like-btn">
                          <Heart size={16} />
                          <span>{post.likes || 0}</span>
                        </button>
                        <button className="action-btn comment-btn">
                          <MessageCircle size={16} />
                          <span>{post.comments || 0}</span>
                        </button>
                        <button className="action-btn share-btn">
                          <Share2 size={16} />
                          Compartilhar
                        </button>
                      </div>

                      {post.isLocked && (
                        <div className="unlock-actions">
                          <button className="unlock-btn primary">
                            Desbloquear com assinatura
                          </button>
                          <button className="unlock-btn secondary">
                            Comprar post BRL 32,50
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                {/* Loading row - Twitter style */}
                {showLoadingRow && (
                  <div className="posts-tab-loading-row">
                    <div className="spinner"></div>
                  </div>
                )}

                {/* Bottom sentinel for infinite scroll */}
                <div ref={sentinelRef} className="posts-tab-sentinel" />
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="posts-sidebar">
          {/* Presentear Assinatura */}
          <div className="sidebar-section gift-section">
            <h3 className="sidebar-title">
              <Gift size={20} />
              Presentear assinatura
            </h3>
            <div className="gift-content">
              <p>Dê a amigos e familiares acesso a trabalhos exclusivos</p>
              <button className="gift-btn">
                <Gift size={16} />
                Presentear
              </button>
            </div>
          </div>

          {/* Produtos Populares */}
          <div className="sidebar-section products-section">
            <h3 className="sidebar-title">
              <TrendingUp size={20} />
              Produtos populares
            </h3>
            {sidebarLoading ? (
              <div className="sidebar-loading">Carregando produtos...</div>
            ) : (
              <div className="products-list">
                {popularProducts.length > 0 ? (
                  popularProducts.map((product) => (
                    <div key={product.id} className="product-item">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="product-thumbnail"
                      />
                      <div className="product-info">
                        <div className="product-date">{product.date}</div>
                        <div className="product-title">{product.title}</div>
                        <div className="product-price">$ {product.price}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sidebar-empty">Nenhum produto encontrado</div>
                )}
              </div>
            )}
          </div>

          {/* Posts Populares */}
          <div className="sidebar-section popular-posts-section">
            <h3 className="sidebar-title">Posts populares</h3>
            {sidebarLoading ? (
              <div className="sidebar-loading">Carregando posts...</div>
            ) : (
              <div className="popular-posts-list">
                {popularPosts.length > 0 ? (
                  popularPosts.map((post) => (
                    <div key={post.id} className="popular-post-item">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="popular-post-thumbnail"
                      />
                      <div className="popular-post-info">
                        <div className="popular-post-title">{post.title}</div>
                        <div className="popular-post-views">{formatViews(post.views)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sidebar-empty">Nenhum post encontrado</div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostsTabEnhanced;
