/**
 * Componente Sidebar
 * Barra lateral com navegação e perfil do usuário
 */
import React, { useCallback, useRef, useEffect } from 'react';
import '../../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Bell, MessageCircle, Users, Building2, Settings, PenTool, User } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../hooks/useAuth';
import { CreateContentModal, CreatePostModal, CreateVideoModal, CreateCommunityModal } from '../modals';
import { ProfileService } from '../../services/auth/ProfileService';
import { FeedService } from '../../services/content/FeedService';
import { ContentService } from '../../services/contentService';
import type { ContentType } from '../modals/CreateContentModal';
import type { CreatorProfile, Post, PostMedia } from '../../types/profile';
import { extractThumbnailUrl, isVideoMedia } from '../../utils/mediaUtils';

// Cache global para prefetch de dados
class GlobalPrefetchCache {
  private static instance: GlobalPrefetchCache;
  private cache: Map<string, {
    type: 'profile' | 'feed';
    profile?: CreatorProfile | null;
    posts?: Post[];
    featuredPost?: Post | null;
    feedItems?: any[];
    timestamp: number;
    loading: boolean;
  }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static getInstance(): GlobalPrefetchCache {
    if (!GlobalPrefetchCache.instance) {
      GlobalPrefetchCache.instance = new GlobalPrefetchCache();
    }
    return GlobalPrefetchCache.instance;
  }

  async prefetchProfile(username: string, userId?: string): Promise<void> {
    if (!username) return;

    const cacheKey = username;
    const cached = this.cache.get(cacheKey);

    // Se já está carregando ou cache é recente, não faz nada
    if (cached?.loading || (cached && Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return;
    }

    // Marca como carregando
    this.cache.set(cacheKey, {
      type: 'profile',
      profile: null,
      posts: [],
      featuredPost: null,
      timestamp: Date.now(),
      loading: true
    });

    try {
      console.log('🚀 Iniciando prefetch do perfil:', username);

      // Buscar dados do creator
      const profileData = await ProfileService.getCreatorByUsername(username);

      if (!profileData) {
        console.log('⚠️ Perfil não encontrado no prefetch');
        this.cache.set(cacheKey, {
          type: 'profile',
          profile: null,
          posts: [],
          featuredPost: null,
          timestamp: Date.now(),
          loading: false
        });
        return;
      }

      // Buscar posts em paralelo
      const postsPromise = FeedService.getCreatorPosts(profileData.user.id, 1, 20, userId);

      // Processar posts
      const postsResult = await postsPromise;
      let formattedPosts: Post[] = [];
      let featuredPost: Post | null = null;

      if (postsResult.posts && postsResult.posts.length > 0) {
        formattedPosts = postsResult.posts.map((post: any) => {
          const mediaUrls: PostMedia[] = post.media_urls || [];
          const firstMedia = mediaUrls[0];
          const thumbnailUrl = firstMedia ? extractThumbnailUrl(firstMedia) || 'placeholder' : 'placeholder';
          const isVideo = firstMedia ? isVideoMedia(firstMedia) : false;

          return {
            id: post.id,
            title: post.title,
            description: post.content,
            thumbnailUrl,
            mediaUrls,
            createdAt: post.published_at,
            views: post.views || 0,
            likes: post.post_likes?.length || 0,
            comments: post.comments || 0,
            locked: post.is_premium,
            contentType: isVideo ? 'video' : (firstMedia ? 'image' : 'text')
          };
        });

        // Calcular featured post
        if (formattedPosts.length > 0) {
          let bestPost = formattedPosts[0];
          let bestScore = this.calculateEngagementScore(bestPost);

          for (const post of formattedPosts) {
            const score = this.calculateEngagementScore(post);
            if (score > bestScore) {
              bestScore = score;
              bestPost = post;
            }
          }
          featuredPost = bestPost;
        }
      }

      // Salvar no cache
      this.cache.set(cacheKey, {
        type: 'profile',
        profile: profileData,
        posts: formattedPosts,
        featuredPost,
        timestamp: Date.now(),
        loading: false
      });

      console.log('✅ Prefetch do perfil concluído:', username);

    } catch (error) {
      console.error('❌ Erro no prefetch do perfil:', error);
      this.cache.set(cacheKey, {
        type: 'profile',
        profile: null,
        posts: [],
        featuredPost: null,
        timestamp: Date.now(),
        loading: false
      });
    }
  }

  getCachedProfile(username: string): {
    profile: CreatorProfile | null;
    posts: Post[];
    featuredPost: Post | null;
  } | null {
    const cached = this.cache.get(username);
    if (cached && !cached.loading && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        profile: cached.profile ?? null,
        posts: cached.posts ?? [],
        featuredPost: cached.featuredPost ?? null
      };
    }
    return null;
  }

  async prefetchFeed(userId?: string): Promise<void> {
    const cacheKey = 'dashboard_feed';
    const cached = this.cache.get(cacheKey);

    // Se já está carregando ou cache é recente, não faz nada
    if (cached?.loading || (cached && Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return;
    }

    // Marca como carregando
    this.cache.set(cacheKey, {
      type: 'feed',
      feedItems: [],
      timestamp: Date.now(),
      loading: true
    });

    try {
      console.log('🚀 Iniciando prefetch do feed do dashboard');

      // Buscar dados do feed usando ContentService
      const { posts } = await ContentService.getFeedPosts(1, 20, userId);

      // Converter posts para ContentItem
      const contentItems = posts.map((post: any) =>
        ContentService.transformToContentItem(post)
      );

      // Inserir sugestões de usuários
      const contentWithSuggestions = ContentService.insertUserSuggestions(
        contentItems,
        0
      );

      // Salvar no cache
      this.cache.set(cacheKey, {
        type: 'feed',
        feedItems: contentWithSuggestions,
        timestamp: Date.now(),
        loading: false
      });

      console.log('✅ Prefetch do feed concluído');

    } catch (error) {
      console.error('❌ Erro no prefetch do feed:', error);
      this.cache.set(cacheKey, {
        type: 'feed',
        feedItems: [],
        timestamp: Date.now(),
        loading: false
      });
    }
  }

  getCachedFeed(): any[] | null {
    const cached = this.cache.get('dashboard_feed');
    if (cached && !cached.loading && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.feedItems ?? [];
    }
    return null;
  }

  private calculateEngagementScore(post: Post): number {
    const views = post.views || 0;
    const likes = post.likes || 0;
    const comments = post.comments || 0;
    return (views * 1) + (likes * 2) + (comments * 3);
  }
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar de navegação principal da aplicação
 * Exibe menu de navegação, criadores em alta e perfil do usuário
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { openModal, closeModal, isModalOpen } = useModal();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefetchTimeoutRef = useRef<number | null>(null);
  const prefetchCache = GlobalPrefetchCache.getInstance();

  // Expor cache globalmente para acesso do ProfilePage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ProfilePrefetchCache = {
        getInstance: () => prefetchCache
      };
    }
  }, [prefetchCache]);

  /**
   * Handler para seleção de tipo de conteúdo no modal principal
   */
  const handleContentTypeSelect = (type: ContentType) => {
    closeModal('createContent'); // Fecha o modal principal
    switch (type) {
      case 'post':
        openModal('createPost');
        break;
      case 'video':
        openModal('createVideo');
        break;
      case 'community':
        // Navegar para página de criação de comunidade
        navigate('/create-community');
        break;
      default:
        console.warn(`Tipo de conteúdo não suportado: ${type}`);
    }
  };

  /**
   * Handler para publicação de post (callback do CreatePostModal)
   */
  const handlePostPublish = (postData: any) => {
    console.log('Post publicado:', postData);
    // TODO: Integrar com API quando implementado
  };

  /**
   * Handler para publicação de vídeo (callback do CreateVideoModal)
   */
  const handleVideoPublish = (videoData: any) => {
    console.log('Vídeo publicado:', videoData);
    // TODO: Integrar com API quando implementado
  };

  /**
   * Handler para criação de comunidade (callback do CreateCommunityModal)
   */
  const handleCommunityCreate = (communityData: any) => {
    console.log('Comunidade criada:', communityData);
    // TODO: Integrar com API quando implementado
  };

  const navigationItems = [
    { icon: <Home size={20} />, label: 'Home', route: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: <Compass size={20} />, label: 'Explore', route: '/explore', active: location.pathname === '/explore' },
    { icon: <Bell size={20} />, label: 'Notifications', route: '/notifications', active: location.pathname === '/notifications' },
    { icon: <MessageCircle size={20} />, label: 'Messages', route: '/messages', active: location.pathname === '/messages' },
    { icon: <Users size={20} />, label: 'Following', route: '/dashboard', active: false }, // TODO: Add following page
    { icon: <Building2 size={20} />, label: 'Communities', route: '/communities', active: location.pathname === '/communities' },
    {
      icon: <User size={20} />,
      label: 'Profile',
      route: '/profile',
      active: location.pathname === '/profile' || location.pathname === `/u/${userProfile?.username}`
    },
    { icon: <Settings size={20} />, label: 'Settings', route: '/settings', active: location.pathname === '/settings' },
  ];

  /**
   * Handler para navegação entre páginas
   */
  const handleNavigation = (route: string) => {
    navigate(route);
    // Fecha sidebar em dispositivos móveis após navegação
    if (onClose) {
      onClose();
    }
  };

  /**
   * Handler para iniciar prefetch quando mouse entra no botão Profile
   */
  const handleProfileHover = useCallback(() => {
    if (!userProfile?.username) return;

    // Limpar timeout anterior se existir
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Iniciar prefetch após 300ms de hover (evita prefetch em hovers rápidos)
    prefetchTimeoutRef.current = window.setTimeout(() => {
      console.log('🔍 Hover detectado no botão Profile, iniciando prefetch...');
      prefetchCache.prefetchProfile(userProfile.username!, userProfile.id);
    }, 300);
  }, [userProfile?.username, userProfile?.id, prefetchCache]);

  /**
   * Handler para iniciar prefetch quando mouse entra no botão Home
   */
  const handleHomeHover = useCallback(() => {
    // Limpar timeout anterior se existir
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Iniciar prefetch após 300ms de hover (evita prefetch em hovers rápidos)
    prefetchTimeoutRef.current = window.setTimeout(() => {
      console.log('🏠 Hover detectado no botão Home, iniciando prefetch do feed...');
      prefetchCache.prefetchFeed(userProfile?.id);
    }, 300);
  }, [userProfile?.id, prefetchCache]);

  /**
   * Handler para cancelar prefetch quando mouse sai dos botões
   */
  const handleLeave = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  /**
   * Handler para fechar sidebar ao clicar no overlay
   */
  const handleOverlayClick = () => {
    if (onClose) {
      onClose();
    }
  };

  /**
   * Handler para prevenir fechamento ao clicar no conteúdo da sidebar
   */
  const handleSidebarContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} onClick={handleSidebarContentClick}>
        <div className="sidebar-content">
          {/* Logo/Brand */}
          <div className="sidebar-header">
            <h1 className="sidebar-logo">Premiora</h1>
          </div>

          {/* Navigation Icons */}
          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {navigationItems.map((item, index) => (
                <li key={index} className="sidebar-nav-item">
                  <button
                    className={`sidebar-nav-button ${item.active ? 'active' : ''}`}
                    aria-label={item.label}
                    title={item.label}
                    onClick={() => handleNavigation(item.route)}
                    onMouseEnter={item.label === 'Profile' ? handleProfileHover : item.label === 'Home' ? handleHomeHover : undefined}
                    onMouseLeave={item.label === 'Profile' || item.label === 'Home' ? handleLeave : undefined}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Create Button */}
          <div className="sidebar-create-section">
            <button
              className="sidebar-create-button"
              onClick={() => openModal('createContent')}
              aria-label="Criar novo conteúdo"
              title="Criar novo conteúdo"
            >
              <PenTool size={20} />
              <span className="sidebar-create-label">Criar</span>
            </button>
          </div>
        </div>

      {/* Modal de criação de conteúdo */}
      <CreateContentModal
        isOpen={isModalOpen('createContent')}
        onClose={() => closeModal('createContent')}
        onSelectContentType={handleContentTypeSelect}
      />

      {/* Modal de criação de post */}
      <CreatePostModal
        isOpen={isModalOpen('createPost')}
        onClose={() => closeModal('createPost')}
        onPublish={handlePostPublish}
      />

      {/* Modal de criação de vídeo */}
      <CreateVideoModal
        isOpen={isModalOpen('createVideo')}
        onClose={() => closeModal('createVideo')}
        onPublish={handleVideoPublish}
      />

      {/* Modal de criação de comunidade */}
      <CreateCommunityModal
        isOpen={isModalOpen('createCommunity')}
        onClose={() => closeModal('createCommunity')}
        onCreate={handleCommunityCreate}
      />
    </aside>
    </>
  );
};

export default Sidebar;
